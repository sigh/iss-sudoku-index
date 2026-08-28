// Title: May 8, 2022: B1G3 Lil Killer
// Author: Philip Newman
// Video: https://www.youtube.com/watch?v=G9Ve4kxxzjs
// Source: https://tinyurl.com/yc666myn

// Normal sudoku rules apply (rows, columns, and the six default 2x3 boxes).
// Clues outside the grid give the sum of the digits along the indicated
// diagonal; digits may repeat on that diagonal unless another rule forbids
// it (Little Killer semantics). No region field is present on any given, so
// the payload uses the default box tiling for a 6x6 grid.

const graph = cellGraph('6x6');
const geometry = cellGeometry('6x6');

return [
  new Shape('6x6'),

  // Givens.
  new Given('R1C1', 4),
  new Given('R3C6', 6),
  new Given('R4C1', 6),
  new Given('R4C4', 5),
  new Given('R6C6', 5),

  // Little killer diagonal sums. Each entry cell and travel direction
  // (up-right, down-right, down-left, up-left) comes from the drawn arrow;
  // the ray runs to the grid edge, which lands on the drawn two-cell
  // diagonal in each case.
  LittleKiller.fromCells(3, graph.ray('R2C1', -1, 1), geometry),
  LittleKiller.fromCells(5, graph.ray('R1C5', 1, 1), geometry),
  LittleKiller.fromCells(3, graph.ray('R5C6', 1, -1), geometry),
  LittleKiller.fromCells(6, graph.ray('R6C2', -1, -1), geometry),
];
