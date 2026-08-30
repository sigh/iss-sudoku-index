// Title: Classic Sudoku
// Author: Unknown
// Video: https://www.youtube.com/watch?v=U7eIBuo8v3M
// Source: https://cracking-the-cryptic.web.app/sudoku/nB8n6qjRfQ

// Normal sudoku rules apply on the 9x9 grid (default rows/columns/boxes).
// Givens transcribed from the source's drawn grid.

return [
  new Shape('9x9'),
  new Given('R1C5', 1),
  new Given('R2C4', 2),
  new Given('R2C6', 3),
  new Given('R3C4', 4),
  new Given('R3C5', 5),
  new Given('R3C6', 6),
  new Given('R4C3', 6),
  new Given('R4C7', 1),
  new Given('R5C2', 1),
  new Given('R5C8', 8),
  new Given('R6C1', 8),
  new Given('R6C2', 9),
  new Given('R6C3', 5),
  new Given('R6C7', 3),
  new Given('R6C8', 6),
  new Given('R6C9', 4),
  new Given('R7C2', 2),
  new Given('R7C3', 9),
  new Given('R7C7', 6),
  new Given('R7C8', 1),
  new Given('R8C1', 6),
  new Given('R8C2', 3),
  new Given('R8C8', 9),
  new Given('R8C9', 2),
  new Given('R9C1', 4),
  new Given('R9C9', 5),
];
