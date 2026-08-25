// Title: Classic Sudoku
// Author: Unknown
// Video: https://www.youtube.com/watch?v=8dNHOyzH-gc
// Source: https://sudokupad.app/ggnPfBHNrT

// Normal sudoku rules apply (1-9 in each row, column and 3x3 box). Standard
// 3x3 box regions -- Shape('9x9') supplies rows/columns/boxes, matching the
// 9 whole-box regions in the payload. No other clue types (lines, cages,
// arrows) appear in the payload; the puzzle is fully determined by its 21
// givens below.

// Givens, as drawn on the board (cell ids below are 1-indexed R#C#).
return [
  new Shape('9x9'),

  new Given('R1C2', 2),
  new Given('R1C9', 5),
  new Given('R2C3', 4),
  new Given('R2C5', 7),
  new Given('R2C9', 1),
  new Given('R3C5', 3),
  new Given('R4C2', 7),
  new Given('R4C5', 2),
  new Given('R4C7', 9),
  new Given('R5C1', 4),
  new Given('R5C7', 3),
  new Given('R6C4', 6),
  new Given('R6C9', 8),
  new Given('R7C2', 5),
  new Given('R7C3', 6),
  new Given('R7C8', 1),
  new Given('R8C4', 3),
  new Given('R8C7', 7),
  new Given('R8C9', 2),
  new Given('R9C1', 9),
  new Given('R9C4', 8),
];
