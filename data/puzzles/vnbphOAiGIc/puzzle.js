// Title: Classic Sudoku from Logic Masters India
// Author: 
// Video: https://www.youtube.com/watch?v=vnbphOAiGIc
// Source: https://cracking-the-cryptic.web.app/sudoku/9rF4Ddghpf

// Normal sudoku rules. 1-9 once each in every row, column and 3x3 box.

const givens = [
  ['R1C2', 9],
  ['R1C5', 1],
  ['R2C1', 1],
  ['R2C3', 8],
  ['R2C6', 3],
  ['R3C2', 2],
  ['R3C4', 7],
  ['R3C7', 5],
  ['R4C3', 3],
  ['R4C5', 6],
  ['R4C8', 7],
  ['R5C1', 2],
  ['R5C4', 4],
  ['R5C6', 1],
  ['R5C9', 9],
  ['R6C2', 1],
  ['R6C5', 5],
  ['R6C7', 2],
  ['R7C3', 9],
  ['R7C6', 6],
  ['R7C8', 3],
  ['R8C4', 9],
  ['R8C7', 7],
  ['R8C9', 4],
  ['R9C5', 7],
  ['R9C8', 8],
];

return [
  new Shape('9x9'),
  ...givens.map(([cell, value]) => new Given(cell, value)),
];
