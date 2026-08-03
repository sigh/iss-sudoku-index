// Title: 5/12/2023: Tears of the Solver
// Author: Philip Newman
// Video: https://www.youtube.com/watch?v=lc30O50G_rY
// Source: https://tinyurl.com/2ex64ed8

// Standard 9x9 sudoku: 1-9 in every row, column, and 3x3 box (the default
// box tiling). Digits cannot repeat along the two marked diagonals (length
// 9 == the value range, so all-different is exact).

const shape = new Shape('9x9');

return [
  shape,
  new Given('R1C2', 1), new Given('R1C3', 2),
  new Given('R1C7', 4), new Given('R1C8', 9),
  new Given('R2C1', 3), new Given('R2C3', 4),
  new Given('R2C7', 2), new Given('R2C9', 1),
  new Given('R3C1', 5), new Given('R3C2', 6),
  new Given('R3C8', 8), new Given('R3C9', 3),
  new Given('R4C5', 7),
  new Given('R5C4', 4), new Given('R5C6', 6),
  new Given('R6C5', 5),
  new Given('R7C1', 6), new Given('R7C2', 3),
  new Given('R7C8', 7), new Given('R7C9', 8),
  new Given('R8C1', 8), new Given('R8C3', 5),
  new Given('R8C7', 3), new Given('R8C9', 9),
  new Given('R9C2', 9), new Given('R9C3', 7),
  new Given('R9C7', 1), new Given('R9C8', 2),
  // '\'-oriented diagonal R1C1-R2C2-...-R9C9.
  new Diagonal(-1),
  // '/'-oriented diagonal R1C9-R2C8-...-R9C1.
  new Diagonal(1),
];
