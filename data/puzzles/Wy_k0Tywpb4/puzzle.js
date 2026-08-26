// Title: The Great Sudoku "Cheat" Scandal
// Author: 
// Video: https://www.youtube.com/watch?v=Wy_k0Tywpb4
// Source: https://cracking-the-cryptic.web.app/sudoku/RjBN4Q97J3

// Normal sudoku rules. 1-9 once each in every row, column and 3x3 box.

const givens = [
  ['R1C1', 6],
  ['R1C9', 8],
  ['R2C2', 3],
  ['R2C4', 9],
  ['R2C6', 7],
  ['R2C8', 2],
  ['R3C3', 5],
  ['R3C7', 9],
  ['R4C2', 8],
  ['R4C4', 1],
  ['R4C6', 9],
  ['R4C8', 3],
  ['R6C2', 9],
  ['R6C4', 3],
  ['R6C6', 5],
  ['R6C8', 1],
  ['R7C3', 4],
  ['R7C7', 7],
  ['R8C2', 6],
  ['R8C4', 4],
  ['R8C6', 3],
  ['R8C8', 9],
  ['R9C1', 5],
  ['R9C9', 2],
];

return [
  new Shape('9x9'),
  ...givens.map(([cell, value]) => new Given(cell, value)),
];
