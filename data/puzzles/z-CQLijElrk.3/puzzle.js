// Title: September 2, 2021: LK
// Author: Setter 1
// Video: https://www.youtube.com/watch?v=z-CQLijElrk
// Source: https://tinyurl.com/yp8m5f5b

// Standard 6x6 sudoku (1-6 once per row, column, and 2x3 box); no givens.
// Four outside little-killer diagonals sum their digits to the printed
// total, repeats along a diagonal allowed (LittleKiller semantics).
// Cell lists and totals below are the drawn `littlekillersum` entries.

const graph = cellGraph('6x6');
const geometry = cellGeometry('6x6');

return [
  new Shape('6x6'),

  LittleKiller.fromCells(7, graph.ray('R1C2', 1, 1), geometry),
  LittleKiller.fromCells(12, graph.ray('R1C3', 1, 1), geometry),
  LittleKiller.fromCells(8, graph.ray('R6C4', -1, -1), geometry),
  LittleKiller.fromCells(20, graph.ray('R6C5', -1, -1), geometry),
];
