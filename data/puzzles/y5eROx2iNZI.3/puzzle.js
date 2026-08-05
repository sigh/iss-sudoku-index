// Title: 10/12/22: A Little Sum Thing
// Author: Philip Newman
// Video: https://www.youtube.com/watch?v=y5eROx2iNZI
// Source: https://tinyurl.com/3mbsakym

// Normal Sudoku rules apply. Each outside X-Sum clue gives the sum of the first
// X digits read inward, where the adjacent digit is X.
const givens = [
  ['R2C2', 1], ['R2C5', 2], ['R2C8', 3],
  ['R5C2', 4], ['R5C5', 5], ['R5C8', 6],
  ['R8C2', 7], ['R8C5', 8], ['R8C8', 9],
];

// The source's twelve drawn X-Sum badges, listed with each inward row or column.
const xSums = [
  [9,  ['R1C2', 'R2C2', 'R3C2', 'R4C2', 'R5C2', 'R6C2', 'R7C2', 'R8C2', 'R9C2']],
  [19, ['R9C8', 'R8C8', 'R7C8', 'R6C8', 'R5C8', 'R4C8', 'R3C8', 'R2C8', 'R1C8']],
  [13, ['R1C5', 'R2C5', 'R3C5', 'R4C5', 'R5C5', 'R6C5', 'R7C5', 'R8C5', 'R9C5']],
  [18, ['R9C5', 'R8C5', 'R7C5', 'R6C5', 'R5C5', 'R4C5', 'R3C5', 'R2C5', 'R1C5']],
  [8,  ['R5C9', 'R5C8', 'R5C7', 'R5C6', 'R5C5', 'R5C4', 'R5C3', 'R5C2', 'R5C1']],
  [14, ['R5C1', 'R5C2', 'R5C3', 'R5C4', 'R5C5', 'R5C6', 'R5C7', 'R5C8', 'R5C9']],
  [13, ['R8C9', 'R8C8', 'R8C7', 'R8C6', 'R8C5', 'R8C4', 'R8C3', 'R8C2', 'R8C1']],
  [30, ['R8C1', 'R8C2', 'R8C3', 'R8C4', 'R8C5', 'R8C6', 'R8C7', 'R8C8', 'R8C9']],
  [5,  ['R1C8', 'R2C8', 'R3C8', 'R4C8', 'R5C8', 'R6C8', 'R7C8', 'R8C8', 'R9C8']],
  [20, ['R2C1', 'R2C2', 'R2C3', 'R2C4', 'R2C5', 'R2C6', 'R2C7', 'R2C8', 'R2C9']],
  [40, ['R2C9', 'R2C8', 'R2C7', 'R2C6', 'R2C5', 'R2C4', 'R2C3', 'R2C2', 'R2C1']],
  [45, ['R9C2', 'R8C2', 'R7C2', 'R6C2', 'R5C2', 'R4C2', 'R3C2', 'R2C2', 'R1C2']],
];

const geometry = cellGeometry('9x9');

return [
  new Shape('9x9'),
  ...givens.map(([cell, value]) => new Given(cell, value)),
  ...xSums.map(([total, cells]) => XSum.fromCells(total, cells, geometry)),
];
