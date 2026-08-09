// Title: Aug 17, 2022: Quadruples
// Author: clover!
// Video: https://www.youtube.com/watch?v=VGVN2oFFXnM
// Source: https://tinyurl.com/yhj8xjyv

// Normal sudoku rules (rows, columns, boxes), no givens. Twelve quadruple
// circles: each listed digit must appear somewhere in the circle's 2x2
// block, and a digit listed twice must appear twice in the block.

// Quadruple circles, transcribed as [top-left cell, ...listed digits] from
// the drawn 2x2 blocks and their overlaid digits.
const quads = [
  ['R1C3', 1, 1, 2, 4],
  ['R6C1', 2, 7, 7, 8],
  ['R3C8', 3, 3, 4, 6],
  ['R6C7', 3, 4, 4, 5],
  ['R8C6', 5, 5, 6, 8],
  ['R7C3', 5, 6, 6, 7],
  ['R3C2', 1, 7, 8, 8],
  ['R2C6', 1, 2, 2, 3],
  ['R3C4', 2, 5, 7],
  ['R4C6', 1, 4, 7],
  ['R6C5', 1, 3, 6],
  ['R5C3', 3, 5, 8],
];

return [
  new Shape('9x9'),
  ...quads.map(([topLeft, ...values]) => new Quad(topLeft, ...values)),
];
