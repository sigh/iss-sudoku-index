// Title: Classic Sudoku
// Author: Unknown
// Video: https://www.youtube.com/watch?v=rczngsWVClM
// Source: https://cracking-the-cryptic.web.app/sudoku/R3mggLN632

// Normal sudoku rules apply on the 9x9 grid (default rows/columns/boxes).
// Givens transcribed from the source's drawn grid.

return [
  new Shape('9x9'),
  new Given('R1C5', 4),
  new Given('R1C8', 1),
  new Given('R2C2', 8),
  new Given('R2C6', 3),
  new Given('R2C8', 4),
  new Given('R3C1', 5),
  new Given('R3C4', 2),
  new Given('R3C5', 9),
  new Given('R4C4', 9),
  new Given('R4C9', 7),
  new Given('R5C2', 6),
  new Given('R5C3', 7),
  new Given('R5C7', 8),
  new Given('R6C2', 1),
  new Given('R6C5', 3),
  new Given('R7C1', 6),
  new Given('R7C4', 8),
  new Given('R7C6', 9),
  new Given('R8C1', 3),
  new Given('R8C5', 1),
  new Given('R8C8', 5),
  new Given('R9C3', 9),
  new Given('R9C5', 5),
  new Given('R9C7', 6),
];
