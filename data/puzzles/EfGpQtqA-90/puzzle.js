// Title: Unknown
// Author: Unknown
// Video: https://www.youtube.com/watch?v=EfGpQtqA-90
// Source: https://cracking-the-cryptic.web.app/sudoku/jpQPjrm7H4

// Standard 9x9 sudoku (rows/columns/3x3 boxes). One given, R7C1=1.
// Two thin grey lines run the full length of each main diagonal -> both
// directions of Diagonal (digits on each diagonal don't repeat).
// Outside-margin numbers, each printed directly above its own column or
// directly left of its own row with no arrow or other mark: sum of the
// digits strictly between the 1 and the 9 in that line -> Sandwich.

const geometry = cellGeometry('9x9');
const graph = cellGraph('9x9');

// Column sandwich clues, transcribed from the text overlays above the grid.
const columnSandwiches = [
  [2, graph.column(1)],
  [8, graph.column(2)],
  [5, graph.column(3)],
  [15, graph.column(4)],
  [27, graph.column(6)],
  [28, graph.column(7)],
  [24, graph.column(8)],
  [0, graph.column(9)],
];

// Row sandwich clues, transcribed from the text overlays left of the grid.
const rowSandwiches = [
  [2, graph.row(2)],
  [31, graph.row(6)],
  [26, graph.row(7)],
  [11, graph.row(8)],
  [29, graph.row(9)],
];

return [
  new Shape('9x9'),

  new Given('R7C1', 1),

  new Diagonal(1),
  new Diagonal(-1),

  ...columnSandwiches.map(
    ([value, cells]) => Sandwich.fromCells(value, cells, geometry)),
  ...rowSandwiches.map(
    ([value, cells]) => Sandwich.fromCells(value, cells, geometry)),
];
