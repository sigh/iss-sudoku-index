// Title: 22
// Author: Bill Murphy
// Video: https://www.youtube.com/watch?v=JrBPy-kJ7dg
// Source: https://tinyurl.com/5ev472pf

// Normal sudoku rules apply. No other clues are drawn (no cages, lines, or
// regions beyond the default 3x3 boxes); the title names the given count.
// Givens transcribed from the source grid (row-major, 1-indexed cells).

return [
  new Shape('9x9'),
  new Given('R2C3', 1),
  new Given('R2C4', 5),
  new Given('R2C8', 3),
  new Given('R3C2', 8),
  new Given('R3C5', 2),
  new Given('R3C8', 4),
  new Given('R4C2', 4),
  new Given('R4C5', 6),
  new Given('R4C7', 7),
  new Given('R5C3', 7),
  new Given('R5C4', 3),
  new Given('R5C6', 1),
  new Given('R5C7', 5),
  new Given('R6C3', 3),
  new Given('R6C5', 8),
  new Given('R6C8', 2),
  new Given('R7C2', 2),
  new Given('R7C5', 4),
  new Given('R7C8', 6),
  new Given('R8C2', 5),
  new Given('R8C6', 7),
  new Given('R8C7', 3),
];
