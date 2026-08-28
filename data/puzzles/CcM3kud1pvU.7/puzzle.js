// Title: Nov. 3, 2021: GAS 101 - X Sums
// Author: Philip Newman
// Video: https://www.youtube.com/watch?v=CcM3kud1pvU
// Source: https://tinyurl.com/c5z53n4w

// Standard 9x9 sudoku (rows/cols/boxes). No givens.
//
// X-Sum: the clue is the sum of the first X cells counted inward from the
// clue's side, where X is the value of the nearest (first) cell -- ISS's
// built-in XSum class implements exactly this. Not every lane carries a
// clue on both sides, or on either side; only the 14 below are drawn.
const graph = cellGraph('9x9');
const geometry = cellGeometry('9x9');

return [
  new Shape('9x9'),

  // Row clues, left side (reading rightward from column 1).
  XSum.fromCells(36, graph.ray('R1C1', 0, 1), geometry),
  XSum.fromCells(10, graph.ray('R3C1', 0, 1), geometry),
  XSum.fromCells(24, graph.ray('R5C1', 0, 1), geometry),
  XSum.fromCells(6, graph.ray('R7C1', 0, 1), geometry),

  // Row clues, right side (reading leftward from column 9).
  XSum.fromCells(36, graph.ray('R3C9', 0, -1), geometry),
  XSum.fromCells(20, graph.ray('R5C9', 0, -1), geometry),
  XSum.fromCells(40, graph.ray('R7C9', 0, -1), geometry),
  XSum.fromCells(36, graph.ray('R9C9', 0, -1), geometry),

  // Column clues, top side (reading downward from row 1).
  XSum.fromCells(34, graph.ray('R1C2', 1, 0), geometry),
  XSum.fromCells(17, graph.ray('R1C6', 1, 0), geometry),
  XSum.fromCells(43, graph.ray('R1C8', 1, 0), geometry),

  // Column clues, bottom side (reading upward from row 9).
  XSum.fromCells(12, graph.ray('R9C2', -1, 0), geometry),
  XSum.fromCells(9, graph.ray('R9C4', -1, 0), geometry),
  XSum.fromCells(3, graph.ray('R9C8', -1, 0), geometry),
];
