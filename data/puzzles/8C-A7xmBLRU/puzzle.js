// Title: Beyond Diabolical... Sudoku Madness!
// Author: 
// Video: https://www.youtube.com/watch?v=8C-A7xmBLRU
// Source: https://cracking-the-cryptic.web.app/sudoku/pG7NL9f68f

// Normal sudoku rules. 1-9 once each in every row, column and 3x3 box.

const givens = [
  ['R1C1', 1],
  ['R1C4', 4],
  ['R1C7', 7],
  ['R2C2', 2],
  ['R2C5', 5],
  ['R2C8', 8],
  ['R3C3', 3],
  ['R3C6', 6],
  ['R3C9', 9],
  ['R4C2', 1],
  ['R4C5', 4],
  ['R4C8', 7],
  ['R5C3', 2],
  ['R5C6', 5],
  ['R5C9', 8],
  ['R6C1', 9],
  ['R6C4', 3],
  ['R6C7', 6],
  ['R7C1', 7],
  ['R7C6', 8],
  ['R7C9', 2],
  ['R8C1', 8],
  ['R8C4', 2],
  ['R8C7', 9],
  ['R9C2', 9],
  ['R9C5', 7],
  ['R9C8', 1],
];

return [
  new Shape('9x9'),
  ...givens.map(([cell, value]) => new Given(cell, value)),
];
