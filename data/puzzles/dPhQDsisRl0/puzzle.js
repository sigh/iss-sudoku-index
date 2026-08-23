// Title: Killin' It
// Author: Mr. Menace
// Video: https://www.youtube.com/watch?v=dPhQDsisRl0
// Source: https://app.crackingthecryptic.com/sudoku/PB6TdhDJGR

// Normal sudoku rules (default row/column/box all-different). Cages sum to
// their printed top-left total, no repeats within a cage. In each of
// columns 1, 5 and 9: for a cell (R, C) with value V, cell (R, V) has
// value C -- i.e. cell R1's digit says which column in that row holds a 1
// (col 1), col 5's digit says which column holds a 5, col 9's which holds
// a 9. `Indexing('C', cell)` derives the required value (C, from the
// control cell's own column) and target row automatically, so one call per
// column covers all 9 rows.

return [
  new Shape('9x9'),

  // Cages, drawn top-left cell first (per the puzzle's own cages array).
  new Cage(11, 'R1C3', 'R2C3'),
  new Cage(17, 'R1C6', 'R1C7', 'R2C7'),
  new Cage(8, 'R3C5', 'R3C6'),
  new Cage(8, 'R4C3', 'R4C2', 'R5C2'),
  new Cage(22, 'R5C8', 'R6C8', 'R6C7'),
  new Cage(12, 'R7C4', 'R7C5'),
  new Cage(21, 'R8C3', 'R9C4', 'R9C3'),
  new Cage(11, 'R8C7', 'R9C7'),

  // Column-1 digit-1 indexing.
  new Indexing('C',
    'R1C1', 'R2C1', 'R3C1', 'R4C1', 'R5C1', 'R6C1', 'R7C1', 'R8C1', 'R9C1'),
  // Column-5 digit-5 indexing.
  new Indexing('C',
    'R1C5', 'R2C5', 'R3C5', 'R4C5', 'R5C5', 'R6C5', 'R7C5', 'R8C5', 'R9C5'),
  // Column-9 digit-9 indexing.
  new Indexing('C',
    'R1C9', 'R2C9', 'R3C9', 'R4C9', 'R5C9', 'R6C9', 'R7C9', 'R8C9', 'R9C9'),
];
