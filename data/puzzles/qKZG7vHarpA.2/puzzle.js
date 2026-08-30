// Title: Unknown
// Author: Unknown
// Video: https://www.youtube.com/watch?v=qKZG7vHarpA
// Source: https://cracking-the-cryptic.web.app/sudoku/t6dRJM7TPH

// Standard Sudoku (rows, columns, 3x3 boxes) plus both main diagonals as
// all-different groups (the two grey lines drawn corner-to-corner; the
// video description calls this puzzle "a diagonal").
return [
  new Shape('9x9'),
  new Diagonal(1),
  new Diagonal(-1),

  new Given('R1C2', 8), new Given('R1C3', 6), new Given('R1C5', 3), new Given('R1C8', 9),
  new Given('R2C1', 7), new Given('R2C3', 5),
  new Given('R3C5', 6), new Given('R3C8', 1),
  new Given('R4C2', 3),
  new Given('R5C1', 8), new Given('R5C3', 2), new Given('R5C7', 1), new Given('R5C9', 5),
  new Given('R6C8', 3),
  new Given('R7C2', 5), new Given('R7C5', 4),
  new Given('R8C1', 2), new Given('R8C7', 6), new Given('R8C9', 3),
  new Given('R9C2', 7), new Given('R9C5', 9), new Given('R9C7', 2), new Given('R9C8', 8),
];
