// Title: Feb 2, 2022: Pole Position
// Author: clover!
// Video: https://www.youtube.com/watch?v=iRucvNT4Tkc
// Source: https://tinyurl.com/b8p72yp7

// Standard Sudoku: rows, columns, and boxes each contain 1-9 once.
//
// Row rule: the leftmost digit in each row (column 1) gives the column
// where digit 1 sits in that row.
// Column rule: the topmost digit in each column (row 1) gives the row
// where digit 1 sits in that column.
//
// `Indexing` enforces, for a control cell at (R, C) with value V, that the
// row/column through it holds value C at position V. Restricting the
// control cells to column 1 (C=1) turns "holds value C" into "holds value
// 1", i.e. exactly the pole-position rule; likewise restricting to row 1
// for the column rule.
const col1 = ['R1C1', 'R2C1', 'R3C1', 'R4C1', 'R5C1', 'R6C1', 'R7C1', 'R8C1', 'R9C1'];
const row1 = ['R1C1', 'R1C2', 'R1C3', 'R1C4', 'R1C5', 'R1C6', 'R1C7', 'R1C8', 'R1C9'];

// Provenance: the puzzle's given digits, as drawn on the grid.
const givens = [
  ['R1C1', 5], ['R2C8', 3], ['R3C3', 7], ['R3C5', 4], ['R4C4', 8],
  ['R4C6', 9], ['R5C3', 2], ['R5C7', 3], ['R5C8', 8], ['R6C4', 7],
  ['R6C7', 2], ['R7C5', 5], ['R7C6', 4], ['R8C2', 5], ['R8C5', 7],
];

return [
  new Shape('9x9'),
  ...givens.map(([cell, v]) => new Given(cell, v)),
  new Indexing('C', ...col1),
  new Indexing('R', ...row1),
];
