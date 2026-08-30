// Title: If You Can Do Easy Sudoku, You CAN Do Hard Sudoku
// Author: Unknown
// Video: https://www.youtube.com/watch?v=jhYXGqtP4Bs
// Source: https://cracking-the-cryptic.web.app/sudoku/gpR2jm33rb

// Normal sudoku rules apply (1-9 in each row, column and 3x3 box). Standard
// 3x3 box regions -- Shape('9x9') supplies rows/columns/boxes, matching the
// 9 whole-box regions in the payload. No rules text and no other clue types
// (lines, cages, arrows, overlays) appear in the payload; the puzzle is
// fully determined by its 22 givens below.

// Givens, as drawn on the board (cell ids below are 1-indexed R#C#).
return [
  new Shape('9x9'),

  new Given('R1C5', 5),
  new Given('R1C8', 6),
  new Given('R2C1', 6),
  new Given('R2C4', 9),
  new Given('R2C9', 3),
  new Given('R3C2', 5),
  new Given('R3C7', 2),
  new Given('R4C3', 8),
  new Given('R4C8', 5),
  new Given('R5C1', 9),
  new Given('R5C6', 3),
  new Given('R5C9', 4),
  new Given('R6C2', 1),
  new Given('R6C5', 2),
  new Given('R7C1', 4),
  new Given('R7C4', 6),
  new Given('R7C8', 7),
  new Given('R8C3', 1),
  new Given('R8C7', 8),
  new Given('R9C2', 2),
  new Given('R9C6', 8),
  new Given('R9C9', 1),
];
