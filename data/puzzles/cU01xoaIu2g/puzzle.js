// Title: Classic Sudoku
// Author: Unknown
// Video: https://www.youtube.com/watch?v=cU01xoaIu2g
// Source: https://app.crackingthecryptic.com/sudoku/29BFdnMFh2

// Classic Sudoku: default row, column, and 3x3 box all-different rules.
// The source payload has no additional clues or geometry.

// Givens, transcribed from the source grid in row-major order.
return [
  new Shape('9x9'),
  new Given('R1C2', 3), new Given('R1C4', 7), new Given('R1C8', 8),
  new Given('R2C1', 5), new Given('R2C4', 8), new Given('R2C5', 9), new Given('R2C6', 2),
  new Given('R3C4', 6), new Given('R3C6', 1),
  new Given('R4C1', 3), new Given('R4C3', 1), new Given('R4C7', 2), new Given('R4C8', 6),
  new Given('R5C2', 8), new Given('R5C4', 2),
  new Given('R6C6', 3), new Given('R6C7', 7), new Given('R6C9', 8),
  new Given('R7C1', 8), new Given('R7C2', 5), new Given('R7C3', 3), new Given('R7C5', 6), new Given('R7C8', 1),
  new Given('R8C2', 7),
  new Given('R9C1', 1), new Given('R9C3', 6),
];
