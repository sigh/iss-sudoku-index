// Title: Liar X-Sums
// Author: Jonas Gleim
// Video: https://www.youtube.com/watch?v=M7CZmrarl5U
// Source: https://cracking-the-cryptic.web.app/sudoku/JbhhGf7nf2

// Standard sudoku (rows/cols/3x3 boxes). No given digits.
//
// Ten X-Sum clues sit outside the grid, every one printed "20" -- a themed
// puzzle for the year 2020. Six more
// clues sit inside the grid, each a single small digit at a corner shared by
// four cells (an unlabelled quadruple-style corner mark, per SudokuPad
// convention, with no drawn circle). Every one of these sixteen clues is a
// liar: the printed number is exactly one away from the value it actually
// enforces. XSum's own X-derivation (first cell in the direction of the
// clue) is untouched by the liar rule -- only the printed sum, and the
// printed quadruple digit, are what the rule calls incorrect.
const graph = cellGraph('9x9');
const geometry = cellGeometry('9x9');

// Every outside clue reads "20"; the liar rule makes the true X-Sum total
// 19 or 21, never 20. One Or(X-Sum=19, X-Sum=21) per lane, read
// nearest-clue-first.
const xsumLanes = [
  graph.ray('R1C1', 1, 0),   // top, column 1
  graph.ray('R1C8', 1, 0),   // top, column 8
  graph.ray('R1C9', 1, 0),   // top, column 9
  graph.ray('R9C4', -1, 0),  // bottom, column 4
  graph.ray('R9C7', -1, 0),  // bottom, column 7
  graph.ray('R9C9', -1, 0),  // bottom, column 9
  graph.ray('R1C1', 0, 1),   // left, row 1
  graph.ray('R9C1', 0, 1),   // left, row 9
  graph.ray('R5C9', 0, -1),  // right, row 5
  graph.ray('R7C9', 0, -1),  // right, row 7
];
const liarXSums = xsumLanes.map(cells => new Or([
  XSum.fromCells(19, cells, geometry),
  XSum.fromCells(21, cells, geometry),
]));

// Inside corner clues: printed digit is the liar of the digit that must
// appear in the surrounding 2x2 block. A printed 0 has only one valid true
// digit (1); the rest have two (printed +-1, both in 1-9).
const liarQuads = [
  new Or([new Quad('R1C5', 1), new Quad('R1C5', 3)]),  // printed 2
  new Or([new Quad('R5C4', 1), new Quad('R5C4', 3)]),  // printed 2
  new Quad('R6C5', 1),                                 // printed 0
  new Quad('R2C6', 1),                                 // printed 0
  new Or([new Quad('R2C8', 4), new Quad('R2C8', 6)]),  // printed 5
  new Or([new Quad('R5C2', 3), new Quad('R5C2', 5)]),  // printed 4
];

return [
  new Shape('9x9'),
  ...liarXSums,
  ...liarQuads,
];
