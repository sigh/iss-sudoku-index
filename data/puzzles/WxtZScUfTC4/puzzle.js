// Title: Classic Sudoku
// Author: Unknown
// Video: https://www.youtube.com/watch?v=WxtZScUfTC4
// Source: https://sudokupad.app/FFm6MhQmGJ

// Normal sudoku rules apply on the 9x9 grid (default rows/columns/boxes).
// Givens transcribed from the source's drawn grid.

return [
  new Shape('9x9'),
  new Given('R2C1', 4),
  new Given('R2C2', 1),
  new Given('R2C4', 2),
  new Given('R3C2', 9),
  new Given('R3C5', 8),
  new Given('R3C6', 6),
  new Given('R3C7', 3),
  new Given('R4C1', 1),
  new Given('R4C3', 5),
  new Given('R4C5', 4),
  new Given('R4C7', 7),
  new Given('R5C1', 6),
  new Given('R5C4', 7),
  new Given('R5C6', 2),
  new Given('R5C7', 4),
  new Given('R6C1', 2),
  new Given('R6C5', 3),
  new Given('R6C8', 6),
  new Given('R7C1', 8),
  new Given('R7C6', 3),
  new Given('R8C7', 2),
  new Given('R8C8', 1),
  new Given('R9C3', 1),
  new Given('R9C4', 8),
  new Given('R9C5', 6),
  new Given('R9C6', 7),
  new Given('R9C8', 3),
];
