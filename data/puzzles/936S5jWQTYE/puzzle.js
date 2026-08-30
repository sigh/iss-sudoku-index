// Title: Sandwich Sudoku
// Author: Unknown
// Video: https://www.youtube.com/watch?v=936S5jWQTYE
// Source: https://cracking-the-cryptic.web.app/sudoku/7469Nmn9r4

// Normal Sudoku rules apply (rows, columns and boxes). Every outside clue is
// a Sandwich sum: the sum of the digits sandwiched strictly between the 1 and
// the 9 in that row/column.
const graph = cellGraph('9x9');
const geometry = cellGeometry('9x9');

// Column sandwich totals, transcribed from the top overlay row (index 0-8 ->
// C1-C9).
const columnSandwiches = [31, 20, 17, 8, 7, 16, 24, 22, 5].map(
  (value, i) => Sandwich.fromCells(value, graph.column(i + 1), geometry));

// Row sandwich totals, transcribed from the right overlay column (index 0-8
// -> R1-R9). Sandwich is order-independent, so a right-side clue uses the
// same row cell list as a left-side one would.
const rowSandwiches = [26, 19, 14, 26, 4, 6, 5, 3, 21].map(
  (value, i) => Sandwich.fromCells(value, graph.row(i + 1), geometry));

return [
  new Shape('9x9'),
  ...columnSandwiches,
  ...rowSandwiches,
  // Givens, transcribed from the drawn grid.
  new Given('R3C7', 1),
  new Given('R4C9', 9),
  new Given('R6C1', 5),
  new Given('R7C3', 5),
];
