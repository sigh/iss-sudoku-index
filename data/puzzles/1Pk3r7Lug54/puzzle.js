// Title: Classic Sudoku
// Author: Unknown
// Video: https://www.youtube.com/watch?v=1Pk3r7Lug54
// Source: https://app.crackingthecryptic.com/gBt8tfppDT

// Normal sudoku rules apply (1-9 in each row, column and 3x3 box). Standard
// 3x3 box regions -- Shape('9x9') supplies rows/columns/boxes, matching the
// 9 whole-box regions in the payload. No other clue types (lines, cages,
// arrows) appear in the payload; the puzzle is fully determined by its 22
// givens below.

// Givens, as drawn on the board (cell ids below are 1-indexed R#C#).
return [
  new Shape('9x9'),

  new Given('R1C1', 5),
  new Given('R1C3', 9),
  new Given('R2C2', 2),
  new Given('R2C5', 1),
  new Given('R2C7', 6),
  new Given('R2C9', 7),
  new Given('R3C3', 8),
  new Given('R3C7', 2),
  new Given('R4C9', 2),
  new Given('R5C1', 3),
  new Given('R5C3', 2),
  new Given('R5C4', 9),
  new Given('R5C7', 5),
  new Given('R6C2', 6),
  new Given('R6C5', 8),
  new Given('R6C8', 7),
  new Given('R7C2', 4),
  new Given('R7C5', 7),
  new Given('R8C4', 6),
  new Given('R8C5', 4),
  new Given('R8C6', 1),
  new Given('R9C6', 3),
];
