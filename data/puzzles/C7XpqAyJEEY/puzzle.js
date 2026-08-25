// Title: Classic Sudoku
// Author: Unknown
// Video: https://www.youtube.com/watch?v=C7XpqAyJEEY
// Source: https://app.crackingthecryptic.com/H6GHjGntRg

// Normal sudoku rules apply: standard 3x3 box regions (Shape('9x9') supplies
// rows/columns/boxes) plus the 24 given digits below. No other clues.

const givens = [
  ['R1C1', 4], ['R1C9', 5],
  ['R2C1', 8], ['R2C2', 6], ['R2C8', 3], ['R2C9', 1],
  ['R3C3', 9], ['R3C7', 7],
  ['R4C4', 2], ['R4C6', 4],
  ['R5C5', 1],
  ['R6C4', 5], ['R6C5', 3], ['R6C6', 8],
  ['R7C2', 2], ['R7C3', 7], ['R7C7', 9], ['R7C8', 6],
  ['R8C1', 5], ['R8C3', 3], ['R8C7', 4], ['R8C9', 2],
  ['R9C3', 8], ['R9C7', 3],
];

return [
  new Shape('9x9'),
  ...givens.map(([cell, value]) => new Given(cell, value)),
];
