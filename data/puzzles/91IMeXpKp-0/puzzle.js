// Title: Self-Isolation Sudokus:  Bonus Video 1
// Author: 
// Video: https://www.youtube.com/watch?v=91IMeXpKp-0
// Source: https://cracking-the-cryptic.web.app/sudoku/HQnj4Mp8QP

// Normal sudoku rules. 1-9 once each in every row, column and 3x3 box.

const givens = [
  ['R1C2', 7],
  ['R1C7', 2],
  ['R1C8', 6],
  ['R2C3', 2],
  ['R2C5', 3],
  ['R3C1', 9],
  ['R3C5', 7],
  ['R3C6', 6],
  ['R3C7', 4],
  ['R4C2', 6],
  ['R4C3', 3],
  ['R4C4', 9],
  ['R5C4', 3],
  ['R5C6', 8],
  ['R6C6', 5],
  ['R6C7', 6],
  ['R6C8', 1],
  ['R7C3', 4],
  ['R7C4', 6],
  ['R7C5', 9],
  ['R7C9', 5],
  ['R8C5', 5],
  ['R8C7', 3],
  ['R9C2', 1],
  ['R9C3', 6],
  ['R9C8', 7],
];

return [
  new Shape('9x9'),
  ...givens.map(([cell, value]) => new Given(cell, value)),
];
