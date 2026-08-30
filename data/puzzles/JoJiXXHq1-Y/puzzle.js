// Title: Little Killer
// Author: Phistomefel
// Video: https://www.youtube.com/watch?v=JoJiXXHq1-Y
// Source: https://cracking-the-cryptic.web.app/sudoku/DgmHtTRHdD

// Standard sudoku (default row/column/box all-different from Shape('9x9')),
// no given digits. Nine Little Killer clues: each totals the digits along the
// diagonal its drawn arrow enters, from the border inward to the far edge of
// the grid; digits may repeat along a diagonal. Diagonal cell lists and entry
// directions are read directly from the payload's arrow waypoints.

const graph = cellGraph('9x9');
const geometry = cellGeometry('9x9');

return [
  new Shape('9x9'),

  LittleKiller.fromCells(14, graph.ray('R1C4', 1, -1), geometry),
  LittleKiller.fromCells(33, graph.ray('R1C5', 1, -1), geometry),
  LittleKiller.fromCells(40, graph.ray('R1C6', 1, -1), geometry),
  LittleKiller.fromCells(46, graph.ray('R1C7', 1, -1), geometry),
  LittleKiller.fromCells(13, graph.ray('R5C9', -1, -1), geometry),
  LittleKiller.fromCells(24, graph.ray('R6C9', -1, -1), geometry),
  LittleKiller.fromCells(24, graph.ray('R7C9', -1, -1), geometry),
  LittleKiller.fromCells(16, graph.ray('R9C6', -1, 1), geometry),
  LittleKiller.fromCells(18, graph.ray('R6C1', 1, 1), geometry),
];
