// Title: Between 1 and 9 Sudoku
// Author: Unknown
// Video: https://www.youtube.com/watch?v=2wfR6QIvNn4
// Source: https://app.crackingthecryptic.com/p8fFp3hT96

// Normal Sudoku rules apply. Every outside clue is a Sandwich sum: the sum of
// the digits between the 1 and the 9 in that row or column.
const graph = cellGraph('9x9');
const geometry = cellGeometry('9x9');

// Column clues, printed below the grid (bottom overlays, C1..C9).
const columnSandwiches = [
  Sandwich.fromCells(8, graph.column(1), geometry),
  Sandwich.fromCells(4, graph.column(2), geometry),
  Sandwich.fromCells(17, graph.column(3), geometry),
  Sandwich.fromCells(35, graph.column(4), geometry),
  Sandwich.fromCells(14, graph.column(5), geometry),
  Sandwich.fromCells(13, graph.column(6), geometry),
  Sandwich.fromCells(3, graph.column(7), geometry),
  Sandwich.fromCells(10, graph.column(8), geometry),
  Sandwich.fromCells(25, graph.column(9), geometry),
];

// Row clues, printed to the right of the grid (right overlays, R1..R9).
const rowSandwiches = [
  Sandwich.fromCells(4, graph.row(1), geometry),
  Sandwich.fromCells(33, graph.row(2), geometry),
  Sandwich.fromCells(20, graph.row(3), geometry),
  Sandwich.fromCells(17, graph.row(4), geometry),
  Sandwich.fromCells(26, graph.row(5), geometry),
  Sandwich.fromCells(10, graph.row(6), geometry),
  Sandwich.fromCells(16, graph.row(7), geometry),
  Sandwich.fromCells(24, graph.row(8), geometry),
  Sandwich.fromCells(0, graph.row(9), geometry),
];

return [
  new Shape('9x9'),
  new Given('R3C3', 1),
  new Given('R5C5', 5),
  new Given('R7C7', 9),
  ...columnSandwiches,
  ...rowSandwiches,
];
