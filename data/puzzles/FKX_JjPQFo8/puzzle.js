// Title: Diabolical Sudoku With A Classy Finish
// Author: 
// Video: https://www.youtube.com/watch?v=FKX_JjPQFo8
// Source: https://cracking-the-cryptic.web.app/sudoku/mDbH63GThm

// Normal sudoku rules. 1-9 once each in every row, column and 3x3 box.

const givens = [
  ['R1C1', 7],
  ['R1C2', 6],
  ['R1C4', 3],
  ['R1C7', 5],
  ['R2C9', 7],
  ['R3C2', 5],
  ['R3C3', 8],
  ['R3C7', 1],
  ['R4C2', 3],
  ['R4C3', 4],
  ['R4C7', 7],
  ['R5C5', 5],
  ['R5C8', 3],
  ['R6C7', 2],
  ['R6C8', 6],
  ['R6C9', 4],
  ['R7C2', 8],
  ['R7C3', 5],
  ['R7C4', 6],
  ['R7C6', 2],
  ['R8C3', 3],
  ['R8C4', 4],
  ['R8C6', 1],
  ['R9C1', 1],
  ['R9C3', 2],
  ['R9C7', 3],
];

return [
  new Shape('9x9'),
  ...givens.map(([cell, value]) => new Given(cell, value)),
];
