// Title: Stripe Sudoku
// Author: 
// Video: https://www.youtube.com/watch?v=N3j2pPheCpw
// Source: https://cracking-the-cryptic.web.app/sudoku/TPMRr8mpgJ

// Normal sudoku rules. 1-9 once each in every row, column and 3x3 box.

const givens = [
  ['R1C8', 1],
  ['R1C9', 2],
  ['R2C7', 3],
  ['R2C8', 4],
  ['R2C9', 5],
  ['R3C6', 3],
  ['R3C7', 6],
  ['R3C8', 7],
  ['R4C5', 8],
  ['R4C6', 1],
  ['R4C7', 5],
  ['R5C4', 7],
  ['R5C5', 5],
  ['R5C6', 4],
  ['R6C3', 4],
  ['R6C4', 2],
  ['R6C5', 3],
  ['R7C2', 6],
  ['R7C3', 7],
  ['R7C4', 9],
  ['R8C1', 3],
  ['R8C2', 1],
  ['R8C3', 2],
  ['R9C1', 8],
  ['R9C2', 5],
];

return [
  new Shape('9x9'),
  ...givens.map(([cell, value]) => new Given(cell, value)),
];
