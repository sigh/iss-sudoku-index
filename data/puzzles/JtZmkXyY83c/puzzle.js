// Title: The Decider - a Race against Time
// Author: 
// Video: https://www.youtube.com/watch?v=JtZmkXyY83c
// Source: https://cracking-the-cryptic.web.app/sudoku/NHJ7rj7ft7

// Normal sudoku rules. 1-9 once each in every row, column and 3x3 box.

const givens = [
  ['R1C7', 4],
  ['R1C9', 5],
  ['R2C1', 5],
  ['R2C2', 3],
  ['R2C3', 7],
  ['R2C4', 9],
  ['R3C4', 2],
  ['R3C8', 3],
  ['R4C3', 5],
  ['R4C4', 8],
  ['R4C5', 2],
  ['R4C6', 4],
  ['R4C7', 1],
  ['R6C3', 8],
  ['R6C4', 3],
  ['R6C5', 1],
  ['R6C6', 9],
  ['R6C7', 7],
  ['R7C4', 7],
  ['R7C8', 8],
  ['R8C1', 3],
  ['R8C2', 2],
  ['R8C3', 6],
  ['R8C4', 4],
  ['R9C7', 2],
  ['R9C9', 9],
];

return [
  new Shape('9x9'),
  ...givens.map(([cell, value]) => new Given(cell, value)),
];
