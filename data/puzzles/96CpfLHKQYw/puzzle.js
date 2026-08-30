// Title: Little Killer
// Author: Swaroop Guggilam
// Video: https://www.youtube.com/watch?v=96CpfLHKQYw
// Source: https://cracking-the-cryptic.web.app/sudoku/4gfFqMF944

// Normal sudoku rules apply, no given digits. Every arrow outside the grid
// gives the sum of the digits along the diagonal it points into, starting
// at the grid edge and running to the far edge or corner (Little Killer);
// digits may repeat on a diagonal unless the cells share a row, column or
// box. Twenty-two diagonals are clued; the four that are a single cell long
// (the grid corners) use a plain Sum since LittleKiller requires length >= 2.

const graph = cellGraph('9x9');
const geometry = cellGeometry('9x9');

return [
  new Shape('9x9'),

  // Top edge, down-left diagonals (R1C1's diagonal is one cell long).
  new Sum(5, 'R1C1'),
  LittleKiller.fromCells(14, graph.ray('R1C2', 1, -1), geometry),
  LittleKiller.fromCells(17, graph.ray('R1C3', 1, -1), geometry),
  LittleKiller.fromCells(20, graph.ray('R1C4', 1, -1), geometry),
  LittleKiller.fromCells(23, graph.ray('R1C5', 1, -1), geometry),

  // Right edge, up-left diagonals (R1C9's diagonal is one cell long).
  new Sum(3, 'R1C9'),
  LittleKiller.fromCells(6, graph.ray('R2C9', -1, -1), geometry),
  LittleKiller.fromCells(13, graph.ray('R3C9', -1, -1), geometry),
  LittleKiller.fromCells(25, graph.ray('R4C9', -1, -1), geometry),
  LittleKiller.fromCells(23, graph.ray('R5C9', -1, -1), geometry),
  LittleKiller.fromCells(28, graph.ray('R6C9', -1, -1), geometry),

  // Bottom edge, up-right diagonals (R9C9's diagonal is one cell long).
  new Sum(8, 'R9C9'),
  LittleKiller.fromCells(12, graph.ray('R9C8', -1, 1), geometry),
  LittleKiller.fromCells(19, graph.ray('R9C7', -1, 1), geometry),
  LittleKiller.fromCells(20, graph.ray('R9C6', -1, 1), geometry),
  LittleKiller.fromCells(28, graph.ray('R9C5', -1, 1), geometry),

  // Left edge, down-right diagonals (R9C1's diagonal is one cell long).
  LittleKiller.fromCells(30, graph.ray('R4C1', 1, 1), geometry),
  LittleKiller.fromCells(11, graph.ray('R5C1', 1, 1), geometry),
  LittleKiller.fromCells(17, graph.ray('R6C1', 1, 1), geometry),
  LittleKiller.fromCells(15, graph.ray('R7C1', 1, 1), geometry),
  LittleKiller.fromCells(12, graph.ray('R8C1', 1, 1), geometry),
  new Sum(2, 'R9C1'),
];
