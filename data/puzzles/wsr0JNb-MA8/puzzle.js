// Title: Pi-Day X-Sums Sudoku
// Author: Jonas Gleim
// Video: https://www.youtube.com/watch?v=wsr0JNb-MA8
// Source: https://app.crackingthecryptic.com/sudoku/76mJLbjrT9

// Normal sudoku rules apply. Outside clues show the sum of the first X cells
// from that direction, where X is the value of the first cell from that
// direction (X-Sum). Top clues read down their column (R1 toward R9); right
// clues read leftward across their row (C9 toward C1) -- both run from the
// clue's edge into the grid.

const graph = cellGraph('9x9');
const geometry = cellGeometry('9x9');

return [
  new Shape('9x9'),

  // Givens, from the drawn grid.
  new Given('R3C1', 3),
  new Given('R8C1', 9),
  new Given('R9C2', 7),
  new Given('R9C9', 9),

  // Top-of-grid X-Sum clues at columns 3/4/6/7 (overlays #0-#3).
  XSum.fromCells(3, graph.ray('R1C3', 1, 0), geometry),
  XSum.fromCells(14, graph.ray('R1C4', 1, 0), geometry),
  XSum.fromCells(15, graph.ray('R1C6', 1, 0), geometry),
  XSum.fromCells(9, graph.ray('R1C7', 1, 0), geometry),

  // Right-of-grid X-Sum clues at rows 2/4/6/8 (overlays #4-#7).
  XSum.fromCells(26, graph.ray('R2C9', 0, -1), geometry),
  XSum.fromCells(5, graph.ray('R4C9', 0, -1), geometry),
  XSum.fromCells(35, graph.ray('R6C9', 0, -1), geometry),
  XSum.fromCells(8, graph.ray('R8C9', 0, -1), geometry),
];
