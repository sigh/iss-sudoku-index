// Title: unknown
// Author: Unknown
// Video: https://www.youtube.com/watch?v=5x2uJa2A3XE
// Source: https://cracking-the-cryptic.web.app/sudoku/QrNB3hr3Pn

// No rules text and no lines, cages, arrows, or overlays are present -- a
// plain classic sudoku. Normal sudoku rules apply (1-9 once each in every
// row, column and 3x3 box). Standard 3x3 box regions -- Shape('9x9')
// supplies rows/columns/boxes, matching the 9 whole-box regions drawn. The
// puzzle is fully determined by its 27 givens below.

// Givens, as drawn on the board (cell ids below are 1-indexed R#C#).
return [
  new Shape('9x9'),

  new Given('R1C1', 1),
  new Given('R1C2', 7),
  new Given('R1C5', 4),
  new Given('R1C6', 8),
  new Given('R1C7', 6),
  new Given('R2C3', 8),
  new Given('R2C5', 2),
  new Given('R2C6', 5),
  new Given('R2C8', 3),
  new Given('R2C9', 7),
  new Given('R3C2', 9),
  new Given('R4C1', 4),
  new Given('R4C5', 7),
  new Given('R4C7', 8),
  new Given('R5C2', 2),
  new Given('R5C5', 5),
  new Given('R5C9', 1),
  new Given('R6C2', 6),
  new Given('R6C6', 3),
  new Given('R6C8', 7),
  new Given('R7C2', 3),
  new Given('R7C7', 7),
  new Given('R8C1', 9),
  new Given('R8C6', 7),
  new Given('R8C8', 4),
  new Given('R9C5', 1),
  new Given('R9C9', 2),
];
