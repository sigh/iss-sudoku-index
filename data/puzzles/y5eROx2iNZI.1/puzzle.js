// Title: Offset Sudoku
// Author: Bill Murphy
// Video: https://www.youtube.com/watch?v=y5eROx2iNZI
// Source: https://tinyurl.com/yn4cpm2f

// Normal Sudoku rules apply. For every lavender cell, its right neighbour gives
// the column in the next row that repeats the lavender cell's digit.
const givens = [
  ['R1C1', 1], ['R1C2', 4], ['R2C2', 2], ['R2C3', 5],
  ['R3C7', 7], ['R3C8', 1], ['R4C8', 8], ['R4C9', 2],
  ['R5C4', 3], ['R5C5', 7], ['R6C5', 4], ['R6C6', 8],
  ['R7C1', 5], ['R7C2', 7], ['R8C2', 3], ['R8C3', 9],
];

// These triples are the drawn lavender cell, its immediate right neighbour,
// and the next row. Each branch chooses that neighbour's column value.
const offsets = [
  ['R1C1', 'R1C2', 2], ['R2C2', 'R2C3', 3], ['R2C4', 'R2C5', 3],
  ['R3C5', 'R3C6', 4], ['R3C7', 'R3C8', 4], ['R4C1', 'R4C2', 5],
  ['R4C8', 'R4C9', 5], ['R5C2', 'R5C3', 6], ['R5C4', 'R5C5', 6],
  ['R6C5', 'R6C6', 7], ['R6C7', 'R6C8', 7], ['R7C1', 'R7C2', 8],
  ['R7C8', 'R7C9', 8], ['R8C2', 'R8C3', 9],
];

function offsetConstraint(highlight, indexCell, nextRow) {
  return new Or(Array.from({length: 9}, (_, index) => index + 1).map(column => new And([
    new Given(indexCell, column),
    new SameValues(2, highlight, makeCellId(nextRow, column)),
  ])));
}

return [
  new Shape('9x9'),
  ...givens.map(([cell, value]) => new Given(cell, value)),
  ...offsets.map(([highlight, indexCell, nextRow]) =>
    offsetConstraint(highlight, indexCell, nextRow)),
];
