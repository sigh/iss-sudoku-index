// Title: Classic Sudoku
// Author: Unknown
// Video: https://www.youtube.com/watch?v=p3oafUDuVrI
// Source: https://app.crackingthecryptic.com/hFtf3bNPn8

// Normal sudoku rules apply (1-9 in each row, column and 3x3 box). Standard
// 3x3 box regions -- Shape('9x9') supplies rows/columns/boxes, matching the
// 9 whole-box regions in the payload. No other clue types (lines, cages,
// arrows) appear in the payload; the puzzle is fully determined by its 24
// givens below.

// Givens, as drawn on the board (cell ids below are 1-indexed R#C#).
return [
  new Shape('9x9'),

  new Given('R1C4', 2),
  new Given('R2C1', 8),
  new Given('R2C3', 9),
  new Given('R2C6', 7),
  new Given('R2C7', 4),
  new Given('R3C4', 6),
  new Given('R3C6', 8),
  new Given('R3C7', 7),
  new Given('R3C8', 5),
  new Given('R4C7', 3),
  new Given('R4C8', 2),
  new Given('R5C2', 6),
  new Given('R6C2', 2),
  new Given('R6C3', 1),
  new Given('R6C4', 7),
  new Given('R6C7', 6),
  new Given('R6C9', 8),
  new Given('R7C1', 2),
  new Given('R7C4', 8),
  new Given('R7C8', 3),
  new Given('R8C4', 5),
  new Given('R8C5', 1),
  new Given('R9C3', 3),
  new Given('R9C8', 9),
];
