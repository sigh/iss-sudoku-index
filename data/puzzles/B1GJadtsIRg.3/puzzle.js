// Title: Oct 12, 2021: Eeeeevil Sudoku
// Author: clover. in disguise
// Video: https://www.youtube.com/watch?v=B1GJadtsIRg
// Source: https://tinyurl.com/47jprf2s

// Normal sudoku rules. 1-9 once each in every row, column and 3x3 box.

const givens = [
  ['R2C1', 5],
  ['R2C6', 6],
  ['R2C7', 1],
  ['R3C2', 6],
  ['R3C5', 4],
  ['R3C8', 3],
  ['R4C2', 2],
  ['R4C5', 5],
  ['R4C8', 4],
  ['R5C1', 3],
  ['R5C6', 7],
  ['R5C7', 8],
  ['R6C3', 1],
  ['R7C4', 1],
  ['R7C9', 2],
  ['R8C1', 4],
  ['R8C2', 3],
  ['R8C5', 2],
  ['R8C8', 5],
  ['R9C1', 6],
  ['R9C6', 8],
  ['R9C7', 7],
];

return [
  new Shape('9x9'),
  ...givens.map(([cell, value]) => new Given(cell, value)),
];
