// Title: Apr 10, 2022: Diagonal Sudoku
// Author: Sam Cappleman-Lynes
// Video: https://www.youtube.com/watch?v=wwwmflDjNxE
// Source: https://tinyurl.com/4jxdcmeh

// Standard Sudoku (rows, columns, 3x3 boxes) plus both main diagonals as
// all-different groups (the payload's diagonal+/diagonal- flags).
return [
  new Shape('9x9'),
  new Diagonal(1),
  new Diagonal(-1),

  new Given('R1C5', 3), new Given('R1C6', 1), new Given('R1C8', 2),
  new Given('R2C1', 1), new Given('R2C3', 2), new Given('R2C6', 7), new Given('R2C9', 8),
  new Given('R3C2', 3), new Given('R3C4', 4), new Given('R3C8', 9),
  new Given('R5C1', 4), new Given('R5C9', 5),
  new Given('R7C2', 2), new Given('R7C6', 4), new Given('R7C8', 1),
  new Given('R8C1', 8), new Given('R8C4', 9), new Given('R8C7', 2), new Given('R8C9', 3),
  new Given('R9C2', 9), new Given('R9C4', 2), new Given('R9C5', 6),
];
