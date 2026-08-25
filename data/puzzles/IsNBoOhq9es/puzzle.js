// Title: Classic Sudoku
// Author: Unknown
// Video: https://www.youtube.com/watch?v=IsNBoOhq9es
// Source: https://sudokupad.app/n9MLPJbJ3n

// Normal sudoku rules apply on the 9x9 grid (default rows/columns/boxes).
// Givens transcribed from the source's drawn grid.

return [
  new Shape('9x9'),
  new Given('R1C4', 3),
  new Given('R1C6', 8),
  new Given('R1C9', 1),
  new Given('R2C5', 6),
  new Given('R2C8', 3),
  new Given('R2C9', 5),
  new Given('R3C3', 2),
  new Given('R3C8', 9),
  new Given('R4C5', 2),
  new Given('R4C6', 6),
  new Given('R4C8', 4),
  new Given('R5C2', 1),
  new Given('R5C5', 7),
  new Given('R6C2', 7),
  new Given('R6C7', 3),
  new Given('R6C9', 9),
  new Given('R7C1', 9),
  new Given('R7C3', 4),
  new Given('R7C8', 5),
  new Given('R8C2', 8),
  new Given('R8C5', 4),
  new Given('R8C9', 6),
  new Given('R9C6', 7),
];
