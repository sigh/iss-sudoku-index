// Title: Between 1 and 9 Sudoku
// Author: Tom Collyer
// Video: https://www.youtube.com/watch?v=Z79_t6JRiNs
// Source: https://app.crackingthecryptic.com/J4mGJq6brH

// Normal sudoku rules apply. Each outside clue gives the sum of the digits
// between the 1 and the 9 in its row or column -- exactly the built-in
// Sandwich semantics, applied once per row and once per column.
//
// Clue values below are transcribed from the outside-clue overlays, left
// (rows, top-to-bottom) and top (columns, left-to-right).

const geometry = cellGeometry('9x9');
const graph = cellGraph('9x9');

const rowClues = [12, 16, 4, 0, 2, 0, 17, 22, 12];
const colClues = [7, 12, 22, 23, 13, 23, 0, 14, 30];

const rowSandwiches = rowClues.map((value, i) =>
  Sandwich.fromCells(value, graph.row(i + 1), geometry));
const colSandwiches = colClues.map((value, i) =>
  Sandwich.fromCells(value, graph.column(i + 1), geometry));

return [
  new Shape('9x9'),
  new Given('R5C5', 1),
  ...rowSandwiches,
  ...colSandwiches,
];
