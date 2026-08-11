// Title: 111155559999
// Author: grkles and GabeyK9
// Video: https://www.youtube.com/watch?v=6sRRpsi_CsQ
// Source: https://app.crackingthecryptic.com/sudoku/DjFj3DThQg

// Rules encoded:
// - Digits in a circle must appear at least once in the four cells touched
//   by the circle (quadruple clues).
// - A digit in column 1 indicates the column in which the digit 1 appears in
//   that row; columns 5 and 9 carry the same rule for digits 5 and 9
//   respectively. `Indexing('C', cell, value)` on a control cell in column C
//   enforces exactly this: if the control cell holds V, then the cell at
//   column V in its row holds C. Passing every cell of columns 1, 5 and 9
//   applies it uniformly, since each control cell's own column supplies C.

const indexedCells = [1, 5, 9].flatMap(column =>
  Array.from({ length: 9 }, (_, row) => makeCellId(row + 1, column)));

// Quadruple circles, named by the top-left cell of the 2x2 they touch, with
// the digits drawn inside each circle.
const quadruples = [
  new Quad('R2C2', 2, 3, 4),
  new Quad('R4C1', 1, 2, 8, 9),
  new Quad('R3C3', 2, 4, 7),
  new Quad('R6C5', 5, 6, 7, 8),
  new Quad('R4C6', 2, 3, 5, 6),
  new Quad('R1C6', 1, 4),
  new Quad('R2C7', 1, 5, 9),
  new Quad('R7C8', 3),
  new Quad('R8C2', 1, 5, 9),
];

return [
  new Shape('9x9'),
  new Indexing('C', ...indexedCells),
  ...quadruples,
];
