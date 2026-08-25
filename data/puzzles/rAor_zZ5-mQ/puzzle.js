// Title: Classic Sudoku
// Author: Unknown
// Video: https://www.youtube.com/watch?v=rAor_zZ5-mQ
// Source: https://sudokupad.app/p4HNq6LPFg

// Normal sudoku rules apply (standard 3x3 boxes). No other rules.

// Givens transcribed from the payload's `cells` array.
const givens = [
  ['R1C2', 4], ['R1C7', 8],
  ['R2C2', 6], ['R2C4', 5], ['R2C6', 7],
  ['R3C3', 8], ['R3C5', 3], ['R3C9', 6],
  ['R4C2', 8], ['R4C5', 7], ['R4C9', 3],
  ['R5C3', 6], ['R5C5', 4], ['R5C7', 5], ['R5C9', 1],
  ['R6C1', 9], ['R6C5', 5], ['R6C8', 4],
  ['R7C1', 3], ['R7C5', 9],
  ['R8C4', 7], ['R8C6', 8], ['R8C8', 3],
  ['R9C3', 9], ['R9C8', 1],
];

return [
  new Shape('9x9'),
  ...givens.map(([cell, value]) => new Given(cell, value)),
];
