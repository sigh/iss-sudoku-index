// Title: Sudoku at its Most Elegant
// Author: 
// Video: https://www.youtube.com/watch?v=A64ktXOXjvc
// Source: https://cracking-the-cryptic.web.app/sudoku/Qnpd7Mgt6R

// Normal sudoku rules. 1-9 once each in every row, column and 3x3 box.

const givens = [
  ['R1C3', 1],
  ['R1C5', 4],
  ['R1C7', 3],
  ['R2C1', 6],
  ['R2C4', 7],
  ['R2C6', 2],
  ['R3C2', 3],
  ['R3C4', 6],
  ['R4C2', 9],
  ['R4C3', 7],
  ['R4C4', 8],
  ['R4C7', 1],
  ['R4C8', 5],
  ['R5C3', 6],
  ['R5C7', 8],
  ['R6C2', 8],
  ['R6C3', 4],
  ['R6C6', 7],
  ['R6C7', 6],
  ['R6C8', 3],
  ['R7C6', 3],
  ['R7C8', 4],
  ['R8C4', 4],
  ['R8C6', 9],
  ['R8C9', 6],
  ['R9C3', 2],
  ['R9C5', 5],
  ['R9C7', 9],
];

return [
  new Shape('9x9'),
  ...givens.map(([cell, value]) => new Given(cell, value)),
];
