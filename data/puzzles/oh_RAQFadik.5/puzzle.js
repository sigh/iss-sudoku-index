// Title: 12/9: Wonderful Christmasprime
// Author: Philip Newman
// Video: https://www.youtube.com/watch?v=oh_RAQFadik
// Source: https://tinyurl.com/4h5ppcv4

// Normal sudoku rules (default rows/cols/boxes). Column indexing on columns
// 2, 3, 5, 7: a digit V in a cell of one of these columns C means the digit
// C in that row sits in column V. This is exactly ISS's native `Indexing`
// class ("For a cell in column C, the value V tells where the value C is
// placed in that row: cell (R, V) has the value C"), applied per-cell to
// every cell of columns 2, 3, 5, 7 -- each cell supplies its own column as C
// and the solver derives C from the cell's own coordinates, so one call
// covers all four indexer columns at once.

const givens = [
  ['R1C4', 2], ['R1C5', 7],
  ['R2C2', 2], ['R2C6', 5],
  ['R3C3', 7], ['R3C8', 2],
  ['R4C2', 5], ['R4C4', 3], ['R4C8', 7],
  ['R5C5', 5],
  ['R6C3', 3], ['R6C6', 7], ['R6C8', 5],
  ['R7C2', 3], ['R7C7', 7],
  ['R8C4', 5], ['R8C8', 3],
  ['R9C5', 3], ['R9C6', 2],
];

const graph = cellGraph('9x9');
const indexerCells = [2, 3, 5, 7].flatMap(col => graph.column(col));

return [
  new Shape('9x9'),
  ...givens.map(([cell, value]) => new Given(cell, value)),
  new Indexing('C', ...indexerCells),
];
