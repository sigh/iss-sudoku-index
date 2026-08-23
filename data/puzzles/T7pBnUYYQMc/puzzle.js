// Title: X-Sums Sudoku
// Author: Christoph Seeliger
// Video: https://www.youtube.com/watch?v=T7pBnUYYQMc
// Source: https://app.crackingthecryptic.com/sudoku/7qBGHmGJrj

// Normal sudoku rules apply. Each of the 12 outside clues gives the sum of
// the first X digits read inward from that clue's side of the grid, where X
// is the digit in the first (nearest) cell on that side: XSum(value, cells)
// with cells ordered starting from the side the clue sits on.

const graph = cellGraph('9x9');
const geometry = cellGeometry('9x9');

// [value, orderedCells] read from clue side inward, one per outside clue.
// Cell order transcribed from the drawn clue positions (top/bottom of a
// column, left/right of a row).
const xsumClues = [
  [16, graph.column(2)],                       // top C2
  [12, graph.column(4)],                       // top C4
  [33, graph.column(6)],                       // top C6
  [31, graph.column(4).slice().reverse()],     // bottom C4
  [11, graph.column(6).slice().reverse()],     // bottom C6
  [27, graph.column(8).slice().reverse()],     // bottom C8
  [16, graph.row(4)],                          // left R4
  [33, graph.row(6)],                          // left R6
  [25, graph.row(8)],                          // left R8
  [31, graph.row(2).slice().reverse()],        // right R2
  [27, graph.row(4).slice().reverse()],        // right R4
  [11, graph.row(6).slice().reverse()],        // right R6
];

return [
  new Shape('9x9'),
  ...xsumClues.map(([value, cells]) => XSum.fromCells(value, cells, geometry)),
];
