// Title: How hard can a 6x6 sudoku be?
// Author: Unknown
// Video: https://www.youtube.com/watch?v=V-iY2ISw6tE
// Source: https://cracking-the-cryptic.web.app/sudoku/LnRH9mpjh4

// Standard 6x6 sudoku (six 2x3 boxes, rows/columns/boxes all-different; no
// givens) plus four Little Killer outside clues: each diagonal's digits must
// sum to the printed total, and digits may repeat along a diagonal since it
// is not itself a row/column/box.
//
// Each clue's start cell (nearest its badge) and direction are read off the
// arrow's own drawn path; graph.ray() then derives the rest of the diagonal
// out to the grid edge, rather than hand-listing every cell id.

const geometry = cellGeometry(6);
const graph = cellGraph(6);

return [
  new Shape('6x6'),

  LittleKiller.fromCells(8, graph.ray('R1C4', 1, -1), geometry),
  LittleKiller.fromCells(9, graph.ray('R3C1', 1, 1), geometry),
  LittleKiller.fromCells(17, graph.ray('R6C2', -1, 1), geometry),
  LittleKiller.fromCells(26, graph.ray('R5C6', -1, -1), geometry),
];
