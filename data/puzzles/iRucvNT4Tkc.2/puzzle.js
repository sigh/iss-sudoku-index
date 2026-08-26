// Title: Feb 3, 2022: Classic Sudoku
// Author: Sam Cappleman-Lynes
// Video: https://www.youtube.com/watch?v=iRucvNT4Tkc
// Source: https://tinyurl.com/2d4pjspr

// Normal sudoku rules. 1-9 once each in every row, column and 3x3 box.

const givens = [
  ['R1C2', 1],
  ['R1C3', 2],
  ['R1C4', 3],
  ['R1C9', 4],
  ['R2C2', 8],
  ['R2C4', 4],
  ['R2C7', 7],
  ['R2C8', 6],
  ['R2C9', 5],
  ['R3C2', 7],
  ['R3C3', 6],
  ['R3C4', 5],
  ['R4C7', 1],
  ['R4C8', 2],
  ['R4C9', 3],
  ['R6C1', 7],
  ['R6C2', 6],
  ['R6C3', 5],
  ['R7C6', 1],
  ['R7C7', 2],
  ['R7C8', 3],
  ['R8C1', 1],
  ['R8C2', 2],
  ['R8C3', 3],
  ['R8C6', 8],
  ['R8C8', 4],
  ['R9C1', 8],
  ['R9C6', 7],
  ['R9C7', 6],
  ['R9C8', 5],
];

return [
  new Shape('9x9'),
  ...givens.map(([cell, value]) => new Given(cell, value)),
];
