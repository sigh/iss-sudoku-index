// Title: Oct 7, 2021: BOGO
// Author: clover!
// Video: https://www.youtube.com/watch?v=pSFx3JiwwTw
// Source: https://tinyurl.com/7nnmxze3

// Normal sudoku (default row/col/box). White circles (quad clues):
// Quad(topLeftCell, ...values) -- each listed digit must appear in at least
// one of the surrounding four cells; a digit listed twice must appear twice.

return [
  new Shape('9x9'),

  new Given('R2C2', 9),
  new Given('R8C8', 9),

  // White circles (quadruple clues, given as their 2x2 block's top-left cell).
  new Quad('R1C3', 8, 8),
  new Quad('R1C6', 5, 5),
  new Quad('R2C3', 3, 3),
  new Quad('R2C7', 5, 6),
  new Quad('R3C1', 5, 5),
  new Quad('R3C3', 9, 9),
  new Quad('R3C5', 1, 1),
  new Quad('R3C6', 2, 2),
  new Quad('R3C8', 6, 6),
  new Quad('R4C6', 3, 3),
  new Quad('R5C3', 4, 4),
  new Quad('R6C1', 1, 1),
  new Quad('R6C3', 5, 5),
  new Quad('R6C4', 6, 6),
  new Quad('R6C6', 7, 7),
  new Quad('R6C7', 8, 8),
  new Quad('R7C2', 1, 2),
  new Quad('R7C6', 8, 8),
  new Quad('R8C3', 2, 2),
  new Quad('R8C6', 4, 4),
];
