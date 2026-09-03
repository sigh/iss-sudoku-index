// Title: Sandwich Sudoku
// Author: Marijn ten Velde
// Video: https://www.youtube.com/watch?v=F5x7ouoqQJk
// Source: https://cracking-the-cryptic.web.app/sudoku/fRjmFrGdjR

// Normal Sudoku rules apply: each row, column and 3x3 box holds 1-9 once.
// Every clue printed outside the grid is a Sandwich sum -- the digits lying
// strictly between the 1 and the 9 of that row or column add to the clue.
// The source publishes no rules text, so the clue type rests on two things:
// the video names the Sandwich genre, and all seven clues sit above a column
// or left of a row, which is the only placement a Sandwich clue allows.
//
// Deliberately not encoded: 28 cells carry a flat grey background whose
// outline draws two keys (each a toothed blade running along one row into a
// ring-shaped bow, the bow enclosing a single unshaded cell -- R4C7 for the
// upper key, R7C2 for the lower). No rule anywhere in the source says what
// those cells or those two enclosed cells do, so nothing is written for them
// and this encoding is incomplete by exactly that much.

const shape = new Shape('9x9');
const graph = cellGraph(shape);
const geometry = cellGeometry(shape);

const givens = [
  new Given('R1C8', 9),
  new Given('R2C1', 5),
  new Given('R2C5', 8),
  new Given('R2C7', 4),
  new Given('R7C2', 4),
  new Given('R9C4', 1),
  new Given('R9C7', 6),
];

// Clue values as printed in the margin: left of rows 4, 6, 7 and 9, and above
// columns 1, 4 and 5.
const rowSandwiches = [
  Sandwich.fromCells(28, graph.row(4), geometry),
  Sandwich.fromCells(0, graph.row(6), geometry),
  Sandwich.fromCells(0, graph.row(7), geometry),
  Sandwich.fromCells(10, graph.row(9), geometry),
];
const columnSandwiches = [
  Sandwich.fromCells(16, graph.column(1), geometry),
  Sandwich.fromCells(27, graph.column(4), geometry),
  Sandwich.fromCells(7, graph.column(5), geometry),
];

return [
  shape,
  ...givens,
  ...rowSandwiches,
  ...columnSandwiches,
];
