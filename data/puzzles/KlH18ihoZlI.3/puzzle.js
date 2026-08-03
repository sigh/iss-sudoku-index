// Title: July 4, 2023: X-Sums Sudoku
// Author: clover!
// Video: https://www.youtube.com/watch?v=KlH18ihoZlI
// Source: https://tinyurl.com/8a3jfbrx

// Normal sudoku rules apply. Each outside clue gives the sum of the first X
// digits in its row/column, counted from the clue's side; X is the digit
// nearest the clue. XSum's built-in semantics match this exactly.

const graph = cellGraph('9x9');
const geometry = cellGeometry('9x9');

// Givens, transcribed from the drawn grid.
const givens = [
  new Given('R1C7', 4),
  new Given('R3C4', 7),
  new Given('R3C5', 8),
  new Given('R3C6', 9),
  new Given('R4C8', 5),
  new Given('R6C2', 5),
  new Given('R7C4', 4),
  new Given('R7C5', 5),
  new Given('R7C6', 6),
  new Given('R9C3', 4),
];

// X-Sum clues, transcribed from the drawn outside-clue badges. `fromCells`
// derives the canonical clue id from the line of cells read in the clue's
// own direction: top/left clues read from graph.column()/row(); bottom/right
// clues reverse it to start from the far end, matching "nearest the clue".
const xsums = [
  XSum.fromCells(5, graph.column(1), geometry),
  XSum.fromCells(11, graph.column(4), geometry),
  XSum.fromCells(24, graph.column(7), geometry),
  XSum.fromCells(45, graph.column(8), geometry),
  XSum.fromCells(45, graph.column(2).slice().reverse(), geometry),
  XSum.fromCells(12, graph.column(3).slice().reverse(), geometry),
  XSum.fromCells(11, graph.column(6).slice().reverse(), geometry),
  XSum.fromCells(5, graph.column(9).slice().reverse(), geometry),
  XSum.fromCells(3, graph.row(1), geometry),
  XSum.fromCells(16, graph.row(6), geometry),
  XSum.fromCells(19, graph.row(4).slice().reverse(), geometry),
  XSum.fromCells(3, graph.row(9).slice().reverse(), geometry),
];

return [
  new Shape('9x9'),
  ...givens,
  ...xsums,
];
