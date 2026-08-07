// Title: December 13, 2022: Two Sudokus
// Author: clover!
// Video: https://www.youtube.com/watch?v=oh_RAQFadik
// Source: https://tinyurl.com/2gz8fx85

// Two 6x6 grids are drawn side by side on one canvas, separated by an empty
// column. The rules, in full:
//
//   Normal 6x6 sudoku rules apply within each grid. (That is, fill the grid
//   with the digits 1 through 6 so that digits do not repeat in any row,
//   column, or 2x3 region.) Also, digits may never appear in the same position
//   in the two grids. For instance, the top left digit of each grid must be
//   different.
//
// Nothing is omitted.
//
// Both grids share one ISS grid, and ISS makes each 12-cell row all-different
// across the whole width. Left-grid digits are encoded as 1-6 and right-grid
// digits as 7-12 (source digit + 6), so the two halves draw from disjoint value
// ranges: the 12-cell row constraint is then satisfied across the halves for
// free and reduces to each half's own six values being distinct. Columns and
// the 2x3 boxes each lie wholly inside one half, so they need no adjustment.
// The +6 offset is carried into the position rule at the end of the script.

// 6 rows x 12 columns, values 1-12: the two 6x6 grids abutted, gap dropped.
const shape = new Shape('6x12');

// Given digits transcribed from the drawn grids: [row, column, digit], with the
// column measured within that grid (1-6).
const LEFT_GIVENS = [
  [1, 3, 2], [1, 6, 4],
  [2, 1, 1], [2, 4, 3],
  [5, 1, 3], [5, 4, 6],
  [6, 3, 4], [6, 6, 5],
];
const RIGHT_GIVENS = [
  [1, 1, 3], [1, 4, 5],
  [2, 3, 4], [2, 6, 6],
  [4, 1, 2], [4, 5, 1],
  [5, 2, 3], [5, 6, 2],
];

// A grid's column c sits at column c + offset of the shared grid: offset 0 for
// the left grid, 6 for the right one.
const cellFor = (offset, r, c) => makeCellId(r, c + offset);

// One grid's 36 cells: its given, or the six values that grid may use at all.
// The value list is what confines a half to its own range, so it is stated for
// every non-given cell rather than left to be inferred from the row constraint.
const half = (givens, offset) => {
  const clues = new Map(givens.map(
    ([r, c, d]) => [cellFor(offset, r, c), d + offset]));
  const values = [1, 2, 3, 4, 5, 6].map((d) => d + offset);
  const cells = [];
  for (let r = 1; r <= 6; r++) {
    for (let c = 1; c <= 6; c++) cells.push(cellFor(offset, r, c));
  }
  return cells.map((cell) => (clues.has(cell)
    ? new Given(cell, clues.get(cell))
    : new Given(cell, ...values)));
};

// "Digits may never appear in the same position in the two grids": one relation
// per position, between that position's cell in each grid. The right cell holds
// its source digit + 6, so the two source digits are equal exactly when
// b - a === 6, which is the case the predicate forbids.
const DIFFERENT_DIGIT = Pair.fnToKey((a, b) => b - a !== 6, shape);
const positionPairs = [1, 2, 3, 4, 5, 6].flatMap(
  (r) => [1, 2, 3, 4, 5, 6].map((c) => new Pair(
    DIFFERENT_DIGIT, 'same position', cellFor(0, r, c), cellFor(6, r, c))));

return [
  shape,
  // 6-cell regions on a 6x12 grid are 2 rows x 3 columns -- each grid's drawn
  // boxes, three per grid on each side of the join.
  new RegionSize(6),
  ...half(LEFT_GIVENS, 0),
  ...half(RIGHT_GIVENS, 6),
  ...positionPairs,
];
