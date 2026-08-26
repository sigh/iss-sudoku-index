// Title: Techniques for Hard Classic Sudoku
// Author: 
// Video: https://www.youtube.com/watch?v=mFcnfGW2SYY
// Source: https://cracking-the-cryptic.web.app/sudoku/FhhGMpjtdr

// Normal sudoku rules. 1-9 once each in every row, column and 3x3 box.

const givens = [
  ['R1C5', 5],
  ['R1C7', 7],
  ['R1C9', 2],
  ['R2C1', 8],
  ['R2C8', 6],
  ['R3C4', 1],
  ['R3C8', 5],
  ['R3C9', 4],
  ['R4C5', 3],
  ['R5C1', 1],
  ['R5C2', 3],
  ['R5C4', 7],
  ['R5C5', 6],
  ['R5C8', 8],
  ['R6C2', 6],
  ['R6C3', 4],
  ['R6C7', 1],
  ['R7C1', 3],
  ['R7C2', 1],
  ['R7C3', 2],
  ['R7C5', 8],
  ['R8C2', 9],
  ['R8C6', 5],
  ['R9C6', 3],
  ['R9C7', 9],
];

return [
  new Shape('9x9'),
  ...givens.map(([cell, value]) => new Given(cell, value)),
];
