// Title: Arsenic on Rye
// Author: BremSter and randall
// Video: https://www.youtube.com/watch?v=y0JvaYv8atc
// Source: https://f-puzzles.com/?id=2f2o7m35

// Normal sudoku rules apply. Killer cages: digits in a cage cannot repeat and
// must sum to the given total. Sandwich sums: clues outside the grid give the
// sum of the digits between the 1 and the 9 in that row/column.
const graph = cellGraph('9x9');
const geometry = cellGeometry('9x9');

// Cages transcribed from the "killercage" array (cells, total).
const cages = [
  new Cage(8, 'R3C1', 'R3C2', 'R3C3'),
  new Cage(22, 'R2C8', 'R3C7', 'R3C8'),
  new Cage(8, 'R7C7', 'R7C8', 'R8C7'),
  new Cage(7, 'R6C3', 'R7C3', 'R8C3'),
  new Cage(15, 'R4C5', 'R5C5', 'R6C5'),
  new Cage(11, 'R5C1', 'R5C2'),
  new Cage(11, 'R5C8', 'R5C9'),
  new Cage(17, 'R8C4', 'R8C5', 'R8C6'),
  new Cage(13, 'R1C4', 'R2C3', 'R2C4'),
];

// Sandwich sums transcribed from the "sandwichsum" array: R_C0 clues are row
// sums, R0C_ clues are column sums.
const sandwiches = [
  Sandwich.fromCells(12, graph.row(3), geometry),
  Sandwich.fromCells(25, graph.row(8), geometry),
  Sandwich.fromCells(10, graph.row(9), geometry),
  Sandwich.fromCells(26, graph.column(8), geometry),
  Sandwich.fromCells(14, graph.column(3), geometry),
  Sandwich.fromCells(15, graph.column(5), geometry),
  Sandwich.fromCells(13, graph.column(1), geometry),
];

return [
  new Shape('9x9'),
  ...cages,
  ...sandwiches,
];
