// Title: Sloopoku
// Author: Piatato
// Video: https://www.youtube.com/watch?v=uBc80Z91uK4
// Source: https://app.crackingthecryptic.com/sudoku/6mBf9mr992

// Normal sudoku. Each listed outside clue is a sandwich sum: the digits
// strictly between 1 and 9 in that row or column add to the clue.
//
// Omitted: the source says to draw a loop through all non-1 cells, but supplies
// neither loop art nor a stated cell-to-cell adjacency convention. The local
// evidence cannot decide whether its route steps are orthogonal, diagonal, or
// use another convention.

const graph = cellGraph('9x9');
const geometry = graph.gridGeometry();

// Outside text overlays, read by their top/left grid lanes.
const sandwiches = [
  Sandwich.fromCells(32, graph.column(2), geometry),
  Sandwich.fromCells(20, graph.column(4), geometry),
  Sandwich.fromCells(10, graph.column(5), geometry),
  Sandwich.fromCells(9, graph.column(6), geometry),
  Sandwich.fromCells(10, graph.column(7), geometry),
  Sandwich.fromCells(6, graph.column(8), geometry),
  Sandwich.fromCells(31, graph.row(2), geometry),
  Sandwich.fromCells(21, graph.row(3), geometry),
  Sandwich.fromCells(29, graph.row(6), geometry),
  Sandwich.fromCells(7, graph.row(7), geometry),
  Sandwich.fromCells(25, graph.row(8), geometry),
  Sandwich.fromCells(13, graph.row(9), geometry),
];

return [
  new Shape('9x9'),
  ...sandwiches,
];
