// Title: Classic Sudoku
// Author: Unknown
// Video: https://www.youtube.com/watch?v=mnYuzOgAwHo
// Source: https://sudokupad.app/q2mRJFjH9r

// Normal sudoku rules apply on the 9x9 grid (default rows/columns/boxes).
// Givens transcribed from the source's drawn grid.

return [
  new Shape('9x9'),
  new Given('R1C5', 8),
  new Given('R1C8', 1),
  new Given('R2C1', 7),
  new Given('R2C6', 1),
  new Given('R2C8', 2),
  new Given('R3C2', 8),
  new Given('R3C6', 2),
  new Given('R3C7', 3),
  new Given('R4C3', 5),
  new Given('R4C7', 4),
  new Given('R4C9', 9),
  new Given('R5C1', 2),
  new Given('R5C3', 1),
  new Given('R5C6', 9),
  new Given('R5C7', 8),
  new Given('R5C8', 7),
  new Given('R6C3', 9),
  new Given('R6C8', 3),
  new Given('R7C4', 6),
  new Given('R7C5', 9),
  new Given('R8C5', 7),
  new Given('R8C8', 8),
  new Given('R8C9', 3),
  new Given('R9C4', 4),
];
