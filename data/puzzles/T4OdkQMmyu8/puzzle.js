// Title: Classic Sudoku
// Author: Unknown
// Video: https://www.youtube.com/watch?v=T4OdkQMmyu8
// Source: https://app.crackingthecryptic.com/pg8PTHtqtr

// Normal sudoku rules apply (1-9 in each row, column and 3x3 box). Standard
// 3x3 box regions -- Shape('9x9') supplies rows/columns/boxes, matching the
// 9 whole-box regions in the payload. No other clue types (lines, cages,
// arrows) appear in the payload; the puzzle is fully determined by its 23
// givens below.

// Givens, as drawn on the board (cell ids below are 1-indexed R#C#).
return [
  new Shape('9x9'),

  new Given('R1C2', 8),
  new Given('R1C4', 1),
  new Given('R1C9', 7),
  new Given('R2C4', 5),
  new Given('R2C8', 2),
  new Given('R2C9', 6),
  new Given('R3C3', 2),
  new Given('R3C4', 7),
  new Given('R3C6', 4),
  new Given('R3C9', 3),
  new Given('R4C6', 1),
  new Given('R4C9', 4),
  new Given('R5C1', 1),
  new Given('R6C3', 4),
  new Given('R6C4', 2),
  new Given('R7C7', 6),
  new Given('R7C9', 8),
  new Given('R8C1', 7),
  new Given('R8C3', 1),
  new Given('R8C6', 3),
  new Given('R9C3', 5),
  new Given('R9C4', 4),
  new Given('R9C7', 9),
];
