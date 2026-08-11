// Title: July 18, '22: First Impression
// Author: clover!
// Video: https://www.youtube.com/watch?v=5ASNqsZqdtE
// Source: https://tinyurl.com/mr2jc29d

// Normal sudoku rules apply. A digit in a gray cell must be greater than
// both the first digit in its row (that row's column-1 cell) and the
// first digit in its column (that column's row-1 cell). The rules' own
// worked example fixes this reading: gray R4C2 = 6 forces R4C1 and R1C2
// below 6, i.e. the row's/column's own first cell, not e.g. the first
// non-given or first gray cell.

const at = (r, c) => makeCellId(r, c);

// Givens -- transcribed from the puzzle's printed grid.
const givens = [
  [1, 5, 7], [2, 3, 9], [2, 6, 6], [3, 2, 8], [3, 7, 3], [4, 4, 2],
  [4, 8, 5], [5, 1, 5], [5, 9, 8], [6, 2, 4], [6, 6, 3], [7, 3, 7],
  [7, 8, 8], [8, 4, 4], [8, 7, 9], [9, 5, 5],
].map(([r, c, v]) => new Given(at(r, c), v));

// Gray cells -- from the drawn #A8A8A8 cell shading. None sit in row 1
// or column 1, so the row-first/column-first reference cell is always
// distinct from the gray cell being compared.
const grayCells = [
  [2, 4], [2, 6], [2, 8], [4, 2], [4, 4], [4, 5], [4, 6], [4, 8],
  [5, 4], [5, 6], [6, 2], [6, 4], [6, 5], [6, 6], [6, 8], [8, 2],
  [8, 4], [8, 6], [8, 8],
];

// GreaterThan only binds grid-adjacent cell pairs, but each comparison
// here is against a fixed, non-adjacent reference cell, so use a custom
// Pair predicate instead: strict "left value > right value" over 1-9.
const gtKey = Pair.fnToKey((a, b) => a > b, 9);
const grayConstraints = grayCells.flatMap(([r, c]) => [
  new Pair(gtKey, 'gray > row-first', at(r, c), at(r, 1)),
  new Pair(gtKey, 'gray > col-first', at(r, c), at(1, c)),
]);

return [
  new Shape('9x9'),
  ...givens,
  ...grayConstraints,
];
