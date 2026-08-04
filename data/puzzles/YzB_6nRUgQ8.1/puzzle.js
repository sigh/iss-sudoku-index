// Title: High Tea
// Author: Bill Murphy
// Video: https://www.youtube.com/watch?v=YzB_6nRUgQ8
// Source: https://tinyurl.com/26ubx8nr

// Normal Sudoku rules apply. Each outside clue gives the sum of the digits
// between the 1 and the 9 in that row/column (a sandwich sum); rows 1, 9 and
// columns 1, 9 carry no clue. Givens and clue values are transcribed from
// the grid and the `sandwichsum` array respectively.
const graph = cellGraph('9x9');
const geometry = cellGeometry('9x9');

const givens = [
  new Given('R3C3', 1), new Given('R3C6', 9),
  new Given('R4C4', 9), new Given('R4C7', 1),
  new Given('R6C3', 9), new Given('R6C6', 1),
  new Given('R7C4', 1), new Given('R7C7', 9),
];

const sandwiches = [
  Sandwich.fromCells(15, graph.column(2), geometry),
  Sandwich.fromCells(7, graph.column(3), geometry),
  Sandwich.fromCells(5, graph.column(4), geometry),
  Sandwich.fromCells(25, graph.column(5), geometry),
  Sandwich.fromCells(15, graph.column(6), geometry),
  Sandwich.fromCells(14, graph.column(7), geometry),
  Sandwich.fromCells(12, graph.column(8), geometry),
  Sandwich.fromCells(8, graph.row(2), geometry),
  Sandwich.fromCells(6, graph.row(3), geometry),
  Sandwich.fromCells(11, graph.row(4), geometry),
  Sandwich.fromCells(25, graph.row(5), geometry),
  Sandwich.fromCells(9, graph.row(6), geometry),
  Sandwich.fromCells(14, graph.row(7), geometry),
  Sandwich.fromCells(20, graph.row(8), geometry),
];

return [
  new Shape('9x9'),
  ...givens,
  ...sandwiches,
];
