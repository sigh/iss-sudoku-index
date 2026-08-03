// Title: Relative Fiction
// Author: Bill Murphy
// Video: https://www.youtube.com/watch?v=-SbL3gEtxaM
// Source: https://tinyurl.com/yw77bs46

// Normal sudoku rules apply (rows, columns, and boxes all-different --
// standard for a plain 9x9 Shape). Little Killer: each off-grid diagonal
// arrow sums the digits along the indicated diagonal (LittleKiller's default
// semantics -- values may repeat; the rules state no distinctness).

const geometry = cellGeometry('9x9');
const graph = cellGraph('9x9');

// Each littlekillersum payload entry gives an entry cell and a diagonal
// direction; none of these diagonals reach the grid's actual corner, so
// each ray is walked from its own entry cell (rather than a shared corner)
// out to the border where it leaves the grid.
const littleKillers = [
  LittleKiller.fromCells(9, graph.ray('R6C9', 1, -1), geometry),
  LittleKiller.fromCells(31, graph.ray('R4C1', -1, 1), geometry),
  LittleKiller.fromCells(13, graph.ray('R9C4', -1, -1), geometry),
  LittleKiller.fromCells(29, graph.ray('R1C6', 1, 1), geometry),
  LittleKiller.fromCells(12, graph.ray('R2C1', -1, 1), geometry),
  LittleKiller.fromCells(12, graph.ray('R1C8', 1, 1), geometry),
  LittleKiller.fromCells(8, graph.ray('R9C2', -1, -1), geometry),
  LittleKiller.fromCells(6, graph.ray('R8C9', 1, -1), geometry),
  LittleKiller.fromCells(12, graph.ray('R3C1', -1, 1), geometry),
  LittleKiller.fromCells(11, graph.ray('R9C3', -1, -1), geometry),
  LittleKiller.fromCells(19, graph.ray('R7C9', 1, -1), geometry),
  LittleKiller.fromCells(15, graph.ray('R1C7', 1, 1), geometry),
];

return [
  new Shape('9x9'),

  // Givens.
  new Given('R2C3', 4),
  new Given('R2C7', 5),
  new Given('R4C6', 3),
  new Given('R5C5', 5),
  new Given('R6C4', 7),
  new Given('R8C3', 7),
  new Given('R8C7', 6),

  ...littleKillers,
];
