// Title: August 12, 2021: Quad Wrangle
// Author: Philip Newman
// Video: https://www.youtube.com/watch?v=Y-VrdZMHMqM
// Source: https://tinyurl.com/fjkrhp72

// Normal sudoku rules apply (rows, columns, boxes all-different -- ISS
// defaults). Digits in circles must appear in the four surrounding cells
// (in any order): each of the 12 quadruples below is encoded with a native
// Quad, anchored at the top-left cell of its 2x2 block (cells transcribed
// from the source's drawn quadruple circles, each listing its block's four
// cells top-left, top-right, bottom-left, bottom-right).

return [
  new Shape('9x9'),

  new Quad('R1C2', 2, 3, 5, 7),
  new Quad('R2C4', 1, 4, 5, 7),
  new Quad('R2C8', 2, 4, 5, 8),
  new Quad('R3C3', 1, 2, 3, 4),
  new Quad('R3C6', 3, 4, 5, 6),
  new Quad('R4C7', 4, 5, 7, 8),
  new Quad('R5C2', 1, 3, 4, 8),
  new Quad('R6C3', 1, 2, 7, 8),
  new Quad('R6C6', 5, 6, 7, 8),
  new Quad('R7C1', 1, 3, 4, 5),
  new Quad('R7C5', 2, 4, 8, 9),
  new Quad('R8C7', 1, 2, 7, 8),
];
