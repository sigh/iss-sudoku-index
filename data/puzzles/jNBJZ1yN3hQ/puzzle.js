// Title: Double Exclusion
// Author: Myxo
// Video: https://www.youtube.com/watch?v=jNBJZ1yN3hQ
// Source: https://sudokupad.app/quadsparade/doubleexclusion

// Normal Sudoku rules apply (rows, columns, 3x3 boxes). No givens.
//
// Quadruples: each listed digit must appear at least once in the four cells
// touching that circle.
//
// Double Arrow: digits on the line between two circles sum to the total of
// the two circled digits (DoubleArrow's first and last cells are the
// circles).
const doubleArrows = [
  ['R2C4', 'R1C3', 'R1C2', 'R2C1', 'R3C1', 'R4C2'],
  ['R6C2', 'R7C1', 'R8C1', 'R9C2', 'R9C3', 'R8C4'],
  ['R2C6', 'R1C7', 'R1C8', 'R2C9', 'R3C9', 'R4C8'],
  ['R6C8', 'R7C9', 'R8C9', 'R9C8', 'R9C7', 'R8C6'],
  ['R4C6', 'R3C5', 'R3C4', 'R4C3', 'R5C3', 'R6C4'],
];

// Quads keyed by the top-left cell of their 2x2 intersection; the R7C7 quad's
// three digits ("3", "4 5") were drawn as two adjacent text overlays around
// one circle -- one clue, not two.
const quads = [
  ['R2C2', 1, 2],
  ['R2C7', 1, 4],
  ['R4C5', 3],
  ['R5C5', 6, 7],
  ['R6C6', 9],
  ['R7C7', 3, 4, 5],
  ['R7C2', 2, 3],
];

return [
  new Shape('9x9'),
  ...doubleArrows.map(cells => new DoubleArrow(...cells)),
  ...quads.map(([cell, ...values]) => new Quad(cell, ...values)),
];
