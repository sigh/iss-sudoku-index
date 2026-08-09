// Title: Aug 24, 2022: X-Sums Sudoku
// Author: Sam Cappleman-Lynes
// Video: https://www.youtube.com/watch?v=PJcHdl4BYbQ
// Source: https://tinyurl.com/m8swrasp

// Standard 9x9 sudoku (default 3x3 boxes) plus 9 givens forming a diamond in
// the centre, and 14 X-Sum outside clues: each clue is the sum of the first
// X cells read inward from the clue, where X is the value of the nearest of
// those cells, per the worked example in the rules text. Built with
// XSum.fromCells from the ray of grid cells each clue reads.

const geometry = cellGeometry('9x9');
const graph = cellGraph('9x9');

// Givens, transcribed from the drawn digits.
const GIVENS = [
  ['R3C3', 1], ['R3C7', 2],
  ['R4C4', 3], ['R4C6', 4],
  ['R5C5', 5],
  ['R6C4', 6], ['R6C6', 7],
  ['R7C3', 8], ['R7C7', 9],
];

// X-Sum outside clues, transcribed from the drawn clue circles.
const XSUM_CLUES = [
  // Top, read downward.
  { value: 9, cells: graph.ray('R1C3', 1, 0) },
  { value: 10, cells: graph.ray('R1C4', 1, 0) },
  { value: 1, cells: graph.ray('R1C6', 1, 0) },
  { value: 40, cells: graph.ray('R1C9', 1, 0) },
  // Bottom, read upward.
  { value: 1, cells: graph.ray('R9C1', -1, 0) },
  { value: 16, cells: graph.ray('R9C4', -1, 0) },
  { value: 11, cells: graph.ray('R9C6', -1, 0) },
  { value: 13, cells: graph.ray('R9C7', -1, 0) },
  // Left, read rightward.
  { value: 42, cells: graph.ray('R3C1', 0, 1) },
  { value: 8, cells: graph.ray('R6C1', 0, 1) },
  { value: 7, cells: graph.ray('R7C1', 0, 1) },
  // Right, read leftward.
  { value: 9, cells: graph.ray('R3C9', 0, -1) },
  { value: 8, cells: graph.ray('R4C9', 0, -1) },
  { value: 26, cells: graph.ray('R7C9', 0, -1) },
];

const givens = GIVENS.map(([cell, value]) => new Given(cell, value));

const xsums = XSUM_CLUES.map(({ value, cells }) =>
  XSum.fromCells(value, cells, geometry));

return [
  new Shape('9x9'),
  ...givens,
  ...xsums,
];
