// Title: Sandwich Sudoku
// Author: Unknown
// Video: https://www.youtube.com/watch?v=qUZnq5nP0zI
// Source: https://cracking-the-cryptic.web.app/sudoku/D6fjfp3pBh

// Standard 9x9 sudoku (rows/columns/3x3 boxes), plus 6 givens.
// The payload carries no rules text at all. Every row and every column
// carries an outside-clue overlay, drawn only along the top (columns) and
// the left (rows) -- the placement Sandwich's own class is restricted to,
// and unlike the other outside-clue families (X-Sum, Skyscraper,
// NumberedRoom), which allow all four sides -> Sandwich(sum, cells): sum of
// the digits strictly between the 1 and the 9 in that row/column.

const graph = cellGraph('9x9');
const geometry = graph.gridGeometry();

const givens = [
  ['R2C4', 9], ['R3C2', 1], ['R4C6', 9],
  ['R6C4', 8], ['R7C8', 5], ['R8C6', 5],
];

// Sandwich sums, transcribed from the overlay text left of each row / above
// each column, one clue per row and one per column.
const rowSums = [7, 14, 20, 2, 8, 26, 10, 31, 16];
const colSums = [15, 9, 26, 8, 8, 12, 0, 12, 6];

const rowSandwiches = rowSums.map(
  (sum, i) => Sandwich.fromCells(sum, graph.row(i + 1), geometry));
const colSandwiches = colSums.map(
  (sum, i) => Sandwich.fromCells(sum, graph.column(i + 1), geometry));

return [
  new Shape('9x9'),

  ...givens.map(([cell, value]) => new Given(cell, value)),

  ...rowSandwiches,
  ...colSandwiches,
];
