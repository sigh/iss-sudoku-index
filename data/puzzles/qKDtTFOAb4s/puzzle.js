// Title: Sandwich Sudoku
// Author: Mark Goodliffe
// Video: https://www.youtube.com/watch?v=qKDtTFOAb4s
// Source: https://cracking-the-cryptic.web.app/sudoku/bbfpNJFLFg

// Normal sudoku rules apply (default rows/columns/3x3 boxes). Outside
// clues give the sandwich sum between the 1 and the 9 in that row/column;
// a lane with no printed clue is left unconstrained (rows 4, 6 and
// columns 4, 6 carry none). AntiConsecutive applies globally: no two
// orthogonally adjacent cells hold consecutive digits.

const geometry = cellGeometry('9x9');
const graph = cellGraph('9x9');

const rowClues = { 1: 18, 2: 0, 3: 21, 5: 15, 7: 26, 8: 13, 9: 15 };
const colClues = { 1: 0, 2: 0, 3: 0, 5: 0, 7: 10, 8: 23, 9: 22 };

const rowSandwiches = Object.entries(rowClues).map(
  ([row, value]) => Sandwich.fromCells(value, graph.row(+row), geometry));
const colSandwiches = Object.entries(colClues).map(
  ([col, value]) => Sandwich.fromCells(value, graph.column(+col), geometry));

return [
  new Shape('9x9'),
  new Given('R5C5', 4),
  ...rowSandwiches,
  ...colSandwiches,
  new AntiConsecutive(),
];
