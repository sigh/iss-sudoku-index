// Title: Classic Sudoku
// Author: Unknown
// Video: https://www.youtube.com/watch?v=1R0_KWbBhCg
// Source: https://cracking-the-cryptic.web.app/sudoku/dQFJfqP24f

// Normal sudoku rules apply on the 9x9 grid (default rows/columns/boxes).
// Givens transcribed from the source's drawn grid.

return [
  new Shape('9x9'),
  new Given('R1C4', 7),
  new Given('R1C8', 2),
  new Given('R2C3', 2),
  new Given('R2C6', 8),
  new Given('R2C9', 5),
  new Given('R3C1', 4),
  new Given('R3C5', 9),
  new Given('R3C7', 3),
  new Given('R4C3', 9),
  new Given('R4C6', 4),
  new Given('R4C8', 1),
  new Given('R5C2', 3),
  new Given('R6C1', 5),
  new Given('R6C5', 3),
  new Given('R6C7', 9),
  new Given('R7C3', 8),
  new Given('R7C6', 5),
  new Given('R7C8', 6),
  new Given('R8C1', 7),
  new Given('R8C4', 2),
  new Given('R8C7', 8),
  new Given('R9C5', 6),
  new Given('R9C9', 2),
];
