// Title: Classic Sudoku
// Author: Unknown
// Video: https://www.youtube.com/watch?v=qs0soH_UFNE
// Source: https://app.crackingthecryptic.com/Gnp62hLQn7

// Normal sudoku rules apply (1-9 in each row, column and 3x3 box). Standard
// 3x3 box regions -- Shape('9x9') supplies rows/columns/boxes, matching the
// 9 whole-box regions in the payload. No other clue types (lines, cages,
// arrows) appear in the payload; the puzzle is fully determined by its 24
// givens below.

// Givens, as drawn on the board (cell ids below are 1-indexed R#C#).
return [
  new Shape('9x9'),

  new Given('R1C1', 6),
  new Given('R1C3', 9),
  new Given('R1C4', 1),
  new Given('R1C6', 2),
  new Given('R1C8', 8),
  new Given('R2C7', 4),
  new Given('R3C1', 5),
  new Given('R3C3', 2),
  new Given('R4C5', 2),
  new Given('R4C7', 3),
  new Given('R4C9', 4),
  new Given('R5C1', 1),
  new Given('R5C6', 5),
  new Given('R6C2', 2),
  new Given('R6C7', 5),
  new Given('R6C9', 6),
  new Given('R7C4', 8),
  new Given('R7C6', 1),
  new Given('R8C9', 9),
  new Given('R9C1', 8),
  new Given('R9C3', 5),
  new Given('R9C4', 9),
  new Given('R9C6', 7),
  new Given('R9C8', 4),
];
