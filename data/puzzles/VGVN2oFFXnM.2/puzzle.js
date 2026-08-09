// Title: 8/19/22: Still Sick
// Author: Philip Newman
// Video: https://www.youtube.com/watch?v=VGVN2oFFXnM
// Source: https://tinyurl.com/hbtzexp5

// Normal sudoku rules apply. Each outside clue is a sandwich sum: the sum of
// the digits strictly between the 1 and the 9 in that row or column,
// excluding the 1 and 9 themselves. ISS's native Sandwich class expresses
// this directly, one per marked row/column (payload `sandwichsum`).
const graph = cellGraph('9x9');
const geometry = cellGeometry('9x9');
const sandwiches = [
  Sandwich.fromCells(35, graph.row(1), geometry),
  Sandwich.fromCells(0, graph.row(3), geometry),
  Sandwich.fromCells(30, graph.row(4), geometry),
  Sandwich.fromCells(5, graph.row(5), geometry),
  Sandwich.fromCells(15, graph.row(7), geometry),
  Sandwich.fromCells(0, graph.row(8), geometry),
  Sandwich.fromCells(35, graph.column(1), geometry),
  Sandwich.fromCells(20, graph.column(3), geometry),
  Sandwich.fromCells(30, graph.column(4), geometry),
  Sandwich.fromCells(5, graph.column(5), geometry),
  Sandwich.fromCells(15, graph.column(7), geometry),
  Sandwich.fromCells(0, graph.column(8), geometry),
];

return [
  new Shape('9x9'),
  ...sandwiches,
  new Given('R2C2', 5),
  new Given('R2C8', 7),
  new Given('R3C5', 6),
  new Given('R4C4', 4),
  new Given('R4C7', 6),
  new Given('R5C3', 8),
  new Given('R5C5', 3),
  new Given('R6C6', 2),
  new Given('R7C4', 7),
  new Given('R8C2', 8),
  new Given('R9C9', 1),
];
