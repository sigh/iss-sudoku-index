// Title: Little Killer Madness
// Author: Derektionary
// Video: https://www.youtube.com/watch?v=N_2nZvAnm6c
// Source: https://tinyurl.com/5m9mhr5

// Normal sudoku rules apply (rows, columns and boxes all-different --
// standard for a plain 9x9 Shape). No givens: the grid is filled solely by
// eleven little-killer clues, each giving the sum of the digits along the
// diagonal it points into; digits along a diagonal may repeat unless
// row/column/box all-different already forbids it (Little Killer semantics).
// Each payload littlekillersum entry carries its own explicit cell list, so
// every LittleKiller below is built from those cells directly -- no
// direction was inferred. Two of the eleven diagonals are the grid's
// single-cell extreme corners (R1C1 and R9C9); LittleKiller.fromCells throws
// for a one-cell diagonal, so those two are a plain Given instead.

const geometry = cellGeometry('9x9');

const littleKillers = [
  [6, ['R1C2', 'R2C1']],
  [19, ['R1C3', 'R2C2', 'R3C1']],
  [11, ['R1C4', 'R2C3', 'R3C2', 'R4C1']],
  [17, ['R1C5', 'R2C4', 'R3C3', 'R4C2', 'R5C1']],
  [31, ['R1C6', 'R2C5', 'R3C4', 'R4C3', 'R5C2', 'R6C1']],
  [44, ['R1C7', 'R2C6', 'R3C5', 'R4C4', 'R5C3', 'R6C2', 'R7C1']],
  [60, ['R1C9', 'R2C8', 'R3C7', 'R4C6', 'R5C5', 'R6C4', 'R7C3', 'R8C2', 'R9C1']],
  [48, ['R2C1', 'R3C2', 'R4C3', 'R5C4', 'R6C5', 'R7C6', 'R8C7', 'R9C8']],
  [49, ['R1C8', 'R2C7', 'R3C6', 'R4C5', 'R5C4', 'R6C3', 'R7C2', 'R8C1']],
].map(([total, cells]) => LittleKiller.fromCells(total, cells, geometry));

return [
  new Shape('9x9'),

  ...littleKillers,
  // Single-cell diagonals (the two extreme corners): the "sum along the
  // diagonal" is just that one cell's value.
  new Given('R1C1', 4),
  new Given('R9C9', 4),
];
