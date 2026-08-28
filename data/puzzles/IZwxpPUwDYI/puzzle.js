// Title: Unknown
// Author: Unknown
// Video: https://www.youtube.com/watch?v=IZwxpPUwDYI
// Source: https://cracking-the-cryptic.web.app/sudoku/2rBDHn3ghf

// Normal sudoku rules apply. Each number outside the grid is the sum of the
// digits along the diagonal its arrow points into (Little Killer semantics);
// digits may repeat on that diagonal.

const graph = cellGraph('9x9');
const geometry = cellGeometry('9x9');

return [
  new Shape('9x9'),

  // Nine outside diagonal-sum clues, entry cell + direction read from the
  // drawn arrows; direction and entry cell for each is unambiguous
  // (nearest-badge and printed-position readings agree).
  LittleKiller.fromCells(27, graph.ray('R1C4', 1, -1), geometry),
  LittleKiller.fromCells(20, graph.ray('R1C7', 1, -1), geometry),
  LittleKiller.fromCells(21, graph.ray('R3C9', -1, -1), geometry),
  LittleKiller.fromCells(18, graph.ray('R6C9', -1, -1), geometry),
  LittleKiller.fromCells(30, graph.ray('R9C6', -1, 1), geometry),
  LittleKiller.fromCells(33, graph.ray('R9C3', -1, 1), geometry),
  LittleKiller.fromCells(18, graph.ray('R7C1', 1, 1), geometry),
  LittleKiller.fromCells(17, graph.ray('R4C1', 1, 1), geometry),
  LittleKiller.fromCells(49, graph.ray('R2C1', 1, 1), geometry),
];
