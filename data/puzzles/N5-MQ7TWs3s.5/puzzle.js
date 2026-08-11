// Title: July 12, 22:Seminonconsecutive
// Author: clover!
// Video: https://www.youtube.com/watch?v=N5-MQ7TWs3s
// Source: https://tinyurl.com/4kpe7hf8

// Normal sudoku rules apply. Rows 1, 3, 7, 9 and columns 1, 3, 7, 9 are marked
// with a small "0" (the drawn glyph in the row/column margin); within a
// marked row or column, no two orthogonally adjacent digits may be
// consecutive. Row 5, column 5, and every unmarked row/column carry no such
// restriction. Each marked lane is one ordered path of grid-adjacent cells,
// so a single multi-cell Pair per lane covers every adjacent pair in it.

const notConsecutive = Pair.fnToKey((a, b) => Math.abs(a - b) !== 1, 9);

const graph = cellGraph('9x9');
const markedRows = [1, 3, 7, 9];
const markedCols = [1, 3, 7, 9];

const rowPairs = markedRows.map(r =>
  new Pair(notConsecutive, 'seminonconsecutive row', ...graph.row(r)));
const colPairs = markedCols.map(c =>
  new Pair(notConsecutive, 'seminonconsecutive column', ...graph.column(c)));

// Givens, provenance: the 23 given digits in the payload grid.
const givens = [
  ['R1C1', 1], ['R1C3', 3], ['R1C5', 5], ['R1C7', 7], ['R1C9', 9],
  ['R3C1', 7], ['R3C3', 9], ['R3C5', 1], ['R3C9', 5],
  ['R5C1', 5], ['R5C3', 4], ['R5C5', 8], ['R5C7', 2], ['R5C9', 3],
  ['R7C1', 3], ['R7C5', 7], ['R7C7', 8], ['R7C9', 1],
  ['R9C1', 9], ['R9C3', 1], ['R9C5', 3], ['R9C7', 5], ['R9C9', 7],
];

return [
  new Shape('9x9'),
  ...givens.map(([cell, value]) => new Given(cell, value)),
  ...rowPairs,
  ...colPairs,
];
