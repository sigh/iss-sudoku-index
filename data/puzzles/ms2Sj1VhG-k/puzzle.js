// Title: Classic Sudoku
// Author: Tom Collyer
// Video: https://www.youtube.com/watch?v=ms2Sj1VhG-k
// Source: https://cracking-the-cryptic.web.app/sudoku/3t4JmBf7Lh

// Normal sudoku rules apply on the 9x9 grid (default rows/columns/boxes).
// Givens transcribed from the source's drawn grid.

return [
  new Shape('9x9'),
  new Given('R1C6', 6),
  new Given('R1C8', 4),
  new Given('R2C1', 8),
  new Given('R2C5', 5),
  new Given('R2C9', 2),
  new Given('R3C2', 7),
  new Given('R3C4', 4),
  new Given('R3C7', 9),
  new Given('R4C3', 6),
  new Given('R4C6', 3),
  new Given('R4C8', 1),
  new Given('R5C1', 5),
  new Given('R5C9', 3),
  new Given('R6C2', 4),
  new Given('R6C4', 1),
  new Given('R6C7', 7),
  new Given('R7C3', 3),
  new Given('R7C6', 9),
  new Given('R7C8', 6),
  new Given('R8C1', 2),
  new Given('R8C5', 8),
  new Given('R8C9', 5),
  new Given('R9C2', 1),
  new Given('R9C4', 7),
];
