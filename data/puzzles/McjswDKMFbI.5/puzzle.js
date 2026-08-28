// Title: September 9, 2021: Queen
// Author: Philip Newman
// Video: https://www.youtube.com/watch?v=McjswDKMFbI
// Source: https://tinyurl.com/45by73fc
//
// Normal sudoku rules apply.
// Digits along a line must have values strictly between the values in the
// circles on the ends of that line -- the endpoint cells are themselves the
// (open) circles, so `Between` takes the endpoints as its first/last cells.
// Digits in a white circle must appear in the four surrounding cells (in any
// order) -- a quadruple clue, `Quad(topLeftCell, ...values)`.

// Between lines: endpoint cells are open circles bounding the line's other
// cells. Cell paths from the payload's `betweenline` entries.
const betweenLines = [
  ['R9C6', 'R8C7', 'R7C8', 'R6C9'],
  ['R6C1', 'R7C2', 'R8C3', 'R9C4'],
  ['R1C6', 'R2C7', 'R3C8', 'R4C9'],
  ['R4C1', 'R3C2', 'R2C3', 'R1C4'],
];

// White-circle quadruples: each circle sits at the corner of a 2x2 square;
// the listed values must appear among its four surrounding cells. Top-left
// cell and values transcribed from the payload's `quadruple` array.
const quads = [
  ['R2C2', 1, 2, 8, 9],
  ['R7C7', 1, 3, 7, 9],
  ['R2C7', 2, 3, 6, 8],
  ['R7C2', 2, 4, 7, 8],
  ['R4C4', 1, 2, 4, 5],
  ['R5C5', 5, 6, 8, 9],
  ['R3C5', 2, 3, 4, 5],
  ['R6C4', 3, 7, 8, 9],
  ['R4C6', 3, 5, 7, 8],
  ['R5C3', 1, 3, 4, 7],
];

return [
  new Shape('9x9'),
  ...betweenLines.map(cells => new Between(...cells)),
  ...quads.map(([topLeft, ...values]) => new Quad(topLeft, ...values)),
];
