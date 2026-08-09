// Title: Orchid
// Author: Math Pesto
// Video: https://www.youtube.com/watch?v=JOM2I34cuCI
// Source: https://sudokupad.app/lj4chf65ci

// Rules encoded here:
//  - The 11x11 board holds nine non-overlapping 3x3 regions; every other cell
//    is blank.
//  - Each region contains 1-9 once each.
//  - No digit repeats in a row or a column (blanks may repeat).
//  - Digits on a marked diagonal sum to its clue; blanks contribute nothing.
// Nothing is omitted: there are no givens and no pre-drawn region borders.

// Rows/columns repeat digits, so the grid is Raw: no implicit constraints.
// 0 is a blank, 1-9 a placed digit.
const BLANK = 0;

// VP marks which 3x3 regions are placed: one selector per possible top-left
// corner of a 3x3 block on the 11x11 board, i.e. rows 1-9 x columns 1-9.
const UNUSED = 0;
const SELECTED = 1;
const DIGITS = [1, 2, 3, 4, 5, 6, 7, 8, 9];
const NUM_REGIONS = 9;

const shape = new Shape('11x11', '0-9', 'Raw');
const board = cellGraph(shape);
const cornerGrid = cellGraph('9x9');
const placements = cornerGrid.makeOverlay('VP');
const topLefts = cornerGrid.cells();

const blockAt = topLeft => board.block(topLeft, 3, 3);
const selectorsCovering = cell => placements.at(topLefts
  .filter(topLeft => board.block(topLeft, 3, 3).includes(cell)));

// A selected top-left carries one complete 1-9 region; an unused one places
// nothing. Exactly nine are selected, by the ContainExact below.
const regions = topLefts.map(topLeft => {
  const cells = blockAt(topLeft);
  return new Or([
    new Given(placements.at(topLeft), UNUSED),
    new And([
      new Given(placements.at(topLeft), SELECTED),
      new AllDifferent(...cells),
      ...cells.map(cell => new Given(cell, ...DIGITS)),
    ]),
  ]);
});

// Read one board cell, then every selector whose 3x3 block covers it. A blank
// must have no selected coverer and a digit exactly one, which is coverage and
// non-overlap in a single scan. `needed` is that target, fixed by the first
// symbol; `count` is the running number of selected coverers seen.
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
const memberships = board.cells().map(cell => new NFA(
  membershipMachine, 'region membership', cell, ...selectorsCovering(cell)));

// Raw grid has no houses of its own. `seen` is the bitset of digits already
// used in the line: blanks repeat freely, any other value may appear only once.
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
  ...board.rows().map(row =>
    new NFA(noRepeatedDigitMachine, 'row nonblank digits differ', ...row)),
  ...board.columns().map(column =>
    new NFA(noRepeatedDigitMachine, 'column nonblank digits differ', ...column)),
];

// Drawn arrows outside the board, each with its circled total. Every arrow is a
// 45-degree ray entering at a grid corner; the tuples are
// [total, first row, first column, row step, column step], taken from the
// arrowhead's boundary crossing and direction. Rays include their first cell
// and run to the far edge.
const DIAGONALS = [
  [18, 1, 4, 1, -1],
  [3, 1, 5, 1, -1],
  [27, 1, 6, 1, -1],
  [6, 1, 7, 1, -1],
  [8, 6, 1, 1, 1],
  [11, 6, 11, -1, -1],
  [14, 1, 9, 1, -1],
  [22, 7, 1, 1, 1],
  [29, 4, 1, 1, 1],
  [13, 8, 1, 1, 1],
  [17, 1, 10, 1, -1],
  [33, 5, 11, 1, -1],
  [30, 1, 3, 1, 1],
];
const diagonalSums = DIAGONALS.map(([total, row, col, dRow, dCol]) =>
  new Sum(total, ...board.ray(makeCellId(row, col), dRow, dCol)));

return [
  shape,
  placements.toVar('selected 3x3 top-left corners'),
  placements.makeReplicate(new Given(placements.cells()[0], UNUSED, SELECTED)),
  new ContainExact(Array(NUM_REGIONS).fill(SELECTED).join('_'), ...placements.cells()),
  ...regions,
  ...memberships,
  ...rowAndColumnUniqueness,
  ...diagonalSums,
];
