// Title: Techniques for Starting Hard Sudokus
// Author: 
// Video: https://www.youtube.com/watch?v=jN6jveTebHw
// Source: https://cracking-the-cryptic.web.app/sudoku/h97M9bnjR4

// Normal sudoku rules. 1-9 once each in every row, column and 3x3 box.

const givens = [
  ['R1C1', 8],
  ['R1C4', 4],
  ['R1C6', 6],
  ['R1C9', 3],
  ['R2C3', 9],
  ['R2C8', 2],
  ['R3C9', 1],
  ['R4C4', 8],
  ['R4C7', 4],
  ['R5C2', 6],
  ['R5C8', 1],
  ['R6C3', 3],
  ['R6C6', 2],
  ['R6C9', 9],
  ['R7C1', 7],
  ['R7C3', 2],
  ['R7C5', 3],
  ['R8C2', 4],
  ['R8C7', 5],
  ['R9C1', 5],
  ['R9C4', 7],
  ['R9C6', 9],
  ['R9C9', 8],
];

return [
  new Shape('9x9'),
  ...givens.map(([cell, value]) => new Given(cell, value)),
];
