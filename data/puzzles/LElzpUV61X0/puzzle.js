// Title: Between 1 and 9 Sudoku
// Author: Richard Stolk
// Video: https://www.youtube.com/watch?v=LElzpUV61X0
// Source: https://app.crackingthecryptic.com/HnRfggBgG4

// Normal sudoku rules apply (default 3x3 boxes). Each outside clue is a
// Sandwich clue: the sum of the digits strictly between the 1 and the 9 in
// that row or column.

const graph = cellGraph('9x9');
const geometry = cellGeometry('9x9');

// Row clues, right of the grid, R1..R9 top to bottom.
const rowClues = [2, 25, 20, 27, 3, 8, 28, 9, 14];

// Column clues, below the grid, C1..C9 left to right.
const colClues = [18, 17, 2, 29, 20, 23, 4, 9, 8];

const rowSandwiches = rowClues.map(
  (value, i) => Sandwich.fromCells(value, graph.row(i + 1), geometry));

const colSandwiches = colClues.map(
  (value, i) => Sandwich.fromCells(value, graph.column(i + 1), geometry));

return [
  new Shape('9x9'),
  new Given('R2C2', 1),
  new Given('R2C8', 2),
  new Given('R8C2', 3),
  new Given('R8C8', 4),
  ...rowSandwiches,
  ...colSandwiches,
];
