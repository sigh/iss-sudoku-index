// Title: Between 1 and 9 Sudoku
// Author: Mark Goodliffe
// Video: https://www.youtube.com/watch?v=DfWrs1B0uzM
// Source: https://app.crackingthecryptic.com/796g6fF9HJ

// Normal sudoku rules apply (standard rows/columns/3x3 boxes, digits 1-9).
// Each of the 9 rows and 9 columns carries an outside-grid clue: the sum of
// the digits strictly between the cells holding 1 and 9 in that row/column.
// This is exactly the built-in Sandwich semantics ("Values between the 1 and
// the 9 in the row or column must add to the given sum"), so every outside
// clue below is a Sandwich constraint built from its full row/column.
// Row/column clue values transcribed from the outside-clue overlays: left
// margin = row clues R1-R9 top-to-bottom, top margin = column clues C1-C9
// left-to-right.

const geometry = cellGeometry(9);
const rowCells = (r) => Array.from({ length: 9 }, (_, c) => makeCellId(r, c + 1));
const colCells = (c) => Array.from({ length: 9 }, (_, r) => makeCellId(r + 1, c));

const rowSums = [2, 8, 26, 29, 0, 23, 15, 2, 4];
const colSums = [10, 23, 23, 23, 14, 12, 21, 0, 0];

return [
  new Shape('9x9'),

  // Givens (main-diagonal cells only).
  new Given('R3C3', 9),
  new Given('R4C4', 6),
  new Given('R5C5', 1),
  new Given('R6C6', 2),
  new Given('R7C7', 7),

  ...rowSums.map((v, i) => Sandwich.fromCells(v, rowCells(i + 1), geometry)),
  ...colSums.map((v, i) => Sandwich.fromCells(v, colCells(i + 1), geometry)),
];
