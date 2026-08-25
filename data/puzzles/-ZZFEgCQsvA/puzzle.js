// Title: Classic Sudoku
// Author: Unknown
// Video: https://www.youtube.com/watch?v=-ZZFEgCQsvA
// Source: https://sudokupad.app/fd4j9hQfBn

// Normal sudoku rules apply on the 9x9 grid (default rows/columns/boxes).
// Givens transcribed from the source's drawn grid.

return [
  new Shape('9x9'),
  new Given('R1C3', 1),
  new Given('R1C5', 6),
  new Given('R1C8', 5),
  new Given('R1C9', 9),
  new Given('R2C6', 3),
  new Given('R2C8', 2),
  new Given('R3C2', 6),
  new Given('R3C5', 8),
  new Given('R4C1', 4),
  new Given('R4C7', 5),
  new Given('R5C2', 2),
  new Given('R6C2', 7),
  new Given('R6C4', 2),
  new Given('R6C7', 4),
  new Given('R6C8', 8),
  new Given('R7C1', 8),
  new Given('R7C7', 9),
  new Given('R7C9', 5),
  new Given('R8C1', 7),
  new Given('R8C4', 6),
  new Given('R8C6', 9),
  new Given('R8C8', 3),
  new Given('R9C3', 5),
  new Given('R9C8', 4),
];
