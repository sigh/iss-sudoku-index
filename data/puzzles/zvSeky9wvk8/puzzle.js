// Title: Super Fiendish Classic Sudoku
// Author: Unknown
// Video: https://www.youtube.com/watch?v=zvSeky9wvk8
// Source: https://cracking-the-cryptic.web.app/sudoku/dd3L2Pd6gq

// Standard classic sudoku: fill the grid so each row, column, and 3x3 box
// contains 1-9 exactly once. No additional rules text is carried by the
// payload, and the payload's `regions` array is exactly the ordinary
// nine 3x3 boxes, so no explicit Regions constraint is needed.

return [
  new Shape('9x9'),

  // Givens, transcribed from the payload's cell grid.
  new Given('R1C1', 6), new Given('R1C3', 4), new Given('R1C5', 1),
  new Given('R1C7', 7), new Given('R1C9', 9),
  new Given('R2C2', 9), new Given('R2C4', 2), new Given('R2C9', 4),
  new Given('R3C7', 3), new Given('R3C8', 8),
  new Given('R4C4', 8), new Given('R4C5', 5), new Given('R4C7', 4), new Given('R4C9', 1),
  new Given('R5C4', 1), new Given('R5C6', 2),
  new Given('R6C1', 1), new Given('R6C3', 9), new Given('R6C5', 7), new Given('R6C6', 4),
  new Given('R7C2', 1), new Given('R7C3', 7),
  new Given('R8C1', 4), new Given('R8C6', 1), new Given('R8C8', 3),
  new Given('R9C1', 9), new Given('R9C3', 8), new Given('R9C5', 6), new Given('R9C7', 2), new Given('R9C9', 7),
];
