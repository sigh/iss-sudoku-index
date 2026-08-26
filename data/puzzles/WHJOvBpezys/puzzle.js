// Title: Cracking Classic Sudoku
// Author: 
// Video: https://www.youtube.com/watch?v=WHJOvBpezys
// Source: https://cracking-the-cryptic.web.app/sudoku/3qjmtHmF9Q

// Normal sudoku rules. 1-9 once each in every row, column and 3x3 box.

const givens = [
  ['R1C3', 4],
  ['R1C6', 3],
  ['R1C8', 5],
  ['R2C1', 5],
  ['R2C3', 7],
  ['R2C4', 1],
  ['R2C8', 2],
  ['R3C2', 9],
  ['R3C9', 6],
  ['R4C2', 6],
  ['R4C6', 1],
  ['R4C7', 2],
  ['R5C2', 8],
  ['R5C8', 4],
  ['R6C3', 3],
  ['R6C4', 8],
  ['R6C6', 6],
  ['R7C5', 9],
  ['R7C7', 1],
  ['R8C3', 5],
  ['R8C4', 4],
  ['R8C5', 1],
  ['R8C6', 7],
];

return [
  new Shape('9x9'),
  ...givens.map(([cell, value]) => new Given(cell, value)),
];
