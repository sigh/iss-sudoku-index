// Title: Is This a Beastly Sudoku?
// Author: 
// Video: https://www.youtube.com/watch?v=__iuI88zmvY
// Source: https://cracking-the-cryptic.web.app/sudoku/nhpnRp73fJ

// Normal sudoku rules. 1-9 once each in every row, column and 3x3 box.

const givens = [
  ['R1C1', 7],
  ['R1C2', 6],
  ['R1C4', 1],
  ['R1C7', 5],
  ['R1C9', 8],
  ['R2C1', 5],
  ['R2C5', 7],
  ['R2C6', 4],
  ['R3C2', 3],
  ['R4C4', 6],
  ['R4C5', 5],
  ['R4C6', 8],
  ['R6C3', 3],
  ['R6C7', 2],
  ['R6C9', 4],
  ['R7C2', 7],
  ['R7C4', 2],
  ['R8C4', 5],
  ['R8C9', 6],
  ['R9C6', 3],
  ['R9C8', 9],
  ['R9C9', 1],
];

return [
  new Shape('9x9'),
  ...givens.map(([cell, value]) => new Given(cell, value)),
];
