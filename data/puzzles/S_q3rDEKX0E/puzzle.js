// Title: Classic Sudoku
// Author: Unknown
// Video: https://www.youtube.com/watch?v=S_q3rDEKX0E
// Source: https://app.crackingthecryptic.com/TN438mdjj7

// Normal sudoku rules apply (1-9 in each row, column and 3x3 box). Standard
// 3x3 box regions -- Shape('9x9') supplies rows/columns/boxes, matching the
// 9 whole-box regions in the payload. No other clue types (lines, cages,
// arrows) appear in the payload; the puzzle is fully determined by its 23
// givens below.

// Givens, as drawn on the board (cell ids below are 1-indexed R#C#).
return [
  new Shape('9x9'),

  new Given('R1C4', 4),
  new Given('R1C6', 5),
  new Given('R1C7', 9),
  new Given('R2C1', 4),
  new Given('R2C5', 6),
  new Given('R2C6', 3),
  new Given('R2C9', 5),
  new Given('R3C2', 6),
  new Given('R3C4', 9),
  new Given('R4C2', 4),
  new Given('R4C3', 5),
  new Given('R5C9', 6),
  new Given('R6C1', 1),
  new Given('R6C5', 8),
  new Given('R6C7', 7),
  new Given('R6C9', 3),
  new Given('R7C2', 8),
  new Given('R8C4', 8),
  new Given('R8C5', 3),
  new Given('R8C6', 1),
  new Given('R9C3', 3),
  new Given('R9C8', 2),
  new Given('R9C9', 7),
];
