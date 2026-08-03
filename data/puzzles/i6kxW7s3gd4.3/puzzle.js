// Title: So You Kno
// Author: Bill Murphy
// Video: https://www.youtube.com/watch?v=i6kxW7s3gd4
// Source: https://tinyurl.com/5n7rzpad

// Normal sudoku rules apply. The payload carries only 28 given digits and no
// cages, lines, arrows, or other drawn geometry, so the default row, column
// and box all-different groups are the whole rule set.

return [
  new Shape('9x9'),

  // Givens, transcribed from the puzzle grid.
  new Given('R2C1', 7), new Given('R2C3', 9), new Given('R2C5', 8),
  new Given('R2C7', 4), new Given('R2C9', 6),
  new Given('R3C2', 1), new Given('R3C4', 7), new Given('R3C6', 4),
  new Given('R3C8', 3),
  new Given('R4C1', 6), new Given('R4C3', 4), new Given('R4C5', 5),
  new Given('R4C7', 8), new Given('R4C9', 2),
  new Given('R6C1', 3), new Given('R6C3', 7), new Given('R6C5', 6),
  new Given('R6C7', 1), new Given('R6C9', 9),
  new Given('R7C2', 2), new Given('R7C4', 3), new Given('R7C6', 8),
  new Given('R7C8', 4),
  new Given('R8C1', 4), new Given('R8C3', 1), new Given('R8C5', 7),
  new Given('R8C7', 5), new Given('R8C9', 3),
];
