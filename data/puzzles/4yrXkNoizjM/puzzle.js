// Title: Classic Sudoku
// Author: Yaacov Meiyer
// Video: https://www.youtube.com/watch?v=4yrXkNoizjM
// Source: https://app.crackingthecryptic.com/sudoku/FN3bNhpNpG

// Classic Sudoku: default row, column, and 3x3 box all-different rules.
// The source payload has no additional clues or geometry.

// Givens, transcribed from the source grid in row-major order.
return [
  new Shape('9x9'),
  new Given('R1C3', 3),
  new Given('R2C1', 6), new Given('R2C2', 9), new Given('R2C7', 5),
  new Given('R3C3', 2), new Given('R3C5', 4), new Given('R3C7', 1),
  new Given('R4C2', 2), new Given('R4C3', 6), new Given('R4C4', 4), new Given('R4C7', 7),
  new Given('R5C1', 1), new Given('R5C3', 8), new Given('R5C5', 6), new Given('R5C9', 9),
  new Given('R6C5', 2), new Given('R6C8', 5),
  new Given('R7C2', 3), new Given('R7C5', 8), new Given('R7C9', 6),
  new Given('R8C4', 1), new Given('R8C6', 7),
  new Given('R9C4', 3),
];
