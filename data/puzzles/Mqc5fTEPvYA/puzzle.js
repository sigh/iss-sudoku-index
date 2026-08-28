// Title: Small Murders
// Author: DiMono
// Video: https://www.youtube.com/watch?v=Mqc5fTEPvYA
// Source: https://tinyurl.com/srktayss

// Normal 4x4 sudoku rules apply. Four arrows outside the grid give the sum
// of the digits along the diagonal they point into; digits may repeat on
// that diagonal unless row/column/box distinctness already forbids it
// (Little Killer semantics).

const graph = cellGraph('4x4');
const geometry = cellGeometry('4x4');

return [
  new Shape('4x4'),

  // Little-killer diagonals: each arrow's entry cell and heading are drawn
  // off-grid, so the ray is walked from the entry cell in that heading.
  LittleKiller.fromCells(6, graph.ray('R3C4', -1, -1), geometry),
  LittleKiller.fromCells(7, graph.ray('R2C1', 1, 1), geometry),
  LittleKiller.fromCells(8, graph.ray('R1C3', 1, -1), geometry),
  LittleKiller.fromCells(9, graph.ray('R4C2', -1, 1), geometry),
];
