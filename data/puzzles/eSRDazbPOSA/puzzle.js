// Title: Classic Sudoku Bonus
// Author: 
// Video: https://www.youtube.com/watch?v=eSRDazbPOSA
// Source: https://cracking-the-cryptic.web.app/sudoku/FMqDr9LdLn

// Normal sudoku rules. 1-9 once each in every row, column and 3x3 box.

const givens = [
  ['R1C3', 3],
  ['R1C6', 9],
  ['R1C7', 6],
  ['R2C4', 1],
  ['R2C5', 2],
  ['R2C8', 4],
  ['R3C1', 6],
  ['R3C9', 1],
  ['R4C2', 6],
  ['R4C5', 3],
  ['R4C7', 7],
  ['R5C2', 2],
  ['R5C4', 6],
  ['R5C6', 7],
  ['R5C8', 5],
  ['R6C3', 1],
  ['R6C5', 4],
  ['R6C8', 6],
  ['R7C1', 9],
  ['R7C9', 5],
  ['R8C2', 7],
  ['R8C5', 5],
  ['R8C6', 4],
  ['R9C3', 6],
  ['R9C4', 3],
  ['R9C7', 8],
];

return [
  new Shape('9x9'),
  ...givens.map(([cell, value]) => new Given(cell, value)),
];
