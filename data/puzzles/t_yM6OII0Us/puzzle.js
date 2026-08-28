// Title: X-Positional 1's Sudoku
// Author: Eric Fox
// Video: https://www.youtube.com/watch?v=t_yM6OII0Us
// Source: https://cracking-the-cryptic.web.app/sudoku/87P6H8nQ4g

// Normal sudoku (default 9x9 rows/columns/boxes).
//
// Row/column indexing: for every row, the digit X in column 1 places digit 1
// at column X of that row; for every column, the digit X in row 1 places
// digit 1 at row X of that column. This is exactly `Indexing` applied to
// column 1 (COL_INDEXING) and to row 1 (ROW_INDEXING).

const graph = cellGraph('9x9');

// Givens, row-major, from the drawn grid.
const givens = [
  new Given('R2C4', 2), new Given('R2C8', 8),
  new Given('R3C3', 9), new Given('R3C7', 2),
  new Given('R4C4', 5), new Given('R4C6', 6),
  new Given('R5C3', 6), new Given('R5C5', 9), new Given('R5C9', 4),
  new Given('R6C2', 9), new Given('R6C6', 4), new Given('R6C8', 6),
  new Given('R7C5', 4), new Given('R7C7', 7),
  new Given('R8C4', 6), new Given('R8C8', 4),
  new Given('R9C3', 7), new Given('R9C7', 8),
];

// Column 1's own digit X places digit 1 at column X of that row.
const rowIndexing = new Indexing(Indexing.COL_INDEXING, ...graph.column(1));
// Row 1's own digit X places digit 1 at row X of that column.
const colIndexing = new Indexing(Indexing.ROW_INDEXING, ...graph.row(1));

return [
  new Shape('9x9'),
  ...givens,
  rowIndexing,
  colIndexing,
];
