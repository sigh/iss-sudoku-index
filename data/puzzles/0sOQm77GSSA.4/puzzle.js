// Title: Jan 16, 2021: Classic Sudoku
// Author: Sam Cappleman-Lynes
// Video: https://www.youtube.com/watch?v=0sOQm77GSSA
// Source: https://tinyurl.com/28h6bt64

// Normal sudoku rules. 1-9 once each in every row, column and 3x3 box.

const givens = [
  ['R1C4', 1],
  ['R1C5', 2],
  ['R1C6', 3],
  ['R1C7', 4],
  ['R2C3', 1],
  ['R2C4', 5],
  ['R2C7', 6],
  ['R2C8', 7],
  ['R3C1', 4],
  ['R3C2', 3],
  ['R3C3', 8],
  ['R3C8', 5],
  ['R4C1', 1],
  ['R4C8', 2],
  ['R4C9', 4],
  ['R5C1', 5],
  ['R5C9', 6],
  ['R6C1', 3],
  ['R6C2', 7],
  ['R6C9', 1],
  ['R7C2', 6],
  ['R7C7', 3],
  ['R7C8', 1],
  ['R7C9', 7],
  ['R8C2', 2],
  ['R8C3', 5],
  ['R8C6', 4],
  ['R8C7', 9],
  ['R9C3', 3],
  ['R9C4', 7],
  ['R9C5', 9],
  ['R9C6', 6],
];

return [
  new Shape('9x9'),
  ...givens.map(([cell, value]) => new Given(cell, value)),
];
