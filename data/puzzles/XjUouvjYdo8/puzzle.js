// Title: A Lesson in Solving Sudoku
// Author: Unknown
// Video: https://www.youtube.com/watch?v=XjUouvjYdo8
// Source: https://cracking-the-cryptic.web.app/sudoku/FFHRdnb7fG

// Normal sudoku rules apply on the 9x9 grid (default rows/columns/boxes).
// Givens transcribed from the source's drawn grid.

return [
  new Shape('9x9'),
  new Given('R1C3', 3),
  new Given('R1C9', 6),
  new Given('R2C2', 6),
  new Given('R2C4', 3),
  new Given('R2C5', 2),
  new Given('R2C6', 9),
  new Given('R3C1', 9),
  new Given('R3C3', 8),
  new Given('R3C4', 4),
  new Given('R3C9', 3),
  new Given('R4C2', 1),
  new Given('R4C6', 3),
  new Given('R5C3', 9),
  new Given('R5C8', 8),
  new Given('R6C2', 7),
  new Given('R6C4', 1),
  new Given('R6C5', 9),
  new Given('R6C9', 2),
  new Given('R7C6', 5),
  new Given('R7C7', 7),
  new Given('R8C1', 4),
  new Given('R8C4', 2),
  new Given('R8C6', 6),
  new Given('R8C8', 1),
  new Given('R9C6', 4),
  new Given('R9C7', 9),
  new Given('R9C9', 5),
];
