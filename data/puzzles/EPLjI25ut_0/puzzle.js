// Title: Classic Sudoku
// Author: Unknown
// Video: https://www.youtube.com/watch?v=EPLjI25ut_0
// Source: https://sudokupad.app/HDT2937GnR

// Normal sudoku rules apply (1-9 in each row, column and 3x3 box). Standard
// 3x3 box regions -- Shape('9x9') supplies rows/columns/boxes, matching the
// 9 whole-box regions in the payload. No other clue types (lines, cages,
// arrows) appear in the payload; the puzzle is fully determined by its 23
// givens below.

// Givens, as drawn on the board (cell ids below are 1-indexed R#C#).
return [
  new Shape('9x9'),

  new Given('R1C4', 3),
  new Given('R1C5', 4),
  new Given('R1C9', 9),
  new Given('R2C1', 2),
  new Given('R2C5', 7),
  new Given('R3C2', 8),
  new Given('R3C6', 6),
  new Given('R3C8', 4),
  new Given('R4C2', 9),
  new Given('R4C3', 7),
  new Given('R4C7', 2),
  new Given('R5C5', 8),
  new Given('R5C7', 5),
  new Given('R6C4', 7),
  new Given('R6C5', 3),
  new Given('R6C9', 4),
  new Given('R7C2', 4),
  new Given('R7C6', 1),
  new Given('R7C8', 8),
  new Given('R8C1', 9),
  new Given('R8C2', 6),
  new Given('R8C9', 5),
  new Given('R9C8', 3),
];
