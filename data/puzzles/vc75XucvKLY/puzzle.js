// Title: Classic Sudoku
// Author: Unknown
// Video: https://www.youtube.com/watch?v=vc75XucvKLY
// Source: https://sudokupad.app/dqdNJH8PPq
//
// Normal sudoku rules apply: standard 9x9 grid, digits 1-9 once per row,
// column, and 3x3 box (all provided by the default Shape('9x9')). No cages,
// lines, arrows, or other clues are present on the board.
//
// Givens transcribed from the payload's `cells` array (row-major, 1-indexed).
return [
  new Shape('9x9'),
  new Given('R1C6', 4),
  new Given('R2C7', 5),
  new Given('R2C9', 7),
  new Given('R3C2', 5),
  new Given('R3C3', 1),
  new Given('R3C4', 9),
  new Given('R3C5', 7),
  new Given('R4C1', 2),
  new Given('R4C4', 6),
  new Given('R4C5', 1),
  new Given('R4C8', 3),
  new Given('R5C1', 3),
  new Given('R5C3', 8),
  new Given('R5C7', 6),
  new Given('R5C9', 2),
  new Given('R6C2', 6),
  new Given('R6C5', 3),
  new Given('R6C6', 7),
  new Given('R6C9', 1),
  new Given('R7C5', 4),
  new Given('R7C6', 6),
  new Given('R7C7', 3),
  new Given('R7C8', 8),
  new Given('R8C1', 6),
  new Given('R8C3', 4),
  new Given('R9C4', 3),
];
