// Title: Sudoku Exam: Spot The Initial Trick?
// Author: Bastien Vial-Jaime
// Video: https://www.youtube.com/watch?v=8oaqCIQZNXI
// Source: https://cracking-the-cryptic.web.app/sudoku/nNfNb8T9FJ

// Normal sudoku rules. 1-9 once each in every row, column and 3x3 box.

const givens = [
  ['R1C2', 8],
  ['R1C3', 1],
  ['R2C1', 2],
  ['R2C4', 6],
  ['R3C1', 5],
  ['R3C4', 4],
  ['R3C7', 1],
  ['R4C2', 1],
  ['R4C3', 9],
  ['R4C6', 7],
  ['R6C4', 2],
  ['R6C7', 6],
  ['R6C8', 4],
  ['R7C3', 3],
  ['R7C6', 9],
  ['R7C9', 8],
  ['R8C6', 1],
  ['R8C9', 7],
  ['R9C7', 3],
  ['R9C8', 2],
];

return [
  new Shape('9x9'),
  ...givens.map(([cell, value]) => new Given(cell, value)),
];
