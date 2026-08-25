// Title: Classic Sudoku
// Author: Unknown
// Video: https://www.youtube.com/watch?v=3JdyLS-P4Do
// Source: https://app.crackingthecryptic.com/bjGnfGgFtP

// Normal sudoku rules apply (1-9 in each row, column and 3x3 box). Standard
// 3x3 box regions -- Shape('9x9') supplies rows/columns/boxes, matching the
// 9 whole-box regions in the payload. No other clue types (lines, cages,
// arrows) appear in the payload; the puzzle is fully determined by its 22
// givens below.

// Givens, as drawn on the board (cell ids below are 1-indexed R#C#).
return [
  new Shape('9x9'),

  new Given('R1C1', 9),
  new Given('R1C5', 7),
  new Given('R1C9', 5),
  new Given('R2C2', 1),
  new Given('R2C6', 2),
  new Given('R2C7', 8),
  new Given('R3C2', 6),
  new Given('R4C8', 4),
  new Given('R5C3', 7),
  new Given('R5C5', 9),
  new Given('R6C3', 4),
  new Given('R6C5', 5),
  new Given('R6C6', 3),
  new Given('R6C7', 6),
  new Given('R6C9', 1),
  new Given('R7C4', 8),
  new Given('R7C6', 7),
  new Given('R8C2', 3),
  new Given('R9C3', 2),
  new Given('R9C4', 5),
  new Given('R9C6', 1),
  new Given('R9C9', 9),
];
