// Title: Quadruples Sudoku
// Author: Freddie Hand
// Video: https://www.youtube.com/watch?v=iRkA0we43Og
// Source: https://tinyurl.com/2sxez4x7

// Normal sudoku (default row/col/box). Quadruple clues at cell intersections:
// Quad(topLeftCell, ...values) -- each listed digit must appear in the
// surrounding four cells; a repeated value (e.g. 1,1,7) requires that digit
// to appear at least twice among the four cells.

return [
  new Shape('9x9'),

  // Givens.
  new Given('R3C8', 7),
  new Given('R3C9', 5),
  new Given('R4C9', 6),
  new Given('R6C1', 2),
  new Given('R7C1', 6),
  new Given('R7C2', 5),

  // Quadruple clues (top-left cell of each 2x2; drawn geometry).
  new Quad('R5C6', 7, 8, 9),
  new Quad('R1C7', 4, 6, 8),
  new Quad('R4C3', 6, 7, 9),
  new Quad('R1C6', 1, 1, 7),
  new Quad('R1C3', 5, 7, 8),
  new Quad('R8C6', 4, 5, 5),
  new Quad('R8C3', 1, 2, 2),
  new Quad('R8C2', 4, 8, 9),
  new Quad('R2C2', 1, 2, 3, 4),
  new Quad('R3C2', 1, 4, 5, 8),
  new Quad('R6C7', 1, 2, 3, 8),
  new Quad('R7C7', 2, 6, 8, 9),
];
