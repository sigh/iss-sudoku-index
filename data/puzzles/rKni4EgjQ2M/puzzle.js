// Title: Mozart's Sandwich Sudoku
// Author: Unknown
// Video: https://www.youtube.com/watch?v=rKni4EgjQ2M
// Source: https://cracking-the-cryptic.web.app/sudoku/RmQ76tpBH8

// Normal Sudoku rules apply. The fifteen numbers printed in the ring outside
// the grid are sandwich sums: the digits strictly between the 1 and the 9 of
// that row or column add to the printed number. Every row carries one; only
// columns 1, 2, 4, 5, 7 and 9 do. The grid has no givens and no other drawn
// clue, so nothing further is encoded.
const graph = cellGraph('9x9');
const geometry = cellGeometry('9x9');

// Transcribed from the fifteen text marks in the outside ring, each taken for
// the row or column lane it sits beside.
const rowClues = [9, 29, 18, 25, 24, 0, 11, 3, 7];
const colClues = [[1, 0], [2, 18], [4, 24], [5, 0], [7, 11], [9, 12]];

const sandwiches = [
  ...rowClues.map((sum, i) => Sandwich.fromCells(sum, graph.row(i + 1), geometry)),
  ...colClues.map(([col, sum]) => Sandwich.fromCells(sum, graph.column(col), geometry)),
];

return [
  new Shape('9x9'),
  ...sandwiches,
];
