// Title: Forest Medallion
// Author: Wei-Hwa Huang
// Video: https://www.youtube.com/watch?v=gFzgB9jY5cM
// Source: https://sudokupad.app/8mclyql7am
//
// Normal sudoku. Digits may not repeat on either marked diagonal; both
// diagonals are drawn cell-by-cell in the source (R1C1-R9C9 and R1C9-R9C1),
// so no reading is required for which cells they cover.

// 24 starting digits, transcribed from the source cell grid.
const GIVENS = [
  ['R1C3', 7], ['R1C4', 3], ['R1C7', 8],
  ['R2C2', 1], ['R2C6', 6], ['R2C8', 9],
  ['R3C1', 3], ['R3C5', 8], ['R3C9', 4],
  ['R4C2', 5], ['R4C9', 7],
  ['R5C3', 9], ['R5C7', 5],
  ['R6C1', 2], ['R6C8', 1],
  ['R7C1', 7], ['R7C5', 1], ['R7C9', 3],
  ['R8C2', 8], ['R8C4', 6], ['R8C8', 4],
  ['R9C3', 5], ['R9C6', 8], ['R9C7', 1],
];

return [
  new Shape('9x9'),

  ...GIVENS.map(([cell, digit]) => new Given(cell, digit)),

  // direction -1 = '\' (top-left to bottom-right, R1C1-R9C9);
  // direction 1 = '/' (top-right to bottom-left, R1C9-R9C1).
  new Diagonal(-1),
  new Diagonal(1),
];
