// Title: Dec 13, 2021: Renban Quads
// Author: Sam Cappleman-Lynes
// Video: https://www.youtube.com/watch?v=2Z_Pr6qV2mg
// Source: https://tinyurl.com/hj5fu4xb

// Normal sudoku rules apply (default row/column/box all-different, no
// givens). Six grey lines are Renban lines: the digits on each line form a
// set of consecutive values, in any order. Eight white circles are
// Quadruple clues: each lists digits that must appear somewhere among its
// surrounding 2x2 block of cells.

const renbans = [
  ['R4C8', 'R4C7', 'R5C6'],
  ['R2C7', 'R1C8', 'R1C9'],
  ['R2C5', 'R2C4', 'R3C3', 'R3C2'],
  ['R6C2', 'R6C3', 'R5C4'],
  ['R8C5', 'R8C6', 'R7C7', 'R7C8'],
  ['R8C3', 'R9C2', 'R9C1'],
].map(cells => new Renban(...cells));

// Quad(topLeftCell, ...values): each quadruple's cells are drawn TL,TR,BL,BR,
// so the first cell of each block is its top-left anchor.
const quads = [
  ['R7C5', 1, 2, 3, 4],
  ['R2C4', 6, 7, 8, 9],
  ['R6C7', 5, 6, 7, 8],
  ['R3C2', 2, 3, 4, 5],
  ['R6C2', 4, 5, 6, 8],
  ['R3C7', 1, 4, 5, 6],
  ['R1C8', 4, 5, 7, 9],
  ['R8C1', 1, 5, 7, 9],
].map(([topLeft, ...values]) => new Quad(topLeft, ...values));

return [
  new Shape('9x9'),
  ...renbans,
  ...quads,
];
