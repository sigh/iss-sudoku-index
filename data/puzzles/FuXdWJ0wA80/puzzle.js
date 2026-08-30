// Title: Classic Sudoku
// Author: Unknown
// Video: https://www.youtube.com/watch?v=FuXdWJ0wA80
// Source: https://cracking-the-cryptic.web.app/sudoku/LpJfdd7jFf

// Normal sudoku rules apply on the 9x9 grid (default rows/columns/boxes).
// Payload carries no metadata.rules text and no clue geometry beyond the
// givens; its regions array lists exactly the nine standard 3x3 boxes.
// Givens transcribed from the source's drawn grid.

return [
  new Shape('9x9'),
  new Given('R1C2', 6),
  new Given('R1C4', 1),
  new Given('R1C5', 4),
  new Given('R2C4', 6),
  new Given('R3C1', 3),
  new Given('R3C3', 4),
  new Given('R3C5', 9),
  new Given('R3C6', 8),
  new Given('R3C8', 1),
  new Given('R4C3', 1),
  new Given('R4C4', 7),
  new Given('R4C5', 6),
  new Given('R4C6', 2),
  new Given('R4C8', 4),
  new Given('R5C3', 7),
  new Given('R6C3', 9),
  new Given('R6C5', 8),
  new Given('R6C8', 7),
  new Given('R6C9', 5),
  new Given('R7C1', 4),
  new Given('R7C2', 9),
  new Given('R7C5', 1),
  new Given('R7C8', 2),
  new Given('R7C9', 3),
  new Given('R8C1', 2),
  new Given('R8C3', 8),
  new Given('R8C9', 4),
  new Given('R9C8', 6),
];
