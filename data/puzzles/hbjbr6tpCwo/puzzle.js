// Title: Classic Sudoku
// Author: Unknown
// Video: https://www.youtube.com/watch?v=hbjbr6tpCwo
// Source: https://sudokupad.app/6jdr8847Pt

// Normal sudoku rules apply (1-9 in each row, column and 3x3 box). Standard
// 3x3 box regions -- Shape('9x9') supplies rows/columns/boxes, matching the
// 9 whole-box regions in the payload. No other clue types (lines, cages,
// arrows) appear in the payload; the puzzle is fully determined by its 22
// givens below.

// Givens, as drawn on the board (cell ids below are 1-indexed R#C#).
return [
  new Shape('9x9'),

  new Given('R1C2', 2),
  new Given('R1C3', 8),
  new Given('R1C7', 7),
  new Given('R2C3', 7),
  new Given('R2C8', 9),
  new Given('R2C9', 3),
  new Given('R3C7', 4),
  new Given('R4C3', 4),
  new Given('R4C7', 3),
  new Given('R5C6', 5),
  new Given('R5C8', 1),
  new Given('R6C2', 8),
  new Given('R6C4', 1),
  new Given('R6C5', 6),
  new Given('R6C6', 9),
  new Given('R7C5', 1),
  new Given('R7C9', 9),
  new Given('R8C1', 5),
  new Given('R8C8', 3),
  new Given('R9C3', 9),
  new Given('R9C4', 2),
  new Given('R9C6', 4),
];
