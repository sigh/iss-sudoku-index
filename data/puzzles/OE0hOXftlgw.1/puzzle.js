// Title: Swoon
// Author: Bill Murphy
// Video: https://www.youtube.com/watch?v=OE0hOXftlgw
// Source: https://tinyurl.com/5ez5t3d3

// Normal sudoku rules apply. Every outside-grid clue gives the sum of the
// digits strictly between the 1 and the 9 in its row or column (a sandwich
// sum), matching Sandwich's semantics one-for-one. Rows 4-6 and columns 4
// and 6 carry no sandwich clue, so those lines are unconstrained beyond
// normal sudoku.
const graph = cellGraph('9x9');
const geometry = cellGeometry('9x9');
const col = (c) => graph.ray(makeCellId(1, c), 1, 0);
const row = (r) => graph.ray(makeCellId(r, 1), 0, 1);

return [
  new Shape('9x9'),

  new Given('R1C8', 8),
  new Given('R4C1', 1),
  new Given('R5C3', 3),
  new Given('R5C4', 4),
  new Given('R5C5', 5),
  new Given('R5C6', 6),
  new Given('R5C7', 7),
  new Given('R6C9', 9),
  new Given('R9C2', 2),

  // Column sandwich sums, from the `sandwichsum` R0Cx entries.
  Sandwich.fromCells(2, col(1), geometry),
  Sandwich.fromCells(7, col(2), geometry),
  Sandwich.fromCells(28, col(3), geometry),
  Sandwich.fromCells(15, col(5), geometry),
  Sandwich.fromCells(29, col(7), geometry),
  Sandwich.fromCells(5, col(8), geometry),
  Sandwich.fromCells(3, col(9), geometry),

  // Row sandwich sums, from the `sandwichsum` RxC0 entries.
  Sandwich.fromCells(6, row(1), geometry),
  Sandwich.fromCells(4, row(2), geometry),
  Sandwich.fromCells(9, row(3), geometry),
  Sandwich.fromCells(10, row(7), geometry),
  Sandwich.fromCells(2, row(8), geometry),
  Sandwich.fromCells(9, row(9), geometry),
];
