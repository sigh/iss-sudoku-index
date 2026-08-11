// Title: Deconstruction: X-Sums
// Author: Jesper
// Video: https://www.youtube.com/watch?v=etCqE5cseaY
// Source: https://app.crackingthecryptic.com/sudoku/D6NT6LHTHP

// Rules encoded here:
//   Deconstruction: nine non-overlapping 3x3 regions are hidden in the 11x11
//   board; each holds 1-9, no value repeats in a row or column, and a cell
//   outside every region has value 0.
//   Outside X-sums: the clue is the sum of the digits (0 for a cell outside
//   every region) in the first X cells counted from the clue inward, where X
//   is the value of the first digit reached looking that direction (skipping
//   any region-less cells before it). "The first digit in that direction"
//   reads as the first digit encountered, not the digit of the first cell:
//   only that reading keeps every clue coherent, since several first cells
//   are region-less and a rule pinned to "the first cell's digit" would leave
//   X undefined for those lanes with no fallback the rules state. It also
//   explains the two printed 0 clues plainly: the window (the first X cells)
//   closes before it ever reaches the first placed digit, so every cell in
//   the window is region-less and the sum is 0.
// Nothing is omitted.

// The board's rows repeat the value 0, so the 11x11 board is Raw: an
// ordinary main grid (R1C1..R11C11) with no implicit constraints, 0 for a
// cell outside every region and 1-9 for a placed digit. VP is a second 9x9
// group of the 81 possible 3x3 top-left corners, 1 meaning that region is
// selected.

const BLANK = 0;
const UNUSED = 0;
const SELECTED = 1;
const DIGITS = [1, 2, 3, 4, 5, 6, 7, 8, 9];

const shape = new Shape('11x11', '0-9', 'Raw');
const canvas = cellGraph(shape);
const placementGrid = cellGraph('9x9');
const placements = placementGrid.makeOverlay('VP');
const topLefts = placementGrid.cells();
const cells = coordinates => coordinates.map(([row, col]) => makeCellId(row, col));

const blockAt = topLeft => canvas.block(topLeft, 3, 3);
const selectorsCovering = cell => placements.at(topLefts
  .filter(topLeft => canvas.block(topLeft, 3, 3).includes(cell)));

const selectedValues = Array(9).fill(SELECTED).join('_');

// A selected top-left creates one complete 1-9 region; an unused top-left has
// no digit effect. Exactly nine selectors are selected below.
const regions = topLefts.map(topLeft => {
  const blockCells = blockAt(topLeft);
  return new Or([
    new Given(placements.at(topLeft), UNUSED),
    new And([
      new Given(placements.at(topLeft), SELECTED),
      new AllDifferent(...blockCells),
      ...blockCells.map(cell => new Given(cell, ...DIGITS)),
    ]),
  ]);
});

// A blank has no selected covering placement; a digit has exactly one. This
// simultaneously enforces region coverage and non-overlap. The first symbol is
// the board value, which sets the required count; the rest are its covering
// selectors, which are summed.
const membershipMachine = NFA.encodeSpec({
  startState: { needed: null, count: 0 },
  transition: ({ needed, count }, value) => {
    if (needed === null) {
      return { needed: value === BLANK ? 0 : 1, count: 0 };
    }
    if (value !== UNUSED && value !== SELECTED) return undefined;
    const next = count + value;
    return next <= needed ? { needed, count: next } : undefined;
  },
  accept: ({ needed, count }) => needed !== null && count === needed,
}, shape);
const memberships = canvas.cells().map(cell => new NFA(
  membershipMachine, 'region membership', cell, ...selectorsCovering(cell)));

