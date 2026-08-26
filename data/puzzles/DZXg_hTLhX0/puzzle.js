// Title: Bonus Classic: Vicious Sudoku?
// Author: 
// Video: https://www.youtube.com/watch?v=DZXg_hTLhX0
// Source: https://cracking-the-cryptic.web.app/sudoku/Qj3m4RJnbT

// Normal sudoku rules. 1-9 once each in every row, column and 3x3 box.

const givens = [
  ['R1C1', 1],
  ['R1C4', 2],
  ['R1C6', 3],
  ['R1C7', 8],
  ['R2C3', 4],
  ['R2C5', 5],
  ['R3C1', 6],
  ['R3C9', 7],
  ['R4C3', 2],
  ['R4C5', 9],
  ['R4C6', 5],
  ['R4C8', 3],
  ['R5C2', 8],
  ['R5C8', 1],
  ['R6C2', 4],
  ['R6C4', 1],
  ['R6C5', 2],
  ['R6C7', 6],
  ['R7C1', 4],
  ['R7C9', 1],
  ['R8C5', 3],
  ['R8C7', 9],
  ['R9C3', 7],
  ['R9C4', 4],
  ['R9C6', 2],
  ['R9C9', 6],
];

return [
  new Shape('9x9'),
  ...givens.map(([cell, value]) => new Given(cell, value)),
];
