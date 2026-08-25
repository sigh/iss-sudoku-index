// Title: Classic Sudoku
// Author: Unknown
// Video: https://www.youtube.com/watch?v=15IlX3jN0HY
// Source: https://sudokupad.app/hgdGjtRpJT

// Normal sudoku rules apply on the 9x9 grid (default rows/columns/boxes).
// Givens transcribed from the source's drawn grid.

return [
  new Shape('9x9'),
  new Given('R1C2', 4),
  new Given('R2C1', 2),
  new Given('R2C5', 4),
  new Given('R2C7', 3),
  new Given('R2C8', 9),
  new Given('R3C2', 1),
  new Given('R3C6', 2),
  new Given('R3C7', 8),
  new Given('R4C1', 6),
  new Given('R4C6', 5),
  new Given('R4C8', 8),
  new Given('R5C2', 8),
  new Given('R5C7', 1),
  new Given('R5C8', 4),
  new Given('R6C1', 4),
  new Given('R6C6', 7),
  new Given('R6C8', 3),
  new Given('R7C2', 6),
  new Given('R7C5', 9),
  new Given('R7C6', 3),
  new Given('R7C8', 1),
  new Given('R7C9', 7),
  new Given('R8C3', 7),
  new Given('R8C4', 1),
  new Given('R9C2', 9),
  new Given('R9C4', 2),
  new Given('R9C8', 6),
];