// Ignore repeated zeroes, but reject a second occurrence of any placed digit.
// The state is a bitmask of the digits seen so far.
const noRepeatedDigitMachine = NFA.encodeSpec({
  startState: 0,
  transition: (seen, value) => {
    if (value === BLANK) return seen;
    const bit = 1 << (value - 1);
    return seen & bit ? undefined : seen | bit;
  },
  accept: () => true,
}, shape);
const rowAndColumnUniqueness = [
  ...canvas.rows().map(row =>
    new NFA(noRepeatedDigitMachine, 'row nonblank digits differ', ...row)),
  ...canvas.columns().map(column =>
    new NFA(noRepeatedDigitMachine, 'column nonblank digits differ', ...column)),
];

// Outside X-sum clues (direction, row-or-column index, printed sum), as
// drawn around the grid margin. All 16 outside-clue overlays are listed here.
const OUTSIDE_CLUES = [
  ['top', 3, 2], ['top', 5, 17], ['top', 8, 0], ['top', 11, 15],
  ['left', 1, 10], ['left', 2, 22], ['left', 3, 0], ['left', 5, 14], ['left', 10, 18],
  ['right', 2, 40], ['right', 5, 6], ['right', 11, 25],
  ['bottom', 3, 16], ['bottom', 5, 11], ['bottom', 7, 32], ['bottom', 9, 18],
];

// Cells of one lane, ordered from the clue inward.
const laneCells = (direction, index) => {
  const line = [];
  if (direction === 'top') for (let r = 1; r <= 11; r++) line.push([r, index]);
  else if (direction === 'bottom') for (let r = 11; r >= 1; r--) line.push([r, index]);
  else if (direction === 'left') for (let c = 1; c <= 11; c++) line.push([index, c]);
  else for (let c = 11; c >= 1; c--) line.push([index, c]);
  return cells(line);
};

// State machine for one outside clue with printed total `target`:
//   phase 'seeking' (X not found yet): count position (clamped at 10, since
//     X <= 9 makes any position >= 10 behave the same as "past the window"),
//     add nothing to sum (a region-less cell contributes 0 regardless).
//   On the first nonzero value at clamped position p: X = value. If p <= X
//     the window (positions 1..X) still needs (X - p) more cells and this
//     cell's own value joins the sum; if p > X the window already closed
//     before this digit, so it contributes 0 and the window is done.
//   phase 'window': add every further value (0 or digit) until the window's
//     remaining count reaches 0, then close.
//   phase 'closed': ignore all further values.
// Accept only once X was found (phase left 'seeking') and the accumulated
// sum equals the printed target.
const outsideXSumMachine = target => NFA.encodeSpec({
  startState: { phase: 'seeking', pos: 0, remaining: 0, sum: 0 },
  transition: (state, value) => {
    if (state.phase === 'seeking') {
      const pos = Math.min(state.pos + 1, 10);
      if (value === BLANK) return { phase: 'seeking', pos, remaining: 0, sum: 0 };
      const x = value;
      if (pos > x) return { phase: 'closed', pos: 0, remaining: 0, sum: 0 };
      const remaining = x - pos;
      const sum = Math.min(value, target + 1);
      return remaining === 0
        ? { phase: 'closed', pos: 0, remaining: 0, sum }
        : { phase: 'window', pos: 0, remaining, sum };
    }
    if (state.phase === 'window') {
      const sum = Math.min(state.sum + value, target + 1);
      const remaining = state.remaining - 1;
      return remaining === 0
        ? { phase: 'closed', pos: 0, remaining: 0, sum }
        : { phase: 'window', pos: 0, remaining, sum };
    }
    return state;
  },
  accept: state => state.phase !== 'seeking' && state.sum === target,
}, shape);
const outsideXSums = OUTSIDE_CLUES.map(([direction, index, target]) => new NFA(
  outsideXSumMachine(target), `outside x-sum ${direction} ${index}`,
  ...laneCells(direction, index)));

return [
  shape,
  placements.toVar('selected 3x3 top-left corners'),
  placements.makeReplicate(new Given(placements.cells()[0], UNUSED, SELECTED)),
  new ContainExact(selectedValues, ...placements.cells()),
  ...regions,
  ...memberships,
  ...rowAndColumnUniqueness,
  ...outsideXSums,
];
