// Title: Simply Having A Wonderful 159
// Author: Philip Newman
// Video: https://www.youtube.com/watch?v=3Onsq24T0Ug
// Source: https://tinyurl.com/23hzzkf6

// Normal sudoku rules apply.
// Column indexer: a digit V in column C names the column of digit C within
// that row -- i.e. row R, column V holds C. The rules apply this to columns
// 1, 5 and 9 (each column's own index equals the digit it locates), matching
// `Indexing`'s semantics exactly. Encoded as one Indexing('C', ...) call per
// column, one per the payload's three columnindexer entries.
// The highlighted "no total" cage spanning these same three columns is
// decorative shading around the indexer cells, not an independent rule.

const graph = cellGraph('9x9');

return [
  new Shape('9x9'),

  new Given('R2C4', 1),
  new Given('R2C6', 9),
  new Given('R3C3', 9),
  new Given('R3C5', 6),
  new Given('R3C7', 1),
  new Given('R4C4', 4),
  new Given('R4C8', 9),
  new Given('R5C2', 9),
  new Given('R5C3', 6),
  new Given('R5C7', 4),
  new Given('R5C8', 1),
  new Given('R6C2', 1),
  new Given('R6C6', 6),
  new Given('R7C3', 1),
  new Given('R7C5', 4),
  new Given('R7C7', 9),
  new Given('R8C4', 9),
  new Given('R8C6', 1),

  new Indexing('C', ...graph.column(1)),
  new Indexing('C', ...graph.column(5)),
  new Indexing('C', ...graph.column(9)),
];
