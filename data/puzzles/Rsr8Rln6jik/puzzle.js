// Title: Sudoku ("S is for Sudoku")
// Author: Serkan Yurekli
// Video: https://www.youtube.com/watch?v=Rsr8Rln6jik
// Source: https://gmpuzzles.com/s/180406Sisf

// Rules: "Standard Sudoku rules." Classic 9x9; the drawn thick edges enclose
// the standard 3x3 boxes, so the engine's default row/column/box groups are
// the whole ruleset. The only clues are the 24 given digits.

// Givens as drawn in the payload's number layer.
const givens = [
  ['R1C2', 4], ['R1C7', 1], ['R1C8', 3],
  ['R2C1', 2], ['R2C3', 6], ['R2C6', 4], ['R2C9', 5],
  ['R3C1', 9], ['R3C6', 6],
  ['R4C2', 7], ['R4C6', 8],
  ['R5C3', 5], ['R5C7', 9],
  ['R6C4', 3], ['R6C8', 7],
  ['R7C4', 1], ['R7C9', 4],
  ['R8C1', 8], ['R8C4', 2], ['R8C7', 7], ['R8C9', 3],
  ['R9C2', 6], ['R9C3', 4], ['R9C8', 1],
].map(([cell, value]) => new Given(cell, value));

return [
  new Shape('9x9'),
  ...givens,
];
