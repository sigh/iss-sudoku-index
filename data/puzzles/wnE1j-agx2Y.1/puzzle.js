// Title: Apr 13, 2022: Classic Sudoku
// Author: Sam Cappleman-Lynes
// Video: https://www.youtube.com/watch?v=wnE1j-agx2Y
// Source: https://tinyurl.com/4btvn4hr

// Normal sudoku rules. 1-9 once each in every row, column and 3x3 box.

const givens = [
  ['R1C2', 1],
  ['R1C3', 2],
  ['R1C5', 3],
  ['R1C6', 4],
  ['R2C2', 3],
  ['R2C3', 5],
  ['R2C5', 1],
  ['R2C6', 6],
  ['R2C8', 7],
  ['R2C9', 2],
  ['R3C8', 1],
  ['R3C9', 8],
  ['R4C3', 3],
  ['R4C4', 2],
  ['R5C3', 8],
  ['R5C4', 4],
  ['R5C6', 1],
  ['R5C7', 2],
  ['R6C6', 5],
  ['R6C7', 8],
  ['R7C1', 4],
  ['R7C2', 8],
  ['R8C1', 3],
  ['R8C2', 6],
  ['R8C4', 1],
  ['R8C5', 4],
  ['R8C7', 5],
  ['R8C8', 8],
  ['R9C4', 6],
  ['R9C5', 7],
  ['R9C7', 1],
  ['R9C8', 4],
];

return [
  new Shape('9x9'),
  ...givens.map(([cell, value]) => new Given(cell, value)),
];
