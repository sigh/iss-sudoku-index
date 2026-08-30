// Title: A Pretty Little Killer? Happy 2018!
// Author: Unknown
// Video: https://www.youtube.com/watch?v=r5KsPjT8-GQ
// Source: https://cracking-the-cryptic.web.app/sudoku/99BmjjpdjG

// Standard sudoku rules apply. Little Killer sudoku: each clue outside the
// grid gives the sum of the digits along the diagonal its arrow points into;
// digits may repeat on a diagonal (no other rule restricts them here).

const graph = cellGraph('9x9');
const geometry = cellGeometry('9x9');

return [
  new Shape('9x9'),

  // Outside diagonal-sum clues (11, one per number overlay). Entry cell and
  // direction read from each arrow's drawn waypoints; total is the number
  // overlay nearest the arrow's outer tip.
  LittleKiller.fromCells(18, graph.ray('R9C1', -1, 1), geometry),
  LittleKiller.fromCells(20, graph.ray('R7C1', 1, 1), geometry),
  LittleKiller.fromCells(18, graph.ray('R5C1', 1, 1), geometry),
  LittleKiller.fromCells(20, graph.ray('R1C3', 1, -1), geometry),
  LittleKiller.fromCells(18, graph.ray('R1C9', 1, -1), geometry),
  LittleKiller.fromCells(20, graph.ray('R3C9', -1, -1), geometry),
  LittleKiller.fromCells(20, graph.ray('R5C9', -1, -1), geometry),
  LittleKiller.fromCells(18, graph.ray('R7C9', -1, -1), geometry),
  LittleKiller.fromCells(18, graph.ray('R8C9', -1, -1), geometry),
  LittleKiller.fromCells(20, graph.ray('R9C6', -1, 1), geometry),
  LittleKiller.fromCells(20, graph.ray('R9C7', -1, 1), geometry),
];
