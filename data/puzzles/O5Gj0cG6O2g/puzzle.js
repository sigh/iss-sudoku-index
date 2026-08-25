// Title: Classic Sudoku
// Author: Unknown
// Video: https://www.youtube.com/watch?v=O5Gj0cG6O2g
// Source: https://app.crackingthecryptic.com/mqbPDdJPrR

// Normal sudoku rules apply (1-9 in each row, column and 3x3 box). Standard
// 3x3 box regions -- Shape('9x9') supplies rows/columns/boxes, matching the
// 9 whole-box regions in the payload. No other clue types (lines, cages,
// arrows) appear in the payload; the puzzle is fully determined by its 25
// givens below.

// Givens, as drawn on the board (cell ids below are 1-indexed R#C#).
return [
  new Shape('9x9'),

  new Given('R1C1', 2),
  new Given('R1C2', 8),
  new Given('R1C7', 7),
  new Given('R2C1', 4),
  new Given('R2C2', 5),
  new Given('R2C5', 8),
  new Given('R3C6', 4),
  new Given('R4C1', 5),
  new Given('R5C1', 9),
  new Given('R5C6', 6),
  new Given('R5C7', 3),
  new Given('R6C1', 8),
  new Given('R6C3', 6),
  new Given('R6C7', 1),
  new Given('R6C8', 2),
  new Given('R7C5', 9),
  new Given('R7C6', 5),
  new Given('R7C9', 6),
  new Given('R8C5', 2),
  new Given('R8C6', 3),
  new Given('R8C9', 1),
  new Given('R9C1', 6),
  new Given('R9C4', 8),
  new Given('R9C6', 1),
  new Given('R9C8', 5),
];
