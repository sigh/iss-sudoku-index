// Title: Untitled
// Author: Bastien Vial-Jaime
// Video: https://www.youtube.com/watch?v=to6f4D33h78
// Source: https://cracking-the-cryptic.web.app/sudoku/jgDtbQDnpm

// Normal sudoku rules apply. Clues outside the grid give the sum of the
// digits along the diagonal indicated by the arrow (Little Killer); digits
// on such a diagonal may repeat since it is not a row, column, or box. No
// givens.

const graph = cellGraph('9x9');
const geometry = cellGeometry('9x9');

return [
  new Shape('9x9'),

  // Little-killer diagonal sums, one per drawn outside arrow. Each ray
  // starts at the entry cell next to the labelled edge and runs to the grid
  // edge in the drawn direction.
  LittleKiller.fromCells(5, graph.ray('R1C2', 1, -1), geometry),
  LittleKiller.fromCells(10, graph.ray('R1C3', 1, -1), geometry),
  LittleKiller.fromCells(32, graph.ray('R1C5', 1, -1), geometry),
  LittleKiller.fromCells(36, graph.ray('R1C6', 1, -1), geometry),
  LittleKiller.fromCells(5, graph.ray('R2C9', -1, -1), geometry),
  LittleKiller.fromCells(10, graph.ray('R3C9', -1, -1), geometry),
  LittleKiller.fromCells(33, graph.ray('R5C9', -1, -1), geometry),
  LittleKiller.fromCells(19, graph.ray('R6C9', -1, -1), geometry),
  LittleKiller.fromCells(44, graph.ray('R9C4', -1, 1), geometry),
  LittleKiller.fromCells(26, graph.ray('R9C5', -1, 1), geometry),
  LittleKiller.fromCells(10, graph.ray('R9C7', -1, 1), geometry),
  LittleKiller.fromCells(5, graph.ray('R9C8', -1, 1), geometry),
  LittleKiller.fromCells(5, graph.ray('R8C1', 1, 1), geometry),
  LittleKiller.fromCells(10, graph.ray('R7C1', 1, 1), geometry),
  LittleKiller.fromCells(27, graph.ray('R5C1', 1, 1), geometry),
  LittleKiller.fromCells(35, graph.ray('R4C1', 1, 1), geometry),
];
