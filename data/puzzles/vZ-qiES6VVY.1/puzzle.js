// Title: Sept. 24, 2022: 159
// Author: clover!
// Video: https://www.youtube.com/watch?v=vZ-qiES6VVY
// Source: https://tinyurl.com/5n99r2uc

// Normal sudoku rules apply (default row/column/box groups).
// Columns 1, 5 and 9 are each self-indexing: a digit in one of those
// columns names the column, in its own row, holding the digit matching its
// own column number -- 1 for column 1, 5 for column 5, 9 for column 9
// (Indexing below, one call per column, scoped to that column's cells).
// The pink shading over columns 1, 5 and 9 is a visual highlight of the
// columns the rule names and adds no constraint of its own.

const graph = cellGraph('9x9');

// Given digits, transcribed from the grid.
const givens = [
  ['R2C2', 7], ['R2C4', 5], ['R2C6', 3], ['R2C8', 1],
  ['R3C7', 2],
  ['R4C2', 1], ['R4C4', 3], ['R4C6', 9], ['R4C8', 5],
  ['R6C2', 5], ['R6C4', 1], ['R6C6', 7], ['R6C8', 9],
  ['R7C3', 8],
  ['R8C2', 9], ['R8C4', 7], ['R8C6', 5], ['R8C8', 3],
];

// Column self-indexing. Indexing('C', ...cells) applies once per listed
// cell: for control cell (R,C) holding value V, it forces cell (R,V) to
// hold C. Passing only one column's cells per call scopes the rule to that
// column, matching the rules' worked example (a 3 in column 1 => the "1" in
// that row sits in the third cell from the left, i.e. R,3 = 1).
const indexing = [
  new Indexing('C', ...graph.column(1)),
  new Indexing('C', ...graph.column(5)),
  new Indexing('C', ...graph.column(9)),
];

return [
  new Shape('9x9'),
  ...givens.map(([cell, value]) => new Given(cell, value)),
  ...indexing,
];
