// Title: Classic Sudoku
// Author: Unknown
// Video: https://www.youtube.com/watch?v=QgkVz9sdHEs
// Source: https://cracking-the-cryptic.web.app/sudoku/JdJqqNgGnT

// Normal sudoku rules apply on the 9x9 grid (default rows/columns/boxes).
// Givens transcribed from the source's drawn grid.

return [
  new Shape('9x9'),
  new Given('R1C1', 6),
  new Given('R1C2', 3),
  new Given('R1C8', 8),
  new Given('R1C9', 1),
  new Given('R2C2', 2),
  new Given('R2C6', 3),
  new Given('R3C5', 1),
  new Given('R3C6', 7),
  new Given('R3C7', 4),
  new Given('R3C8', 3),
  new Given('R4C2', 9),
  new Given('R4C3', 6),
  new Given('R4C4', 4),
  new Given('R4C7', 5),
  new Given('R4C8', 7),
  new Given('R5C4', 7),
  new Given('R5C5', 6),
  new Given('R5C6', 2),
  new Given('R6C2', 8),
  new Given('R6C7', 6),
  new Given('R7C2', 6),
  new Given('R7C5', 2),
  new Given('R8C1', 3),
  new Given('R8C3', 9),
  new Given('R8C8', 6),
  new Given('R9C9', 9),
];
