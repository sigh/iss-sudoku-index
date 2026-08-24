// Title: Classic Sudoku
// Author: Unknown
// Video: https://www.youtube.com/watch?v=9LiliVhGQUU
// Source: https://app.crackingthecryptic.com/sudoku/DQfnGdp3q2

// Classic Sudoku: default row, column, and 3x3 box all-different rules.
// The source payload has no additional clues or geometry.

// Givens, transcribed from the source grid in row-major order.
return [
  new Shape('9x9'),
  new Given('R1C1', 9), new Given('R1C3', 6), new Given('R1C5', 7),
  new Given('R2C3', 1), new Given('R2C5', 4),
  new Given('R3C4', 2), new Given('R3C7', 8), new Given('R3C8', 1),
  new Given('R4C2', 8), new Given('R4C3', 5), new Given('R4C9', 7),
  new Given('R5C2', 3), new Given('R5C3', 4), new Given('R5C9', 6),
  new Given('R6C6', 4),
  new Given('R7C4', 9), new Given('R7C5', 1), new Given('R7C7', 6),
  new Given('R8C3', 7), new Given('R8C4', 6), new Given('R8C6', 3), new Given('R8C9', 5),
  new Given('R9C8', 3),
];
