// Title: Oct. 4, 2023: The Hoagie Pokey
// Author: Philip Newman
// Video: https://www.youtube.com/watch?v=RO5rLcSoeBg
// Source: https://tinyurl.com/y6arh3ry

// Normal sudoku rules apply.
// Each outside clue is a sandwich sum: the digits strictly between 1 and 9
// in its full row or column add to the clue.

const geometry = cellGeometry('9x9');
const graph = cellGraph(geometry);

return [
  new Shape('9x9'),

  // Givens from the source grid.
  new Given('R2C4', 1),
  new Given('R2C8', 2),
  new Given('R8C2', 2),
  new Given('R8C6', 3),

  // Sandwichsum values from the source's outside-clue entries.
  Sandwich.fromCells(35, graph.column(1), geometry),
  Sandwich.fromCells(33, graph.column(4), geometry),
  Sandwich.fromCells(32, graph.column(7), geometry),
  Sandwich.fromCells(28, graph.row(1), geometry),
  Sandwich.fromCells(29, graph.row(4), geometry),
  Sandwich.fromCells(30, graph.row(7), geometry),
  Sandwich.fromCells(31, graph.row(3), geometry),
  Sandwich.fromCells(23, graph.row(6), geometry),
  Sandwich.fromCells(15, graph.row(9), geometry),
  Sandwich.fromCells(8, graph.column(3), geometry),
  Sandwich.fromCells(15, graph.column(6), geometry),
  Sandwich.fromCells(0, graph.column(9), geometry),
];
