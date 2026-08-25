// Title: Classic Sudoku
// Author: Unknown
// Video: https://www.youtube.com/watch?v=VnSpKzDqb78
// Source: https://app.crackingthecryptic.com/4HP2M3RjBD

// Normal sudoku rules apply (1-9 in each row, column and 3x3 box). Standard
// 3x3 box regions -- Shape('9x9') supplies rows/columns/boxes, matching the
// 9 whole-box regions in the payload. No other clue types (lines, cages,
// arrows) appear in the payload; the puzzle is fully determined by its 25
// givens below.

// Givens, as drawn on the board (cell ids below are 1-indexed R#C#).
return [
  new Shape('9x9'),

  new Given('R1C8', 5),
  new Given('R2C2', 5),
  new Given('R2C4', 7),
  new Given('R2C5', 9),
  new Given('R2C6', 3),
  new Given('R3C1', 4),
  new Given('R3C2', 3),
  new Given('R3C6', 8),
  new Given('R3C9', 6),
  new Given('R4C1', 3),
  new Given('R4C3', 7),
  new Given('R4C8', 6),
  new Given('R4C9', 1),
  new Given('R6C1', 6),
  new Given('R6C6', 2),
  new Given('R6C7', 8),
  new Given('R6C9', 3),
  new Given('R7C1', 9),
  new Given('R7C4', 1),
  new Given('R7C8', 3),
  new Given('R7C9', 2),
  new Given('R8C4', 6),
  new Given('R8C5', 5),
  new Given('R8C6', 4),
  new Given('R8C8', 8),
];
