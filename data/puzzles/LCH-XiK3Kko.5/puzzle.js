// Title: This Must Be The Place
// Author: Bill Murphy
// Video: https://www.youtube.com/watch?v=LCH-XiK3Kko
// Source: https://f-puzzles.com/?id=2dj54f5t

// Normal sudoku rules apply. The givens are transcribed from the source grid.
return [
  new Shape('9x9'),

  new Given('R1C2', 2), new Given('R1C3', 1), new Given('R1C6', 4),
  new Given('R2C2', 6), new Given('R2C3', 3), new Given('R2C8', 8), new Given('R2C9', 4),
  new Given('R3C4', 1), new Given('R3C8', 5), new Given('R3C9', 3),
  new Given('R4C1', 2), new Given('R4C5', 1), new Given('R4C7', 3),
  new Given('R5C4', 7), new Given('R5C6', 3),
  new Given('R6C3', 7), new Given('R6C5', 5), new Given('R6C9', 6),
  new Given('R7C1', 7), new Given('R7C2', 1), new Given('R7C6', 5),
  new Given('R8C1', 8), new Given('R8C2', 4), new Given('R8C7', 7), new Given('R8C8', 2),
  new Given('R9C4', 8), new Given('R9C7', 5), new Given('R9C8', 6),
];
