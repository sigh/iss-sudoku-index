// Title: Classic Sudoku
// Author: Unknown
// Video: https://www.youtube.com/watch?v=sR6v3PmVbsA
// Source: https://sudokupad.app/M87bGbhh4N

// Normal sudoku with given digits; no other constraints.

const givens = [
  ['R1C2', 4],
  ['R1C3', 2],
  ['R1C5', 1],
  ['R2C1', 9],
  ['R2C7', 3],
  ['R3C9', 7],
  ['R4C1', 4],
  ['R4C7', 5],
  ['R5C2', 3],
  ['R5C4', 9],
  ['R5C5', 8],
  ['R5C6', 7],
  ['R6C3', 6],
  ['R6C8', 3],
  ['R7C8', 4],
  ['R7C9', 5],
  ['R8C1', 5],
  ['R8C2', 8],
  ['R8C5', 4],
  ['R8C6', 3],
  ['R8C9', 9],
  ['R9C8', 2],
];

return [
  new Shape('9x9'),
  ...givens.map(([cell, value]) => new Given(cell, value)),
];
