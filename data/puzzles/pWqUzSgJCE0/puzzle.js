// Title: The Most Under-Used Sudoku Technique
// Author: Unknown
// Video: https://www.youtube.com/watch?v=pWqUzSgJCE0
// Source: https://cracking-the-cryptic.web.app/sudoku/GBmQn9bL9d

// Classic Sudoku: standard row/column/box all-different rules apply (the
// payload's regions match the default 3x3 box partition, so no explicit
// Regions constraint is needed). No other clue geometry is present.

return [
  new Shape('9x9'),

  // Givens, transcribed from the payload's cell grid.
  new Given('R1C1', 8), new Given('R1C6', 6), new Given('R1C7', 3), new Given('R1C9', 5),
  new Given('R2C2', 4), new Given('R2C8', 7),
  new Given('R4C2', 1), new Given('R4C5', 3), new Given('R4C6', 8), new Given('R4C7', 7), new Given('R4C9', 4),
  new Given('R5C4', 1), new Given('R5C6', 4),
  new Given('R6C1', 3), new Given('R6C5', 7), new Given('R6C7', 2), new Given('R6C8', 9),
  new Given('R7C6', 3),
  new Given('R8C2', 2), new Given('R8C8', 4),
  new Given('R9C1', 5), new Given('R9C3', 6), new Given('R9C4', 8), new Given('R9C9', 2),
];
