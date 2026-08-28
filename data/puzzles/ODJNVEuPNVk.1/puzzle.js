// Title: Brown Bear
// Author: DawNeD & Spef
// Video: https://www.youtube.com/watch?v=ODJNVEuPNVk
// Source: https://tinyurl.com/446a9vj2
//
// Normal sudoku rules apply (default 9x9 grid, no givens). Five thermometers
// (Thermo, strictly increasing from the bulb -- the first cell of each list
// per the drawn thermometer's bulb-first cell order). Six little-killer
// diagonal sums (LittleKiller, values may repeat) read along the drawn
// diagonals; each diagonal is derived from its first on-grid cell and
// direction rather than hand-listed.

const graph = cellGraph('9x9');
const geometry = cellGeometry('9x9');

return [
  new Shape('9x9'),

  // Thermometers: bulb (first cell) to tip.
  new Thermo('R1C7', 'R2C7', 'R3C7', 'R4C6', 'R5C6', 'R6C6'),
  new Thermo('R1C3', 'R2C3', 'R3C4', 'R4C4', 'R5C4', 'R6C4'),
  new Thermo('R2C9', 'R2C8', 'R3C8', 'R4C8', 'R5C9'),
  new Thermo('R2C1', 'R2C2', 'R3C2', 'R4C2', 'R5C1'),
  new Thermo('R7C6', 'R7C5', 'R7C4'),

  // Little-killer diagonal sums: each ray starts at the first on-grid cell
  // of the drawn diagonal and walks (dr, dc) to the grid edge.
  LittleKiller.fromCells(22, graph.ray('R6C9', 1, -1), geometry),
  LittleKiller.fromCells(7, graph.ray('R7C9', 1, -1), geometry),
  LittleKiller.fromCells(15, graph.ray('R7C1', 1, 1), geometry),
  LittleKiller.fromCells(22, graph.ray('R6C1', 1, 1), geometry),
  LittleKiller.fromCells(34, graph.ray('R5C9', 1, -1), geometry),
  LittleKiller.fromCells(12, graph.ray('R8C1', 1, 1), geometry),
];
