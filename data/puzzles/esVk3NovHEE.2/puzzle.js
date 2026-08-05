// Title: Classic Sudoku
// Author: jovi_al
// Video: https://www.youtube.com/watch?v=esVk3NovHEE
// Source: https://tinyurl.com/6jsj8dbv

// Classic Sudoku: default row, column, and 3x3 box all-different rules.
// The source payload has no additional clues or geometry.

// Givens, transcribed from the source grid in row-major order.
return [
  new Shape('9x9'),
  new Given('R1C1', 8), new Given('R1C9', 9),
  new Given('R2C4', 4), new Given('R2C5', 3), new Given('R2C6', 5),
  new Given('R3C6', 6),
  new Given('R4C2', 7), new Given('R4C3', 3), new Given('R4C8', 5),
  new Given('R5C2', 5), new Given('R5C5', 8), new Given('R5C8', 6),
  new Given('R6C2', 6), new Given('R6C7', 7), new Given('R6C8', 4),
  new Given('R7C4', 2),
  new Given('R8C4', 3), new Given('R8C5', 5), new Given('R8C6', 4),
  new Given('R9C1', 1), new Given('R9C9', 8),
];
