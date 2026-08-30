// Title: Little Killer Sudoku
// Author: Sed Holaysan
// Video: https://www.youtube.com/watch?v=JKxI9mFhm8s
// Source: https://cracking-the-cryptic.web.app/sudoku/dtjnnFq4Tf

// Normal sudoku rules apply; no givens are printed. Each outside clue gives
// the sum of the digits along the diagonal its arrow points into; digits may
// repeat on that diagonal (Little Killer semantics). Direction of each
// diagonal is read from the drawn arrow stroke's entry corner and travel
// direction (down-left, down-right, up-right, up-left).

const graph = cellGraph('9x9');
const geometry = cellGeometry('9x9');

return [
  new Shape('9x9'),

  LittleKiller.fromCells(16, graph.ray('R1C2', 1, -1), geometry),
  LittleKiller.fromCells(6, graph.ray('R1C3', 1, -1), geometry),
  LittleKiller.fromCells(20, graph.ray('R1C4', 1, -1), geometry),
  LittleKiller.fromCells(29, graph.ray('R1C6', 1, -1), geometry),
  LittleKiller.fromCells(48, graph.ray('R4C1', 1, 1), geometry),
  LittleKiller.fromCells(17, graph.ray('R6C1', 1, 1), geometry),
  LittleKiller.fromCells(15, graph.ray('R7C1', 1, 1), geometry),
  LittleKiller.fromCells(17, graph.ray('R8C1', 1, 1), geometry),
  LittleKiller.fromCells(35, graph.ray('R9C4', -1, 1), geometry),
  LittleKiller.fromCells(13, graph.ray('R9C6', -1, 1), geometry),
  LittleKiller.fromCells(17, graph.ray('R9C7', -1, 1), geometry),
  LittleKiller.fromCells(16, graph.ray('R9C8', -1, 1), geometry),
  LittleKiller.fromCells(10, graph.ray('R2C9', -1, -1), geometry),
  LittleKiller.fromCells(24, graph.ray('R3C9', -1, -1), geometry),
  LittleKiller.fromCells(5, graph.ray('R4C9', -1, -1), geometry),
  LittleKiller.fromCells(28, graph.ray('R6C9', -1, -1), geometry),
];
