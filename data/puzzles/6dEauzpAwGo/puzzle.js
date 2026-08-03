// Title: Clowns and Jokers
// Author: Die Hard
// Video: https://www.youtube.com/watch?v=6dEauzpAwGo
// Source: https://app.crackingthecryptic.com/sudoku/Tt9Mt697pd

// Normal sudoku rules apply (default row/column/box all-different from
// Shape('9x9')). Two killer cages sum to their totals. The circled cell is
// odd. Each purple line's digits form a consecutive set in any order
// (Renban). Every digit on a purple line also indexes its own column number
// into its row: a purple-line cell at (row R, column C) holding digit V
// forces the cell at (row R, column V) to hold digit C -- ISS's `Indexing`
// class with column-indexing implements exactly this relation.

// Purple lines, one array per drawn stroke.
const purpleLines = [
  ['R1C1', 'R2C2', 'R3C1'],
  ['R1C9', 'R2C8', 'R3C9'],
  ['R4C1', 'R5C2'],
  ['R7C1', 'R8C2', 'R9C1'],
  ['R7C9', 'R8C8', 'R9C9'],
  ['R8C5', 'R9C5'],
  ['R2C4', 'R1C5', 'R2C6'],
];

return [
  new Shape('9x9'),

  // Grey circle at R2C7 marks the odd-digit clue; it carries no value of
  // its own.
  new Given('R2C7', 1, 3, 5, 7, 9),

  // Two vertical-domino cages: R6C1/R7C1 total 6, R6C9/R7C9 total 14.
  new Cage(6, 'R6C1', 'R7C1'),
  new Cage(14, 'R6C9', 'R7C9'),

  // Consecutive-set-in-any-order per purple line.
  ...purpleLines.map(cells => new Renban(...cells)),

  // Column-indexing applies to every digit on every purple line.
  new Indexing('C', ...purpleLines.flat()),
];
