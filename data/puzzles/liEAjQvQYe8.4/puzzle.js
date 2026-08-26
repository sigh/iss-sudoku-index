// Title: May 1, 2021: Classic Sudoku
// Author: Sam Cappleman-Lynes
// Video: https://www.youtube.com/watch?v=liEAjQvQYe8
// Source: https://tinyurl.com/yc294vb7

// Normal sudoku rules. 1-9 once each in every row, column and 3x3 box.

const givens = [
  ['R1C1', 1],
  ['R1C2', 2],
  ['R1C6', 3],
  ['R1C7', 4],
  ['R2C2', 4],
  ['R2C3', 5],
  ['R2C7', 2],
  ['R2C8', 6],
  ['R3C3', 7],
  ['R3C4', 8],
  ['R3C8', 9],
  ['R3C9', 1],
  ['R4C4', 3],
  ['R4C5', 1],
  ['R4C9', 9],
  ['R5C5', 7],
  ['R6C1', 7],
  ['R6C5', 8],
  ['R6C6', 6],
  ['R7C1', 2],
  ['R7C2', 7],
  ['R7C6', 5],
  ['R7C7', 9],
  ['R8C2', 5],
  ['R8C3', 4],
  ['R8C7', 1],
  ['R8C8', 2],
  ['R9C3', 3],
  ['R9C4', 2],
  ['R9C8', 4],
  ['R9C9', 5],
];

return [
  new Shape('9x9'),
  ...givens.map(([cell, value]) => new Given(cell, value)),
];
