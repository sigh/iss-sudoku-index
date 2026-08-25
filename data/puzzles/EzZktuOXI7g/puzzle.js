// Title: Classic Sudoku
// Author: Unknown
// Video: https://www.youtube.com/watch?v=EzZktuOXI7g
// Source: https://sudokupad.app/rbBdPtqQg4

// Normal sudoku rules apply (1-9 in each row, column and 3x3 box). Standard
// 3x3 box regions -- Shape('9x9') supplies rows/columns/boxes, matching the
// 9 whole-box regions in the payload. No other clue types (lines, cages,
// arrows) appear in the payload; the puzzle is fully determined by its 25
// givens below.

// Givens, as drawn on the board (cell ids below are 1-indexed R#C#).
return [
  new Shape('9x9'),

  new Given('R1C2', 9),
  new Given('R1C8', 6),
  new Given('R2C4', 1),
  new Given('R2C5', 2),
  new Given('R2C8', 8),
  new Given('R2C9', 7),
  new Given('R3C1', 7),
  new Given('R3C3', 8),
  new Given('R3C7', 3),
  new Given('R4C3', 9),
  new Given('R4C4', 8),
  new Given('R4C8', 2),
  new Given('R5C1', 6),
  new Given('R5C3', 4),
  new Given('R5C9', 3),
  new Given('R6C1', 5),
  new Given('R6C9', 8),
  new Given('R7C3', 3),
  new Given('R7C4', 2),
  new Given('R7C5', 9),
  new Given('R8C2', 7),
  new Given('R8C6', 5),
  new Given('R8C7', 4),
  new Given('R9C2', 6),
  new Given('R9C5', 7),
];
