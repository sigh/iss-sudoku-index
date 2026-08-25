// Title: Classic Sudoku
// Author: Unknown
// Video: https://www.youtube.com/watch?v=YH4K_joQ8SA
// Source: https://sudokupad.app/4BBDgJHh67

// Normal sudoku rules apply on the 9x9 grid (default rows/columns/boxes).
// Givens transcribed from the source's drawn grid.

return [
  new Shape('9x9'),
  new Given('R1C4', 9),
  new Given('R1C6', 4),
  new Given('R2C3', 5),
  new Given('R2C5', 7),
  new Given('R2C7', 6),
  new Given('R3C5', 8),
  new Given('R4C3', 8),
  new Given('R4C4', 1),
  new Given('R4C5', 9),
  new Given('R4C6', 3),
  new Given('R4C7', 7),
  new Given('R5C5', 5),
  new Given('R6C1', 2),
  new Given('R6C9', 8),
  new Given('R7C1', 7),
  new Given('R7C2', 3),
  new Given('R7C8', 1),
  new Given('R8C3', 2),
  new Given('R8C4', 7),
  new Given('R8C6', 9),
  new Given('R8C7', 3),
  new Given('R9C1', 6),
  new Given('R9C2', 8),
  new Given('R9C8', 5),
  new Given('R9C9', 7),
];
