// Title: The Sudoku That Went Viral
// Author: Stinolez
// Video: https://www.youtube.com/watch?v=54yFIj7x_Dw
// Source: https://cracking-the-cryptic.web.app/sudoku/RGF8j4nmBf

// Normal Sudoku rules apply. Every outside clue is a Sandwich sum: the sum
// of the digits between the 1 and the 9 in that row or column (0 is a valid
// sandwich total, meaning the 1 and 9 are adjacent).
const graph = cellGraph('9x9');
const geometry = cellGeometry('9x9');

// Row clues, printed to the left of the grid (left overlays, R1..R9).
const rowSandwiches = [
  Sandwich.fromCells(22, graph.row(1), geometry),
  Sandwich.fromCells(14, graph.row(2), geometry),
  Sandwich.fromCells(18, graph.row(3), geometry),
  Sandwich.fromCells(10, graph.row(4), geometry),
  Sandwich.fromCells(20, graph.row(5), geometry),
  Sandwich.fromCells(12, graph.row(6), geometry),
  Sandwich.fromCells(20, graph.row(7), geometry),
  Sandwich.fromCells(18, graph.row(8), geometry),
  Sandwich.fromCells(22, graph.row(9), geometry),
];

// Column clues, printed above the grid (top overlays, C1..C9).
const columnSandwiches = [
  Sandwich.fromCells(24, graph.column(1), geometry),
  Sandwich.fromCells(0, graph.column(2), geometry),
  Sandwich.fromCells(24, graph.column(3), geometry),
  Sandwich.fromCells(22, graph.column(4), geometry),
  Sandwich.fromCells(4, graph.column(5), geometry),
  Sandwich.fromCells(22, graph.column(6), geometry),
  Sandwich.fromCells(24, graph.column(7), geometry),
  Sandwich.fromCells(0, graph.column(8), geometry),
  Sandwich.fromCells(30, graph.column(9), geometry),
];

return [
  new Shape('9x9'),
  new Given('R1C5', 2),
  new Given('R4C5', 1),
  new Given('R6C4', 8),
  new Given('R6C6', 7),
  new Given('R9C1', 1),
  new Given('R9C9', 3),
  ...rowSandwiches,
  ...columnSandwiches,
];
