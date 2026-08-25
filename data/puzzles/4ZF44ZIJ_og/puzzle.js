// Title: Classic Sudoku
// Author: Unknown
// Video: https://www.youtube.com/watch?v=4ZF44ZIJ_og
// Source: https://app.crackingthecryptic.com/g3H9R2Dtq6

// Normal sudoku rules apply: standard row/column/box all-different, which
// Shape('9x9') provides by default. No cages, lines, arrows, or other
// overlays are present in the payload.

return [
  new Shape('9x9'),

  // Givens transcribed from the puzzle's drawn cell values.
  new Given('R2C1', 4), new Given('R2C2', 1), new Given('R2C4', 5), new Given('R2C7', 7),
  new Given('R3C2', 5), new Given('R3C5', 9), new Given('R3C7', 8), new Given('R3C9', 1),
  new Given('R4C1', 6), new Given('R4C5', 4), new Given('R4C9', 3),
  new Given('R5C1', 8), new Given('R5C3', 9), new Given('R5C5', 1), new Given('R5C7', 4),
  new Given('R6C2', 7), new Given('R6C7', 2),
  new Given('R7C7', 3), new Given('R7C9', 8),
  new Given('R8C4', 1),
  new Given('R9C3', 3), new Given('R9C4', 7), new Given('R9C6', 2), new Given('R9C8', 6),
];
