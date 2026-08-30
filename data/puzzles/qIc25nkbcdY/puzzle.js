// Title: unknown
// Author: Unknown
// Video: https://www.youtube.com/watch?v=qIc25nkbcdY
// Source: https://cracking-the-cryptic.web.app/sudoku/qHgGfgDFjn

// Normal sudoku on a 9x9 grid with standard 3x3 boxes (default regions).
// Sandwich: each outside clue gives the sum of the digits between the 1
// and the 9 in that row/column.
// Palindrome: the digits along the grey line read the same forwards and
// backwards.
//
// The grey line has no explicit path field in the source; it is 17 shaded
// cells. Walking them in the order the source lists them gives one
// continuous path (each consecutive pair orthogonally or diagonally
// adjacent, every cell used exactly once), so that order is used as the
// line's path below.

const graph = cellGraph('9x9');
const geometry = cellGeometry('9x9');

return [
  new Shape('9x9'),

  new Given('R4C6', 4),
  new Given('R5C6', 6),
  new Given('R6C6', 9),
  new Given('R9C9', 8),

  // Sandwich row/column clues.
  Sandwich.fromCells(22, graph.row(1), geometry),
  Sandwich.fromCells(11, graph.row(3), geometry),
  Sandwich.fromCells(33, graph.row(5), geometry),
  Sandwich.fromCells(22, graph.row(9), geometry),
  Sandwich.fromCells(0, graph.column(1), geometry),
  Sandwich.fromCells(2, graph.column(2), geometry),
  Sandwich.fromCells(0, graph.column(4), geometry),
  Sandwich.fromCells(2, graph.column(5), geometry),
  Sandwich.fromCells(20, graph.column(8), geometry),
  Sandwich.fromCells(20, graph.column(9), geometry),

  // Palindrome line, in path order.
  new Palindrome(
    'R8C7', 'R8C6', 'R8C5', 'R8C4', 'R8C3', 'R7C3', 'R6C4', 'R6C5', 'R6C6',
    'R5C7', 'R4C7', 'R3C7', 'R2C6', 'R2C5', 'R2C4', 'R3C3', 'R4C3'),
];
