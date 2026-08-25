// Title: Classic Sudoku
// Author: Unknown
// Video: https://www.youtube.com/watch?v=ML9cUWOPDKQ
// Source: https://app.crackingthecryptic.com/Pj7r8Ld9hJ

// Normal sudoku rules apply (1-9 in each row, column and 3x3 box). Standard
// 3x3 box regions -- Shape('9x9') supplies rows/columns/boxes, matching the
// 9 whole-box regions in the payload. No other clue types (lines, cages,
// arrows) appear in the payload; the puzzle is fully determined by its 24
// givens below.

// Givens, as drawn on the board (cell ids below are 1-indexed R#C#).
return [
  new Shape('9x9'),

  new Given('R1C1', 5),
  new Given('R1C4', 6),
  new Given('R2C2', 6),
  new Given('R2C6', 3),
  new Given('R2C7', 9),
  new Given('R3C1', 9),
  new Given('R3C5', 4),
  new Given('R3C9', 1),
  new Given('R4C1', 7),
  new Given('R4C2', 1),
  new Given('R4C5', 5),
  new Given('R5C7', 4),
  new Given('R5C9', 5),
  new Given('R6C5', 2),
  new Given('R6C8', 1),
  new Given('R6C9', 3),
  new Given('R7C1', 6),
  new Given('R7C5', 1),
  new Given('R8C3', 8),
  new Given('R8C4', 2),
  new Given('R8C8', 6),
  new Given('R9C3', 3),
  new Given('R9C6', 4),
  new Given('R9C9', 7),
];
