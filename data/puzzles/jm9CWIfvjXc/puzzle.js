// Title: Classic Sudoku
// Author: Unknown
// Video: https://www.youtube.com/watch?v=jm9CWIfvjXc
// Source: https://sudokupad.app/gFTTtBG2Tp

// Normal sudoku rules apply on the 9x9 grid (default rows/columns/boxes).
// Givens transcribed from the source's drawn grid.

return [
  new Shape('9x9'),
  new Given('R1C4', 4),
  new Given('R1C8', 8),
  new Given('R1C9', 7),
  new Given('R2C2', 5),
  new Given('R2C6', 9),
  new Given('R3C1', 2),
  new Given('R3C8', 3),
  new Given('R3C9', 5),
  new Given('R4C5', 1),
  new Given('R4C6', 3),
  new Given('R4C9', 8),
  new Given('R6C1', 1),
  new Given('R6C4', 6),
  new Given('R6C5', 2),
  new Given('R6C9', 9),
  new Given('R7C1', 5),
  new Given('R7C2', 8),
  new Given('R7C8', 7),
  new Given('R7C9', 3),
  new Given('R8C4', 7),
  new Given('R9C1', 6),
  new Given('R9C2', 3),
  new Given('R9C4', 9),
  new Given('R9C6', 5),
];
