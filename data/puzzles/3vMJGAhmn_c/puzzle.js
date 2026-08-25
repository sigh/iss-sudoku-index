// Title: Xmas Quadruple Sudoku
// Author: Sed Holaysan
// Video: https://www.youtube.com/watch?v=3vMJGAhmn_c
// Source: https://app.crackingthecryptic.com/sudoku/hnmnNqJFqt

// Standard 9x9 sudoku (rows/columns/3x3 boxes), no givens.
// Quadruple circles: each Quad anchors at the top-left cell of its 2x2
// block (corner overlay from the source), and lists the digits that must
// each appear at least once among the four cells.

return [
  new Shape('9x9'),

  new Quad('R2C2', 2, 3, 5, 7),
  new Quad('R1C4', 7, 8),
  new Quad('R1C7', 1, 3, 4, 7),
  new Quad('R2C8', 4, 6, 8, 9),
  new Quad('R3C3', 2, 3, 5, 7),
  new Quad('R4C1', 1, 3, 7, 9),
  new Quad('R5C3', 1, 7),
  new Quad('R7C1', 3, 4, 6, 8),
  new Quad('R8C2', 1, 7, 8, 9),
  new Quad('R8C5', 2, 4),
  new Quad('R7C7', 1, 2, 5, 6),
  new Quad('R6C6', 1, 3, 4, 6),
  new Quad('R4C6', 3, 6),
  new Quad('R5C8', 2, 5, 7, 8),
];
