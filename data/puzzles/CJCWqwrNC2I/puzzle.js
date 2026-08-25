// Title: Classic Sudoku
// Author: Unknown
// Video: https://www.youtube.com/watch?v=CJCWqwrNC2I
// Source: https://app.crackingthecryptic.com/nPFt33TLd8

// Normal sudoku rules apply (1-9 in each row, column and 3x3 box). Standard
// 3x3 box regions -- Shape('9x9') supplies rows/columns/boxes, matching the
// 9 whole-box regions in the payload. No other clue types (lines, cages,
// arrows) appear in the payload; the puzzle is fully determined by its 30
// givens below.

// Givens, as drawn on the board (cell ids below are 1-indexed R#C#).
return [
  new Shape('9x9'),

  new Given('R1C1', 3),
  new Given('R1C4', 8),
  new Given('R2C2', 6),
  new Given('R2C6', 2),
  new Given('R2C7', 5),
  new Given('R3C1', 8),
  new Given('R3C3', 1),
  new Given('R3C5', 3),
  new Given('R3C8', 2),
  new Given('R4C2', 9),
  new Given('R4C3', 5),
  new Given('R4C6', 3),
  new Given('R4C9', 2),
  new Given('R5C2', 2),
  new Given('R5C4', 5),
  new Given('R5C6', 4),
  new Given('R5C8', 6),
  new Given('R6C1', 6),
  new Given('R6C4', 2),
  new Given('R6C7', 7),
  new Given('R6C8', 5),
  new Given('R7C2', 1),
  new Given('R7C5', 2),
  new Given('R7C7', 8),
  new Given('R7C9', 6),
  new Given('R8C3', 4),
  new Given('R8C4', 3),
  new Given('R8C8', 9),
  new Given('R9C6', 7),
  new Given('R9C9', 5),
];
