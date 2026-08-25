// Title: Sandwich Sudoku
// Author: Tom Collyer
// Video: https://www.youtube.com/watch?v=LHeVtCTUhGI
// Source: https://app.crackingthecryptic.com/76L6n8tPhM

// Normal sudoku rules apply. Each outside clue gives the sum of the digits
// between the 1 and the 9 in that row/column (Sandwich).
// Clue values transcribed from the payload's outside-clue overlays.
const graph = cellGraph('9x9');
const geometry = cellGeometry('9x9');
const sandwiches = [
  Sandwich.fromCells(35, graph.row(1), geometry),
  Sandwich.fromCells(18, graph.row(2), geometry),
  Sandwich.fromCells(8, graph.row(3), geometry),
  Sandwich.fromCells(10, graph.row(4), geometry),
  Sandwich.fromCells(7, graph.row(5), geometry),
  Sandwich.fromCells(17, graph.row(6), geometry),
  Sandwich.fromCells(13, graph.row(7), geometry),
  Sandwich.fromCells(5, graph.row(8), geometry),
  Sandwich.fromCells(16, graph.row(9), geometry),
  Sandwich.fromCells(29, graph.column(1), geometry),
  Sandwich.fromCells(25, graph.column(2), geometry),
  Sandwich.fromCells(16, graph.column(3), geometry),
  Sandwich.fromCells(11, graph.column(4), geometry),
  Sandwich.fromCells(0, graph.column(5), geometry),
  Sandwich.fromCells(28, graph.column(6), geometry),
  Sandwich.fromCells(5, graph.column(7), geometry),
  Sandwich.fromCells(9, graph.column(8), geometry),
  Sandwich.fromCells(33, graph.column(9), geometry),
];

return [
  new Shape('9x9'),
  new Given('R1C1', 1),
  ...sandwiches,
];
