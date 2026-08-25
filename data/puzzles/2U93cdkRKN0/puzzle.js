// Title: Classic Sudoku
// Author: Unknown
// Video: https://www.youtube.com/watch?v=2U93cdkRKN0
// Source: https://app.crackingthecryptic.com/MbNJBMrGJg

// Normal sudoku rules apply (1-9 in each row, column and 3x3 box). Standard
// 3x3 box regions -- Shape('9x9') supplies rows/columns/boxes, matching the
// 9 whole-box regions in the payload. No other clue types (lines, cages,
// arrows) appear in the payload; the puzzle is fully determined by its 22
// givens below.

// Givens, as drawn on the board (cell ids below are 1-indexed R#C#).
return [
  new Shape('9x9'),

  new Given('R1C3', 9),
  new Given('R1C9', 7),
  new Given('R2C1', 8),
  new Given('R2C6', 6),
  new Given('R2C7', 3),
  new Given('R3C4', 2),
  new Given('R3C6', 3),
  new Given('R3C7', 4),
  new Given('R4C2', 7),
  new Given('R4C6', 8),
  new Given('R4C7', 2),
  new Given('R6C3', 5),
  new Given('R6C4', 9),
  new Given('R6C8', 6),
  new Given('R7C3', 2),
  new Given('R7C4', 3),
  new Given('R7C6', 4),
  new Given('R8C3', 6),
  new Given('R8C4', 7),
  new Given('R8C9', 5),
  new Given('R9C1', 5),
  new Given('R9C7', 8),
];
