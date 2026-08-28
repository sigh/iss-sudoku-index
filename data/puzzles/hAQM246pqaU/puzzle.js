// Title: Knight Sandwich Sudoku
// Author: Danny Demeersseman
// Video: https://www.youtube.com/watch?v=hAQM246pqaU
// Source: https://cracking-the-cryptic.web.app/sudoku/mJTqnJ9hmH

// Standard 9x9 sudoku (rows/columns/3x3 boxes).
// Identical digits cannot be a knight's move apart -> AntiKnight.
// Every row and column carries a sandwich clue: the sum of the digits
// between the 1 and the 9 in that line -> Sandwich, built from the full
// row/column cell list with Sandwich.fromCells (order-independent, so the
// clue's on-screen side does not affect the encoding).

const geometry = cellGeometry('9x9');
const graph = cellGraph('9x9');

// Row clues, printed left of the grid, row 1 -> row 9.
const rowSums = [10, 19, 25, 28, 17, 3, 23, 6, 7];
const rowSandwiches = rowSums.map(
  (sum, i) => Sandwich.fromCells(sum, graph.row(i + 1), geometry));

// Column clues, printed above the grid, column 1 -> column 9.
const colSums = [18, 8, 21, 18, 13, 27, 25, 13, 3];
const colSandwiches = colSums.map(
  (sum, i) => Sandwich.fromCells(sum, graph.column(i + 1), geometry));

return [
  new Shape('9x9'),
  new Given('R6C4', 1),
  new AntiKnight(),
  ...rowSandwiches,
  ...colSandwiches,
];
