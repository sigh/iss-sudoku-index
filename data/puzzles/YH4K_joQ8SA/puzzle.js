// Title: Classic Sudoku
// Author: Unknown
// Video: https://www.youtube.com/watch?v=YH4K_joQ8SA
// Source: https://sudokupad.app/4BBDgJHh67

// Rules: "Normal sudoku rules apply." -- digits 1-9, each appearing once per
// row, once per column, and once per 3x3 box. ISS enforces all three by default
// on a 9x9 Shape, and the source's region partition is exactly the standard
// boxes, so no explicit regions are needed.
//
// The source carries no other clue geometry: no cages, lines, arrows, dots,
// overlays or outside clues. Nothing is omitted from this encoding.

// Givens, transcribed from the drawn grid (25 clues).
const givens = [
  ['R1C4', 9], ['R1C6', 4],
  ['R2C3', 5], ['R2C5', 7], ['R2C7', 6],
  ['R3C5', 8],
  ['R4C3', 8], ['R4C4', 1], ['R4C5', 9], ['R4C6', 3], ['R4C7', 7],
  ['R5C5', 5],
  ['R6C1', 2], ['R6C9', 8],
  ['R7C1', 7], ['R7C2', 3], ['R7C8', 1],
  ['R8C3', 2], ['R8C4', 7], ['R8C6', 9], ['R8C7', 3],
  ['R9C1', 6], ['R9C2', 8], ['R9C8', 5], ['R9C9', 7],
];

return [
  new Shape('9x9'),
  ...givens.map(([cell, value]) => new Given(cell, value)),
];
