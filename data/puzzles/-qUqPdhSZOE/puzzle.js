// Title: Diagonal Sudoku
// Author: Unknown
// Video: https://www.youtube.com/watch?v=-qUqPdhSZOE
// Source: https://app.crackingthecryptic.com/webapp/nD3jTt3mdj

// Standard Sudoku (rows, columns, 3x3 boxes) plus both main diagonals as
// all-different groups (the two grey lines drawn corner-to-corner).
return [
  new Shape('9x9'),
  new Diagonal(1),
  new Diagonal(-1),

  new Given('R1C4', 9), new Given('R1C6', 2),
  new Given('R2C4', 8), new Given('R2C6', 7),
  new Given('R3C1', 9), new Given('R3C5', 5), new Given('R3C9', 3),
  new Given('R4C3', 7), new Given('R4C4', 4), new Given('R4C6', 9), new Given('R4C7', 3),
  new Given('R5C1', 8), new Given('R5C4', 2), new Given('R5C6', 5), new Given('R5C9', 7),
  new Given('R6C2', 6), new Given('R6C8', 5),
  new Given('R7C1', 2), new Given('R7C4', 3), new Given('R7C6', 1), new Given('R7C9', 4),
  new Given('R8C4', 5), new Given('R8C6', 4),
  new Given('R9C3', 9), new Given('R9C7', 7),
];
