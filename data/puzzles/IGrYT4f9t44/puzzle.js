// Title: 2026
// Author: Lizzy01
// Video: https://www.youtube.com/watch?v=IGrYT4f9t44
// Source: https://sudokupad.app/xl1dhvvzjt

// Normal sudoku rules apply. Red (circled) clues are sandwiches: the sum of
// the digits between the 1 and the 9 in that row/column. Blue clues are
// X-sums: the sum of the first X digits in that row/column, counted from the
// clue's side, where X is the digit in the cell nearest the clue.

const geometry = cellGeometry('9x9');
const graph = cellGraph('9x9');

return [
  new Shape('9x9'),

  new Given('R1C4', 2),
  new Given('R2C5', 6),

  // Sandwich clues (direction-independent).
  Sandwich.fromCells(0, graph.row(1), geometry), // clue at left of R1
  Sandwich.fromCells(20, graph.row(2), geometry), // clue at left of R2
  Sandwich.fromCells(26, graph.row(5), geometry), // clue at left of R5
  Sandwich.fromCells(20, graph.column(1), geometry), // clue at top of C1
  Sandwich.fromCells(25, graph.column(2), geometry), // clue at top of C2
  Sandwich.fromCells(26, graph.column(3), geometry), // clue at bottom of C3
  Sandwich.fromCells(25, graph.column(4), geometry), // clue at bottom of C4

  // X-sum clues (directional -- built with graph.ray() from the clue's side
  // toward the grid edge, so the first cell in the array is the one nearest
  // the clue).
  XSum.fromCells(6, graph.ray('R3C9', 0, -1), geometry), // clue at right of R3
  XSum.fromCells(26, graph.ray('R5C9', 0, -1), geometry), // clue at right of R5
  XSum.fromCells(6, graph.row(6), geometry), // clue at left of R6
  XSum.fromCells(26, graph.ray('R9C6', -1, 0), geometry), // clue at bottom of C6
  XSum.fromCells(20, graph.column(8), geometry), // clue at top of C8
  XSum.fromCells(26, graph.column(9), geometry), // clue at top of C9
  XSum.fromCells(20, graph.ray('R9C9', -1, 0), geometry), // clue at bottom of C9
];
