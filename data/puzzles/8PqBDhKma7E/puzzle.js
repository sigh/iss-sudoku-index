// Title: Classic Sudoku
// Author: Unknown
// Video: https://www.youtube.com/watch?v=8PqBDhKma7E
// Source: https://cracking-the-cryptic.web.app/sudoku/rgF7HBDjMM

// Normal sudoku rules apply (1-9 in each row, column and 3x3 box). Standard
// 3x3 box regions -- Shape('9x9') supplies rows/columns/boxes, matching the
// 9 whole-box regions in the payload. The payload carries no rules text and
// no other clue types (lines, cages, arrows, overlays); the puzzle is fully
// determined by its 21 givens below.

// Givens, as drawn on the board (cell ids below are 1-indexed R#C#).
return [
  new Shape('9x9'),

  new Given('R1C4', 1),
  new Given('R1C7', 5),
  new Given('R2C3', 7),
  new Given('R2C9', 6),
  new Given('R3C3', 6),
  new Given('R3C6', 2),
  new Given('R3C8', 4),
  new Given('R4C3', 8),
  new Given('R4C8', 9),
  new Given('R5C2', 5),
  new Given('R5C5', 6),
  new Given('R5C8', 7),
  new Given('R6C2', 3),
  new Given('R6C7', 2),
  new Given('R7C2', 2),
  new Given('R7C4', 9),
  new Given('R7C7', 3),
  new Given('R8C1', 8),
  new Given('R8C7', 1),
  new Given('R9C3', 3),
  new Given('R9C6', 8),
];
