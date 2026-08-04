// Title: April 21, 2023: Cross Purposes
// Author: Philip Newman
// Video: https://www.youtube.com/watch?v=3xSu51Mcm80
// Source: https://tinyurl.com/yckpc3p8

// Standard 9x9 sudoku (default 3x3 boxes, no givens) plus:
// - German Whispers: Whisper's default difference of 5 matches "must differ
//   by at least 5" (rules text); each drawn segment is one Whisper.
// - X-Sums: outside clue = sum of the first X cells read inward from the
//   clue, X being the nearest digit. Built with XSum.fromCells from the ray
//   of grid cells the clue reads, per the worked example in the rules text.

const geometry = cellGeometry('9x9');
const graph = cellGraph('9x9');

// Green whisper lines, transcribed from the drawn line geometry.
const WHISPER_LINES = [
  ['R1C2', 'R2C2', 'R3C2'],
  ['R2C1', 'R2C2', 'R2C3'],
  ['R7C8', 'R8C8', 'R9C8'],
  ['R8C7', 'R8C8', 'R8C9'],
  ['R6C8', 'R6C7', 'R6C6'],
  ['R7C7', 'R6C7', 'R5C7'],
  ['R3C3', 'R4C3', 'R5C3'],
  ['R4C2', 'R4C3', 'R4C4'],
  ['R3C6', 'R4C6', 'R5C6'],
  ['R5C4', 'R6C4', 'R7C4'],
  ['R6C3', 'R6C4', 'R6C5'],
  ['R4C5', 'R4C6', 'R4C7'],
  ['R2C6', 'R3C6'],
  ['R8C4', 'R7C4'],
  ['R6C9', 'R6C8'],
  ['R4C1', 'R4C2'],
  ['R6C2', 'R6C3'],
  ['R4C8', 'R4C7'],
  ['R8C6', 'R8C7'],
  ['R2C4', 'R2C3'],
];

// X-Sum outside clues, transcribed from the drawn clue circles. Each entry
// names the clue value and the ray of grid cells it reads, starting adjacent
// to the clue and continuing inward -- built with cellGraph().ray().
const XSUM_CLUES = [
  { value: 11, cells: graph.ray('R1C2', 1, 0) },   // top, column 2, reading down
  { value: 1, cells: graph.ray('R2C1', 0, 1) },    // left, row 2, reading right
  { value: 13, cells: graph.ray('R4C1', 0, 1) },   // left, row 4, reading right
  { value: 34, cells: graph.ray('R6C9', 0, -1) },  // right, row 6, reading left
  { value: 45, cells: graph.ray('R8C9', 0, -1) },  // right, row 8, reading left
  { value: 36, cells: graph.ray('R9C8', -1, 0) },  // bottom, column 8, reading up
];

const whispers = WHISPER_LINES.map(cells => new Whisper(...cells));

const xsums = XSUM_CLUES.map(({ value, cells }) =>
  XSum.fromCells(value, cells, geometry));

return [
  new Shape('9x9'),
  ...whispers,
  ...xsums,
];
