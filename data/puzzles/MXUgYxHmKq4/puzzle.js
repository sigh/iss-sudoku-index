// Title: Techniques for Classics
// Author: 
// Video: https://www.youtube.com/watch?v=MXUgYxHmKq4
// Source: https://cracking-the-cryptic.web.app/sudoku/BhLbLBpdGQ

// Normal sudoku rules. 1-9 once each in every row, column and 3x3 box.

const givens = [
  ['R1C2', 6],
  ['R1C3', 8],
  ['R1C8', 1],
  ['R1C9', 3],
  ['R2C4', 9],
  ['R2C6', 1],
  ['R3C6', 8],
  ['R3C9', 4],
  ['R4C2', 1],
  ['R4C5', 4],
  ['R4C7', 5],
  ['R5C2', 3],
  ['R5C6', 9],
  ['R6C2', 8],
  ['R6C3', 5],
  ['R6C8', 7],
  ['R7C2', 2],
  ['R7C6', 7],
  ['R7C7', 3],
  ['R8C5', 9],
  ['R8C6', 4],
  ['R8C9', 6],
  ['R9C1', 4],
  ['R9C5', 6],
];

return [
  new Shape('9x9'),
  ...givens.map(([cell, value]) => new Given(cell, value)),
];
