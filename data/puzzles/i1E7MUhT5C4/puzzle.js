// Title: Diagonal Sudoku
// Author: Tom Collyer
// Video: https://www.youtube.com/watch?v=i1E7MUhT5C4
// Source: https://sudokupad.app/76mPFr6pLm

// Standard Sudoku (rows, columns, 3x3 boxes) plus both main diagonals as
// all-different groups (the two deepskyblue lines drawn corner-to-corner).
return [
  new Shape('9x9'),
  new Diagonal(1),
  new Diagonal(-1),

  new Given('R2C1', 1), new Given('R2C5', 7), new Given('R2C6', 9), new Given('R2C7', 6),
  new Given('R3C1', 2), new Given('R3C8', 3),
  new Given('R4C1', 3), new Given('R4C8', 1),
  new Given('R5C2', 4), new Given('R5C8', 2),
  new Given('R6C2', 5), new Given('R6C9', 7),
  new Given('R7C2', 6), new Given('R7C9', 2),
  new Given('R8C3', 7), new Given('R8C4', 8), new Given('R8C5', 9), new Given('R8C9', 5),
];
