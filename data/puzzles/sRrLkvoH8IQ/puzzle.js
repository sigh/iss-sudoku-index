// Title: Killer Sandwich
// Author: Michael Baker
// Video: https://www.youtube.com/watch?v=sRrLkvoH8IQ
// Source: https://cracking-the-cryptic.web.app/sudoku/BRD3FBB3pM

// Standard 9x9 sudoku (rows/columns/3x3 boxes), no givens.
// Cages: sum to the printed total, digits in a cage do not repeat -> Cage.
// Outside clues (one per row, one per column): sum of digits strictly
// between the 1 and the 9 in that lane -> Sandwich. Sandwich's cell list is
// order-independent, so the printed side of the grid does not change the
// encoding.

const geometry = cellGeometry('9x9');
const graph = cellGraph('9x9');

// Cages: cells and totals from the payload's cages array.
const cages = [
  new Cage(10, 'R2C2', 'R2C3', 'R3C3', 'R3C2'),
  new Cage(28, 'R2C8', 'R2C7', 'R3C7', 'R3C8'),
  new Cage(27, 'R7C2', 'R7C3', 'R8C3', 'R8C2'),
  new Cage(11, 'R7C7', 'R7C8', 'R8C8', 'R8C7'),
  new Cage(8, 'R3C5', 'R4C5'),
  new Cage(7, 'R5C3', 'R5C4'),
  new Cage(11, 'R5C6', 'R5C7'),
  new Cage(12, 'R6C5', 'R7C5'),
];

// Sandwich clues: totals from the payload's overlays array (top-of-column
// and left-of-row text overlays).
const sandwiches = [
  Sandwich.fromCells(27, graph.column(1), geometry),
  Sandwich.fromCells(14, graph.column(2), geometry),
  Sandwich.fromCells(0, graph.column(3), geometry),
  Sandwich.fromCells(15, graph.column(4), geometry),
  Sandwich.fromCells(35, graph.column(5), geometry),
  Sandwich.fromCells(10, graph.column(6), geometry),
  Sandwich.fromCells(18, graph.column(7), geometry),
  Sandwich.fromCells(21, graph.column(8), geometry),
  Sandwich.fromCells(8, graph.column(9), geometry),
  Sandwich.fromCells(7, graph.row(1), geometry),
  Sandwich.fromCells(0, graph.row(2), geometry),
  Sandwich.fromCells(0, graph.row(3), geometry),
  Sandwich.fromCells(0, graph.row(4), geometry),
  Sandwich.fromCells(25, graph.row(5), geometry),
  Sandwich.fromCells(10, graph.row(6), geometry),
  Sandwich.fromCells(20, graph.row(7), geometry),
  Sandwich.fromCells(35, graph.row(8), geometry),
  Sandwich.fromCells(0, graph.row(9), geometry),
];

return [
  new Shape('9x9'),
  ...cages,
  ...sandwiches,
];
