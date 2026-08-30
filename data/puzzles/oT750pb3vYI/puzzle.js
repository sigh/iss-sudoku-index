// Title: unknown
// Author: Unknown
// Video: https://www.youtube.com/watch?v=oT750pb3vYI
// Source: https://cracking-the-cryptic.web.app/sudoku/9fmNBg7Th4

// No rules text is carried in the payload. Standard 3x3 box regions --
// Shape('9x9') supplies rows/columns/boxes, matching the 9 whole-box regions
// in the payload. No other clue types (lines, cages, arrows) appear in the
// payload; the puzzle is fully determined by its 24 givens below.

// Givens, as drawn on the board (cell ids below are 1-indexed R#C#).
return [
  new Shape('9x9'),

  new Given('R1C1', 1),
  new Given('R1C2', 7),
  new Given('R1C4', 4),
  new Given('R2C1', 3),
  new Given('R2C3', 8),
  new Given('R2C7', 1),
  new Given('R3C8', 5),
  new Given('R3C9', 3),
  new Given('R4C4', 8),
  new Given('R4C6', 1),
  new Given('R4C9', 4),
  new Given('R5C3', 7),
  new Given('R5C7', 2),
  new Given('R6C5', 2),
  new Given('R6C6', 6),
  new Given('R6C8', 7),
  new Given('R7C4', 1),
  new Given('R8C1', 8),
  new Given('R8C3', 4),
  new Given('R8C7', 5),
  new Given('R9C1', 6),
  new Given('R9C3', 9),
  new Given('R9C6', 3),
  new Given('R9C8', 2),
];
