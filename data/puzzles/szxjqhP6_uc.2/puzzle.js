// Title: Sept. 8, 2022: Little Killer
// Author: clover!
// Video: https://www.youtube.com/watch?v=szxjqhP6_uc
// Source: https://tinyurl.com/3zpy2abd

// Normal sudoku rules apply (rows, columns, and boxes all-different --
// standard for a plain 9x9 Shape). Little Killer: each off-grid diagonal
// arrow sums the digits along the indicated diagonal to 15 (LittleKiller's
// default semantics -- values may repeat, matching the rules text "Digits
// may repeat along a diagonal, if they follow sudoku rules").

const geometry = cellGeometry('9x9');
const graph = cellGraph('9x9');

// Each littlekillersum payload entry gives an entry cell and a diagonal
// direction; each ray is walked from its own entry cell out to the border
// where it leaves the grid. All 14 diagonals sum to 15.
const littleKillers = [
  LittleKiller.fromCells(15, graph.ray('R2C1', -1, 1), geometry),
  LittleKiller.fromCells(15, graph.ray('R3C1', -1, 1), geometry),
  LittleKiller.fromCells(15, graph.ray('R1C8', 1, 1), geometry),
  LittleKiller.fromCells(15, graph.ray('R1C7', 1, 1), geometry),
  LittleKiller.fromCells(15, graph.ray('R8C9', 1, -1), geometry),
  LittleKiller.fromCells(15, graph.ray('R7C9', 1, -1), geometry),
  LittleKiller.fromCells(15, graph.ray('R9C2', -1, -1), geometry),
  LittleKiller.fromCells(15, graph.ray('R9C3', -1, -1), geometry),
  LittleKiller.fromCells(15, graph.ray('R9C4', -1, -1), geometry),
  LittleKiller.fromCells(15, graph.ray('R4C1', -1, 1), geometry),
  LittleKiller.fromCells(15, graph.ray('R1C6', 1, 1), geometry),
  LittleKiller.fromCells(15, graph.ray('R6C9', 1, -1), geometry),
  LittleKiller.fromCells(15, graph.ray('R1C5', 1, 1), geometry),
  LittleKiller.fromCells(15, graph.ray('R9C5', -1, -1), geometry),
];

return [
  new Shape('9x9'),

  // Givens.
  new Given('R1C1', 9),
  new Given('R1C4', 7),
  new Given('R1C6', 3),
  new Given('R1C9', 1),
  new Given('R2C8', 3),
  new Given('R4C1', 3),
  new Given('R4C4', 9),
  new Given('R4C9', 2),
  new Given('R5C2', 9),
  new Given('R5C5', 8),
  new Given('R5C8', 5),
  new Given('R6C1', 1),
  new Given('R6C6', 7),
  new Given('R6C9', 4),
  new Given('R8C2', 4),
  new Given('R9C1', 2),
  new Given('R9C4', 4),
  new Given('R9C6', 6),
  new Given('R9C9', 8),

  ...littleKillers,
];
