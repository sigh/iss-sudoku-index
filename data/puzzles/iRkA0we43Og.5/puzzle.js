// Title: Feb 2, 2023: 159 Sudoku
// Author: shye
// Video: https://www.youtube.com/watch?v=iRkA0we43Og
// Source: https://tinyurl.com/2v726m49

// Normal sudoku rules apply (default row/column/box AllDifferent).
// Each digit in column 1 indicates which column the digit 1 appears in, in
// that same row: if R{row}C1 = V then R{row}C{V} = 1. Likewise each digit in
// column 5 points at where 5 is in its row, and each digit in column 9 points
// at where 9 is in its row. The pink shading over columns 1, 5, and 9 (from
// the source) is a purely visual marker of these three columns; it adds no
// constraint of its own.
//
// `Indexing('C', control)` enforces exactly this for one control cell: if the
// control cell sits at (R, C) with value V, then cell (R, V) has value C. So
// a column-1 control cell (C=1) forces the 1 into column V of its row; a
// column-5 control cell (C=5) forces the 5; a column-9 control cell (C=9)
// forces the 9 -- one constraint per source sentence, applied per-cell since
// each cell supplies its own column as C.
const graph = cellGraph('9x9');
const indexingCells = [
  ...graph.column('R1C1'),
  ...graph.column('R1C5'),
  ...graph.column('R1C9'),
];

return [
  new Shape('9x9'),

  // Givens, transcribed from the source payload's per-cell values.
  new Given('R1C1', 1), new Given('R1C9', 7),
  new Given('R2C2', 4), new Given('R2C8', 2),
  new Given('R3C3', 7), new Given('R3C7', 3),
  new Given('R4C1', 2), new Given('R4C9', 4),
  new Given('R5C2', 5), new Given('R5C8', 3),
  new Given('R6C3', 8), new Given('R6C7', 6),
  new Given('R7C1', 3), new Given('R7C9', 6),
  new Given('R8C2', 6), new Given('R8C8', 9),
  new Given('R9C3', 9), new Given('R9C7', 4),

  new Indexing('C', ...indexingCells),
];
