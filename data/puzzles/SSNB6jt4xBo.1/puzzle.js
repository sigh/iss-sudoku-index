// Title: Classic Sudoku
// Author: Unknown
// Video: https://www.youtube.com/watch?v=SSNB6jt4xBo
// Source: https://cracking-the-cryptic.web.app/sudoku/44Fn7G6q32

// Normal sudoku rules apply on the 9x9 grid (default rows/columns/boxes).
// The payload carries no rules text and no clue geometry beyond givens.
// Givens transcribed from the source's drawn grid.

return [
  new Shape('9x9'),
  new Given('R1C3', 1),
  new Given('R1C4', 2),
  new Given('R1C7', 3),
  new Given('R1C8', 4),
  new Given('R1C9', 5),
  new Given('R2C8', 6),
  new Given('R3C2', 7),
  new Given('R3C3', 6),
  new Given('R3C6', 5),
  new Given('R3C7', 2),
  new Given('R5C1', 6),
  new Given('R5C2', 3),
  new Given('R5C3', 4),
  new Given('R5C5', 8),
  new Given('R6C2', 9),
  new Given('R6C3', 8),
  new Given('R6C4', 1),
  new Given('R6C5', 2),
  new Given('R6C8', 3),
  new Given('R7C3', 3),
  new Given('R8C6', 1),
  new Given('R8C7', 4),
  new Given('R9C2', 2),
  new Given('R9C3', 7),
  new Given('R9C5', 9),
  new Given('R9C6', 4),
  new Given('R9C7', 5),
  new Given('R9C9', 3),
];
