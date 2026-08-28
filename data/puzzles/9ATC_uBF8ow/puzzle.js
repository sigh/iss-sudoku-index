// Title: XV Sudoku
// Author: Arvid Baars
// Video: https://www.youtube.com/watch?v=9ATC_uBF8ow
// Source: https://cracking-the-cryptic.web.app/sudoku/Q662MLHGt4

// Normal sudoku rules apply. ALL horizontally and vertically neighbouring
// digits with the sum 10 are marked with X; ALL horizontally and vertically
// neighbouring digits with the sum 5 are marked with V. "ALL" is exhaustive,
// so StrictXV additionally forbids sum-10 and sum-5 on every unmarked
// adjacent pair (no V is drawn anywhere in this puzzle, so no adjacent pair
// in the whole grid sums to 5).

const givens = [
  // Drawn digits from `cells`, rows 6-8 only.
  ['R6C2', 5], ['R6C4', 3], ['R6C6', 8], ['R6C8', 2],
  ['R7C1', 2], ['R7C3', 5], ['R7C5', 3], ['R7C7', 6], ['R7C9', 9],
  ['R8C2', 9], ['R8C4', 4], ['R8C6', 6], ['R8C8', 1],
];

// Drawn X edges, from `overlays` (each a vertical edge between two cells
// stacked in the same column).
const xEdges = [
  ['R2C2', 'R3C2'],
  ['R1C3', 'R2C3'],
  ['R3C3', 'R4C3'],
  ['R2C4', 'R3C4'],
  ['R1C5', 'R2C5'],
  ['R3C5', 'R4C5'],
  ['R2C6', 'R3C6'],
  ['R1C7', 'R2C7'],
  ['R3C7', 'R4C7'],
  ['R2C8', 'R3C8'],
];

return [
  new Shape('9x9'),
  ...givens.map(([cell, value]) => new Given(cell, value)),
  ...xEdges.map(([a, b]) => new X(a, b)),
  // Enforces the "ALL" exhaustiveness: no unmarked adjacent pair sums to 10
  // or 5.
  new StrictXV(),
];
