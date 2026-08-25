// Title: Classic Sudoku
// Author: Unknown
// Video: https://www.youtube.com/watch?v=xbd6UeNWhI0
// Source: https://app.crackingthecryptic.com/mNtG4hF28M

// Normal sudoku rules only (default rows/cols/boxes via Shape('9x9')). No
// other clue types are drawn in the payload.

// Given digits, transcribed from the payload's per-cell values.
const givens = [
  ['R1C4', 6], ['R1C6', 7], ['R1C9', 4],
  ['R2C2', 7], ['R2C5', 9], ['R2C8', 1],
  ['R3C1', 4], ['R3C5', 1], ['R3C9', 6],
  ['R4C1', 6], ['R4C5', 5], ['R4C7', 8],
  ['R5C1', 3], ['R5C2', 1], ['R5C8', 5], ['R5C9', 2],
  ['R6C3', 8], ['R6C5', 4], ['R6C9', 3],
  ['R7C1', 2], ['R7C5', 6],
  ['R8C2', 6], ['R8C5', 8],
  ['R9C1', 5], ['R9C4', 2], ['R9C6', 4],
];

return [
  new Shape('9x9'),
  ...givens.map(([cell, value]) => new Given(cell, value)),
];
