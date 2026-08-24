// Title: The AURYN
// Author: grkles
// Video: https://www.youtube.com/watch?v=YgYU6E6_NTI
// Source: https://app.crackingthecryptic.com/sudoku/MFtLb8tfTM

// Normal sudoku rules (default 3x3 boxes, matches drawn regions). One given.
// Killer cages show sums with no repeated digit within a cage.
//
// "The two grey shapes are exact clones of each other": the underlay marks
// two congruent 16-cell snake regions. Checking every rigid transform that
// maps shape A's cell set onto shape B's cell set (as sets) leaves exactly
// two candidates: a 180-degree rotation about the grid centre, and a plain
// translation by (+4 rows, +3 cols). The rotation is ruled out because it
// pairs some cells that share a row or column (e.g. R1C5 with R9C5), which
// would force a repeated digit in that row/column and contradicts default
// Sudoku on its own -- not a puzzle a setter would draw. The translation
// pairs shape A's cells with shape B's cells in the same order the two
// shapes are listed in the underlay art, and no pair shares a row, column,
// or box. Encoded as a clone: the digit at each shape-A cell must equal the
// digit at its shape-B translate, via one SameValues(2, ...) pair per
// translate -- SameValues enforces set-equality per matched set, and with
// singleton sets that is exact per-pair digit equality, giving positional
// (not just same-multiset) cloning.

return [
  new Shape('9x9'),

  new Given('R9C3', 4),

  new Cage(19, 'R1C1', 'R2C1', 'R3C1'),
  new Cage(7, 'R4C1', 'R5C1'),
  new Cage(19, 'R1C3', 'R2C3', 'R3C3', 'R4C3', 'R5C3'),
  new Cage(23, 'R2C4', 'R2C5', 'R2C6'),
  new Cage(8, 'R7C8', 'R8C8'),
  new Cage(9, 'R6C7', 'R6C8', 'R6C9'),
  new Cage(24, 'R5C4', 'R6C4', 'R7C4', 'R8C4', 'R9C4'),
  new Cage(31, 'R5C6', 'R6C6', 'R7C6', 'R8C6', 'R9C6'),

  // Clone pairs: (shape-A cell, shape-B cell = translate by +4 rows, +3 cols).
  new SameValues(2, 'R1C3', 'R5C6'),
  new SameValues(2, 'R1C4', 'R5C7'),
  new SameValues(2, 'R1C5', 'R5C8'),
  new SameValues(2, 'R1C6', 'R5C9'),
  new SameValues(2, 'R2C6', 'R6C9'),
  new SameValues(2, 'R3C6', 'R7C9'),
  new SameValues(2, 'R3C5', 'R7C8'),
  new SameValues(2, 'R3C4', 'R7C7'),
  new SameValues(2, 'R3C3', 'R7C6'),
  new SameValues(2, 'R3C2', 'R7C5'),
  new SameValues(2, 'R3C1', 'R7C4'),
  new SameValues(2, 'R4C1', 'R8C4'),
  new SameValues(2, 'R5C1', 'R9C4'),
  new SameValues(2, 'R5C2', 'R9C5'),
  new SameValues(2, 'R5C3', 'R9C6'),
  new SameValues(2, 'R5C4', 'R9C7'),
];
