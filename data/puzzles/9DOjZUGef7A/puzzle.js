// Title: This Sudoku Was Made By The Devil
// Author: Phistomefel
// Video: https://www.youtube.com/watch?v=9DOjZUGef7A
// Source: https://cracking-the-cryptic.web.app/sudoku/RbP4R6bb62

// Normal sudoku rules apply. No given digits. Clues outside the grid give
// the sum of the digits along the diagonal the adjacent arrow points into;
// digits may repeat on that diagonal (Little Killer semantics).

const graph = cellGraph('9x9');
const geometry = cellGeometry('9x9');

return [
  new Shape('9x9'),

  // 11 outside diagonal-sum clues. Each start cell and direction is read
  // from its drawn arrow (down-left/up-left/up-right/down-right); each was
  // paired to its adjacent outside-clue text by nearest position (all pairs
  // sit at the same short distance, so the pairing is unambiguous).
  LittleKiller.fromCells(13, graph.ray('R1C2', 1, -1), geometry),
  LittleKiller.fromCells(15, graph.ray('R1C3', 1, -1), geometry),
  LittleKiller.fromCells(31, graph.ray('R1C4', 1, -1), geometry),
  LittleKiller.fromCells(20, graph.ray('R3C9', -1, -1), geometry),
  LittleKiller.fromCells(22, graph.ray('R5C9', -1, -1), geometry),
  LittleKiller.fromCells(20, graph.ray('R7C9', -1, -1), geometry),
  LittleKiller.fromCells(15, graph.ray('R9C8', -1, 1), geometry),
  LittleKiller.fromCells(13, graph.ray('R8C1', 1, 1), geometry),
  LittleKiller.fromCells(21, graph.ray('R7C1', 1, 1), geometry),
  LittleKiller.fromCells(25, graph.ray('R6C1', 1, 1), geometry),
  LittleKiller.fromCells(26, graph.ray('R5C1', 1, 1), geometry),
];
