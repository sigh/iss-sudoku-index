// Title: On the Straightened Arrow
// Author: Marty Sears
// Video: https://www.youtube.com/watch?v=cIYn8EmAmi0
// Source: https://sudokupad.app/6gskgmgmfv

// Rules encoded: normal sudoku (default rows/columns/3x3 boxes); Yin Yang Yong
// 3-colouring (each colour orthogonally connected, no monochrome 2x2); each
// cell's "value" = 2x digit (red) / digit (yellow) / digit/2 (blue);
// straightened little killers = full row/column sums of value, not digit;
// equal value lines = two named cells share the same value.
//
// A cell's value is never a fixed-range grid cell: it depends on both its
// colour and digit, and the puzzle's own grid is already at ISS's 16-value
// shape cap, so it cannot be widened to hold values up to 18 (2x a digit).
// Every rule below is instead expressed as a state machine that computes
// value on the fly from [colour, digit] pairs, carrying the (unbounded)
// running total or comparison in NFA state rather than in a grid cell. To
// keep values as plain integers (a blue cell's value is a digit/2, which is
// fractional for an odd digit), every value is tracked DOUBLED: red's 2x
// digit becomes 4x digit, yellow's digit becomes 2x digit, and blue's
// digit/2 becomes digit. Doubling both sides of a sum or an equality
// preserves it exactly, so outside-clue totals are compared as 2*total.

const RED = 1, YELLOW = 2, BLUE = 3;
// Doubled-value multiplier per colour.
const DOUBLED_MULT = { [RED]: 4, [YELLOW]: 2, [BLUE]: 1 };

const graph = cellGraph('9x9');
const gridCells = graph.cells();
const color = graph.makeOverlay('VC');

// Every colour cell is red, yellow, or blue.
const colorDomain = color.makeReplicate(
  new Given(color.cells()[0], RED, YELLOW, BLUE));

// A [colour, digit] pair, in that order, for one cell.
const coloredCell = cell => [color.at(cell), cell];

// No 2x2 block of colours is monochrome: scan a block's 4 cells and accept as
// soon as one differs from the first.
const noMono2x2Spec = NFA.encodeSpec({
  startState: { seen: [] },
  transition: ({ seen, done }, value) => {
    if (done === true) return { done: true };
    const next = [...seen, value];
    if (next.length < 4) return { seen: next };
    return next.every(v => v === next[0]) ? undefined : { done: true };
  },
  accept: ({ done }) => done === true,
}, 3);
const blockOrigins = gridCells.filter(cell => graph.block(cell, 2, 2));
const noMono2x2 = color.makeReplicate(
  new NFA(noMono2x2Spec, 'no-mono-2x2', ...color.at(graph.block(gridCells[0], 2, 2))),
  color.at(blockOrigins));

// Straightened little killers: full row/column sums of value, not digit. One
// row (R6) and one column (C5) carry no such clue. Builds one NFA per total,
// scanning [colour, digit] pairs for the 9 cells and accumulating the
// doubled running sum in state (clamped at target+1, since every
// contribution is positive so an already-exceeded sum can never recover).
function lineTotalSpec(doubledTarget) {
  return NFA.encodeSpec({
    startState: { phase: 'colour', sum: 0 },
    transition: (state, value) => {
      if (state.phase === 'colour') {
        const mult = DOUBLED_MULT[value];
        return mult === undefined ? undefined : { phase: 'digit', mult, sum: state.sum };
      }
      // state.phase === 'digit'
      const sum = Math.min(state.sum + state.mult * value, doubledTarget + 1);
      return { phase: 'colour', sum };
    },
    accept: (state) => state.phase === 'colour' && state.sum === doubledTarget,
  }, 9);
}
const ROW_TOTALS = { 1: 54, 2: 33, 3: 50, 4: 45, 6: 55, 7: 48, 8: 78, 9: 41 };
const COL_TOTALS = { 1: 44, 2: 23, 3: 42, 4: 72, 6: 37, 7: 50, 8: 89, 9: 48 };
const rowSums = Object.entries(ROW_TOTALS).map(([row, total]) => new NFA(
  lineTotalSpec(2 * total), `row ${row} value total`,
  ...graph.row(Number(row)).flatMap(coloredCell)));
const colSums = Object.entries(COL_TOTALS).map(([col, total]) => new NFA(
  lineTotalSpec(2 * total), `col ${col} value total`,
  ...graph.column(Number(col)).flatMap(coloredCell)));

// Equal value lines: each blue line joins exactly one pair of cells to the
// same value. One shared NFA scans [colourA, digitA, colourB, digitB] and
// accepts iff the two doubled values match (equality is preserved by
// doubling both sides).
const equalValueSpec = NFA.encodeSpec({
  startState: { phase: 'colourA' },
  transition: (state, value) => {
    switch (state.phase) {
      case 'colourA': {
        const mult = DOUBLED_MULT[value];
        return mult === undefined ? undefined : { phase: 'digitA', mult };
      }
      case 'digitA':
        return { phase: 'colourB', target: state.mult * value };
      case 'colourB': {
        const mult = DOUBLED_MULT[value];
        return mult === undefined
          ? undefined : { phase: 'digitB', mult, target: state.target };
      }
      case 'digitB':
        return value * state.mult === state.target ? { phase: 'done' } : undefined;
    }
  },
  accept: (state) => state.phase === 'done',
}, 9);
const EQUAL_VALUE_PAIRS = [
  ['R1C2', 'R2C2'],
  ['R6C5', 'R5C6'],
  ['R5C7', 'R4C8'],
];
const equalValueLines = EQUAL_VALUE_PAIRS.map(([a, b]) => new NFA(
  equalValueSpec, `equal value ${a}-${b}`,
  ...coloredCell(a), ...coloredCell(b)));

return [
  new Shape('9x9'),
  color.toVar('colour'),
  colorDomain,
  // Yin Yang Yong connectivity: each colour forms one orthogonally connected
  // region.
  new ConnectedValues('VC', RED),
  new ConnectedValues('VC', YELLOW),
  new ConnectedValues('VC', BLUE),
  noMono2x2,
  ...rowSums,
  ...colSums,
  ...equalValueLines,
];
