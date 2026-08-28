// Title: May 2, 2022: Nonzero Sum Game
// Author: Philip Newman
// Video: https://www.youtube.com/watch?v=liEAjQvQYe8
// Source: https://tinyurl.com/y5a9c8h5

// Normal sudoku rules apply. Each outside clue gives the sum of the first X
// digits in its row/column, starting adjacent to the clue and reading away
// from it, where X is the adjacent digit -- the standard X-Sum reading (the
// rules text's worked example confirms it). Built with XSum.fromCells over
// the ray of grid cells each clue reads, per the source payload's twelve
// xsum entries, transcribed below with the drawn value and direction.
const geometry = cellGeometry('9x9');
const graph = cellGraph('9x9');

const givens = [
  ['R3C4', 7], ['R4C3', 6], ['R4C4', 4], ['R5C3', 2], ['R5C5', 9],
  ['R5C7', 8], ['R6C6', 1], ['R6C7', 5], ['R7C6', 3],
];

const XSUM_CLUES = [
  { value: 5, cells: graph.ray('R1C2', 1, 0) },    // above C2, reading down
  { value: 9, cells: graph.ray('R1C5', 1, 0) },    // above C5, reading down
  { value: 14, cells: graph.ray('R1C8', 1, 0) },   // above C8, reading down
  { value: 10, cells: graph.ray('R2C1', 0, 1) },   // left of R2, reading right
  { value: 6, cells: graph.ray('R5C1', 0, 1) },    // left of R5, reading right
  { value: 15, cells: graph.ray('R8C1', 0, 1) },   // left of R8, reading right
  { value: 40, cells: graph.ray('R9C3', -1, 0) },  // below C3, reading up
  { value: 30, cells: graph.ray('R9C6', -1, 0) },  // below C6, reading up
  { value: 1, cells: graph.ray('R9C9', -1, 0) },   // below C9, reading up
  { value: 15, cells: graph.ray('R3C9', 0, -1) },  // right of R3, reading left
  { value: 25, cells: graph.ray('R6C9', 0, -1) },  // right of R6, reading left
  { value: 1, cells: graph.ray('R9C9', 0, -1) },   // right of R9, reading left
];

const xSums = XSUM_CLUES.map(({ value, cells }) =>
  XSum.fromCells(value, cells, geometry));

return [
  new Shape('9x9'),
  ...givens.map(([cell, value]) => new Given(cell, value)),
  ...xSums,
];
