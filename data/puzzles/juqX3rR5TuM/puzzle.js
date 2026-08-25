// Title: Disjoint Groups Sudoku
// Author: Unknown
// Video: https://www.youtube.com/watch?v=juqX3rR5TuM
// Source: https://sudokupad.app/b8rfjJN6BL

// Rules encoded: normal sudoku (default 9x9 Shape) plus disjoint groups --
// the nine cells sharing the same position within each 3x3 box also form an
// all-different region. DisjointSets() is exactly this rule. Givens
// transcribed from the payload's `cells[row][col].value` entries.

return [
  new Shape('9x9'),
  new Given('R1C4', 7),
  new Given('R2C3', 4),
  new Given('R2C5', 1),
  new Given('R2C7', 3),
  new Given('R3C2', 3),
  new Given('R3C6', 2),
  new Given('R3C8', 4),
  new Given('R4C3', 6),
  new Given('R4C9', 5),
  new Given('R5C2', 8),
  new Given('R5C8', 6),
  new Given('R6C1', 1),
  new Given('R6C7', 7),
  new Given('R7C2', 4),
  new Given('R7C4', 1),
  new Given('R7C8', 8),
  new Given('R8C3', 7),
  new Given('R8C5', 9),
  new Given('R8C7', 1),
  new Given('R9C6', 8),
  new DisjointSets(),
];
