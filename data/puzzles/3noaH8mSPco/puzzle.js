// Title: Classic Sudoku
// Author: Unknown
// Video: https://www.youtube.com/watch?v=3noaH8mSPco
// Source: https://app.crackingthecryptic.com/dTGP77p8bF

// Normal sudoku rules apply (1-9 in each row, column and 3x3 box). Standard
// 3x3 box regions -- Shape('9x9') supplies rows/columns/boxes, matching the
// 9 whole-box regions in the payload. No other clue types (lines, cages,
// arrows) appear in the payload; the puzzle is fully determined by its 23
// givens below.

// Givens, as drawn on the board (cell ids below are 1-indexed R#C#).
return [
  new Shape('9x9'),

  new Given('R1C1', 9),
  new Given('R1C5', 2),
  new Given('R1C9', 6),
  new Given('R2C2', 5),
  new Given('R2C3', 7),
  new Given('R3C6', 3),
  new Given('R3C7', 8),
  new Given('R4C2', 9),
  new Given('R4C4', 8),
  new Given('R4C9', 3),
  new Given('R5C6', 6),
  new Given('R5C9', 5),
  new Given('R6C1', 7),
  new Given('R6C3', 4),
  new Given('R6C5', 5),
  new Given('R7C5', 6),
  new Given('R7C6', 5),
  new Given('R8C2', 4),
  new Given('R8C3', 3),
  new Given('R9C1', 1),
  new Given('R9C5', 9),
  new Given('R9C8', 2),
  new Given('R9C9', 7),
];
