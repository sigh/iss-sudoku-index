// Title: 159 Sudoku - an unusual World Championship variant
// Author: Unknown
// Video: https://www.youtube.com/watch?v=J0OVDew3Hg4
// Source: https://cracking-the-cryptic.web.app/sudoku/8rrr3nrDqF

// Normal sudoku rules apply.
// Column indexer: a digit V in column C names the column of digit C within
// that row -- i.e. row R, column V holds C. The rules apply this to columns
// 1, 5 and 9 (each column's own index equals the digit it locates), matching
// `Indexing`'s semantics exactly. Encoded as one Indexing('C', ...) call per
// column. The grey shading on columns 1, 5 and 9 in the payload marks the
// same three columns and carries no separate rule.

const graph = cellGraph('9x9');

return [
  new Shape('9x9'),

  new Given('R1C6', 3),
  new Given('R1C8', 5),
  new Given('R2C2', 4),
  new Given('R2C3', 9),
  new Given('R2C4', 7),
  new Given('R3C6', 5),
  new Given('R3C7', 1),
  new Given('R3C8', 2),
  new Given('R4C2', 2),
  new Given('R4C4', 6),
  new Given('R5C3', 7),
  new Given('R5C7', 8),
  new Given('R6C6', 8),
  new Given('R6C8', 6),
  new Given('R7C2', 6),
  new Given('R7C3', 3),
  new Given('R7C4', 8),
  new Given('R8C6', 9),
  new Given('R8C7', 5),
  new Given('R8C8', 3),
  new Given('R9C2', 7),
  new Given('R9C4', 2),

  new Indexing('C', ...graph.column(1)),
  new Indexing('C', ...graph.column(5)),
  new Indexing('C', ...graph.column(9)),
];
