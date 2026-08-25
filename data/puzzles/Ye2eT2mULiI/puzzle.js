// Title: Diagonal Sudoku
// Author: Henning Kalsgaard Poulsen
// Video: https://www.youtube.com/watch?v=Ye2eT2mULiI
// Source: https://sudokupad.app/xblri4amv1

// Normal sudoku rules (default rows/cols/boxes). Digits cannot repeat along
// the two marked diagonals.

// Given digits, transcribed from the drawn cells.
const givens = [
  ['R1C2', 4], ['R1C8', 3],
  ['R2C5', 3],
  ['R3C2', 1], ['R3C4', 5], ['R3C6', 9], ['R3C8', 6],
  ['R4C1', 6], ['R4C9', 1],
  ['R5C4', 2], ['R5C6', 7],
  ['R6C1', 9], ['R6C5', 1], ['R6C9', 4],
  ['R7C2', 2], ['R7C4', 1], ['R7C6', 4], ['R7C8', 5],
  ['R8C5', 7],
  ['R9C2', 8], ['R9C8', 9],
];

return [
  new Shape('9x9'),
  ...givens.map(([cell, value]) => new Given(cell, value)),
  // '\'-oriented diagonal R1C1-R2C2-...-R9C9.
  new Diagonal(-1),
  // '/'-oriented diagonal R9C1-R8C2-...-R1C9.
  new Diagonal(1),
];
