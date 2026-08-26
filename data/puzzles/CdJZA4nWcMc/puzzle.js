// Title: Classic Sudoku - Not too Hard
// Author: 
// Video: https://www.youtube.com/watch?v=CdJZA4nWcMc
// Source: https://cracking-the-cryptic.web.app/sudoku/6Rr9hnFdRn

// Normal sudoku rules. 1-9 once each in every row, column and 3x3 box.

const givens = [
  ['R1C2', 5],
  ['R1C4', 3],
  ['R1C8', 7],
  ['R2C1', 1],
  ['R2C5', 2],
  ['R2C7', 8],
  ['R3C2', 2],
  ['R3C4', 4],
  ['R3C6', 9],
  ['R4C3', 3],
  ['R4C4', 1],
  ['R4C7', 7],
  ['R4C9', 6],
  ['R5C2', 4],
  ['R5C5', 6],
  ['R5C8', 5],
  ['R6C1', 5],
  ['R6C3', 6],
  ['R6C6', 3],
  ['R6C7', 4],
  ['R7C4', 8],
  ['R7C6', 2],
  ['R7C8', 3],
  ['R8C3', 7],
  ['R8C5', 9],
  ['R8C9', 2],
  ['R9C2', 6],
  ['R9C6', 1],
  ['R9C8', 8],
];

return [
  new Shape('9x9'),
  ...givens.map(([cell, value]) => new Given(cell, value)),
];
