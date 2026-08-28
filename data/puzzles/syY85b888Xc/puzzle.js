// Title: Classic Sudoku
// Author: Unknown
// Video: https://www.youtube.com/watch?v=syY85b888Xc
// Source: https://sudokupad.app/LFHbpFpN8r

// Rules: "Normal sudoku rules apply." -- digits 1-9, each appearing once per
// row, once per column, and once per 3x3 box. ISS enforces all three by default
// on a 9x9 Shape, and the source's region partition is exactly the standard
// boxes, so no explicit regions are needed.
//
// The source draws no other clue geometry: no cages, lines, arrows, dots,
// overlays or outside clues. Nothing is omitted from this encoding.

// Givens, transcribed from the drawn grid (26 clues).
const givens = [
  ['R1C3', 5],
  ['R2C7', 7], ['R2C9', 1],
  ['R3C1', 9], ['R3C5', 5], ['R3C7', 8], ['R3C9', 3],
  ['R4C1', 1], ['R4C6', 5], ['R4C7', 6], ['R4C8', 9],
  ['R5C3', 9], ['R5C5', 3], ['R5C8', 1], ['R5C9', 5],
  ['R6C4', 9],
  ['R7C2', 4], ['R7C3', 6], ['R7C4', 1], ['R7C8', 3],
  ['R8C4', 4], ['R8C5', 6], ['R8C7', 5],
  ['R9C2', 3], ['R9C3', 2], ['R9C5', 9],
];

return [
  new Shape('9x9'),
  ...givens.map(([cell, value]) => new Given(cell, value)),
];
