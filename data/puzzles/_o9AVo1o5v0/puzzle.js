// Title: Classic Sudoku
// Author: Unknown
// Video: https://www.youtube.com/watch?v=_o9AVo1o5v0
// Source: https://app.crackingthecryptic.com/9tHgjbHBNr

// Normal sudoku rules apply (1-9 in each row, column and 3x3 box). Standard
// 3x3 box regions -- Shape('9x9') supplies rows/columns/boxes, matching the
// 9 whole-box regions in the payload. No other clue types (lines, cages,
// arrows) appear in the payload; the puzzle is fully determined by its 30
// givens below.

// Givens, as drawn on the board (cell ids below are 1-indexed R#C#).
return [
  new Shape('9x9'),

  new Given('R1C3', 7),
  new Given('R1C4', 4),
  new Given('R1C5', 8),
  new Given('R2C2', 2),
  new Given('R2C6', 3),
  new Given('R2C8', 8),
  new Given('R3C4', 2),
  new Given('R3C5', 9),
  new Given('R3C9', 7),
  new Given('R4C2', 7),
  new Given('R4C8', 3),
  new Given('R4C9', 4),
  new Given('R5C2', 3),
  new Given('R5C3', 1),
  new Given('R5C4', 9),
  new Given('R5C6', 4),
  new Given('R5C7', 6),
  new Given('R5C8', 5),
  new Given('R6C1', 6),
  new Given('R6C2', 4),
  new Given('R6C8', 7),
  new Given('R7C1', 4),
  new Given('R7C5', 5),
  new Given('R7C6', 1),
  new Given('R8C2', 1),
  new Given('R8C4', 8),
  new Given('R8C8', 9),
  new Given('R9C5', 2),
  new Given('R9C6', 9),
  new Given('R9C7', 3),
];
