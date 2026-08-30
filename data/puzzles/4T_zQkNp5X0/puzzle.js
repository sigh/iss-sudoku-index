// Title: Stefan Heine's Beautiful "Little Killer" puzzle
// Author: Unknown
// Video: https://www.youtube.com/watch?v=4T_zQkNp5X0
// Source: https://cracking-the-cryptic.web.app/sudoku/gLj7HFb7bM

// Normal sudoku rules apply, no given digits. Sixteen little-killer clues
// outside the grid give the sum of the digits along the diagonal the arrow
// points into; digits may repeat on that diagonal (per the video
// description). Each diagonal's start cell and direction are taken directly
// from the drawn arrow's waypoints (down-right, down-left, up-right,
// up-left), which match the unique candidate diagonal for that lane.

const graph = cellGraph('9x9');
const geometry = cellGeometry('9x9');

return [
  new Shape('9x9'),

  // Little killer diagonal-sum clues, top edge (down-left / down-right).
  LittleKiller.fromCells(72, graph.ray('R1C1', 1, 1), geometry),
  LittleKiller.fromCells(7, graph.ray('R1C2', 1, -1), geometry),
  LittleKiller.fromCells(20, graph.ray('R1C3', 1, -1), geometry),
  LittleKiller.fromCells(5, graph.ray('R1C4', 1, -1), geometry),
  LittleKiller.fromCells(42, graph.ray('R1C5', 1, -1), geometry),

  // Left edge (down-right).
  LittleKiller.fromCells(16, graph.ray('R6C1', 1, 1), geometry),
  LittleKiller.fromCells(15, graph.ray('R7C1', 1, 1), geometry),
  LittleKiller.fromCells(15, graph.ray('R8C1', 1, 1), geometry),

  // Bottom edge (up-right), including the full corner diagonal.
  LittleKiller.fromCells(24, graph.ray('R9C1', -1, 1), geometry),
  LittleKiller.fromCells(34, graph.ray('R9C5', -1, 1), geometry),
  LittleKiller.fromCells(19, graph.ray('R9C6', -1, 1), geometry),
  LittleKiller.fromCells(16, graph.ray('R9C7', -1, 1), geometry),
  LittleKiller.fromCells(4, graph.ray('R9C8', -1, 1), geometry),

  // Right edge (up-left).
  LittleKiller.fromCells(23, graph.ray('R4C9', -1, -1), geometry),
  LittleKiller.fromCells(20, graph.ray('R3C9', -1, -1), geometry),
  LittleKiller.fromCells(10, graph.ray('R2C9', -1, -1), geometry),
];
