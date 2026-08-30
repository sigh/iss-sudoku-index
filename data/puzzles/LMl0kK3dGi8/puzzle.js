// Title: Diagonal Sudoku
// Author: Unknown
// Video: https://www.youtube.com/watch?v=LMl0kK3dGi8
// Source: https://cracking-the-cryptic.web.app/sudoku/G9j2Q6LH4p

// Standard Sudoku (rows, columns, 3x3 boxes) plus both main diagonals as
// all-different groups (the two undecorated grey lines drawn corner-to-corner).
return [
  new Shape('9x9'),
  new Diagonal(1),
  new Diagonal(-1),

  new Given('R1C2', 4), new Given('R1C8', 3),
  new Given('R2C5', 3),
  new Given('R3C2', 1), new Given('R3C4', 5), new Given('R3C6', 9), new Given('R3C8', 6),
  new Given('R4C1', 6), new Given('R4C9', 1),
  new Given('R5C4', 2), new Given('R5C6', 7),
  new Given('R6C1', 9), new Given('R6C9', 4),
  new Given('R7C2', 2), new Given('R7C4', 1), new Given('R7C6', 4), new Given('R7C8', 5),
  new Given('R9C2', 8), new Given('R9C8', 9),
];
