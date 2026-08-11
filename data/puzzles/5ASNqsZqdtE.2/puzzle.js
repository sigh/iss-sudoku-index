// Title: 7/20/22: A Lasting Impression
// Author: Philip Newman
// Video: https://www.youtube.com/watch?v=5ASNqsZqdtE
// Source: https://tinyurl.com/s6p943s3

// Standard 9x9 sudoku (rows/columns/boxes all-different, from the default
// Shape) plus: a grey cell's digit must lie between its row's leftmost
// (column 1) and rightmost (column 9) digits, and between its column's
// topmost (row 1) and bottommost (row 9) digits. Every grey cell here is
// itself a given, so the rule constrains the row/column endpoint cells,
// which are unknowns.
//
// Between(a, b, c) enforces b strictly between a and c regardless of which
// of a/c is larger, which is exactly "between the left/right- or top/bottom-
// most digits" here. It also forces its two end cells apart, but that
// already holds from row/column all-different, so the side effect is
// redundant, not a relaxation.

const givens = [
  ['R1C9', 1], ['R2C5', 9],
  ['R3C3', 2], ['R3C4', 3], ['R3C6', 4], ['R3C7', 5],
  ['R4C3', 6], ['R4C4', 4], ['R4C7', 7],
  ['R5C2', 8], ['R5C5', 5], ['R5C8', 1],
  ['R6C3', 3], ['R6C6', 6], ['R6C7', 4],
  ['R7C3', 5], ['R7C4', 6], ['R7C6', 7], ['R7C7', 8],
  ['R8C5', 2],
  ['R9C1', 9],
];

// Grey cells, from the source's #A8A8A8-shaded givens.
const greyCells = [
  'R3C3', 'R3C4', 'R3C6', 'R3C7',
  'R4C3', 'R4C7',
  'R6C3', 'R6C7',
  'R7C3', 'R7C4', 'R7C6', 'R7C7',
];

const betweenConstraints = greyCells.flatMap(cell => {
  const { row, col } = parseCellId(cell);
  return [
    new Between(makeCellId(row, 1), cell, makeCellId(row, 9)),
    new Between(makeCellId(1, col), cell, makeCellId(9, col)),
  ];
});

return [
  new Shape('9x9'),
  ...givens.map(([cell, v]) => new Given(cell, v)),
  ...betweenConstraints,
];
