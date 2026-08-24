// Title: Classic Sudoku
// Author: Unknown
// Video: https://www.youtube.com/watch?v=gV08r2ZnYsw
// Source: https://app.crackingthecryptic.com/sudoku/DtptL3nQmB

// Normal sudoku rules apply (1-9 in each row, column and 3x3 box). Standard
// 3x3 box regions -- Shape('9x9') supplies rows/columns/boxes, matching the
// 9 whole-box regions in the payload. No other clue types (lines, cages,
// arrows, overlays) appear in the payload; the puzzle is fully determined by
// its 23 givens below.

// Givens, as drawn on the board (cell ids below are 1-indexed R#C#).
return [
  new Shape('9x9'),

  new Given('R1C4', 5),
  new Given('R1C5', 6),
  new Given('R1C8', 4),
  new Given('R1C9', 2),
  new Given('R2C4', 9),
  new Given('R2C6', 3),
  new Given('R2C7', 6),
  new Given('R3C2', 8),
  new Given('R3C7', 7),
  new Given('R4C4', 2),
  new Given('R4C9', 6),
  new Given('R5C5', 1),
  new Given('R6C7', 4),
  new Given('R6C8', 5),
  new Given('R7C1', 7),
  new Given('R7C4', 6),
  new Given('R8C1', 1),
  new Given('R8C5', 3),
  new Given('R8C8', 2),
  new Given('R8C9', 9),
  new Given('R9C1', 5),
  new Given('R9C2', 9),
  new Given('R9C6', 4),
];
