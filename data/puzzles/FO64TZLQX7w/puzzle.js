// Title: unknown
// Author: Unknown
// Video: https://www.youtube.com/watch?v=FO64TZLQX7w
// Source: https://cracking-the-cryptic.web.app/sudoku/r76dDMm26d

// Standard 9x9 sudoku (rows, columns, 3x3 boxes) plus both main diagonals as
// all-different groups (the two undecorated deepskyblue lines drawn
// corner-to-corner).
return [
  new Shape('9x9'),
  new Diagonal(1),
  new Diagonal(-1),

  new Given('R1C8', 8),
  new Given('R2C7', 7), new Given('R2C9', 6),
  new Given('R3C6', 1), new Given('R3C8', 2),
  new Given('R4C5', 6), new Given('R4C7', 5),
  new Given('R5C4', 9), new Given('R5C6', 5),
  new Given('R6C3', 8), new Given('R6C5', 3),
  new Given('R7C2', 8), new Given('R7C4', 1),
  new Given('R8C1', 5), new Given('R8C3', 7),
  new Given('R9C2', 9),
];
