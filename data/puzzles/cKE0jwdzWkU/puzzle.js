// Title: Fat X
// Author: Aron Lide (Aspartagcus)
// Video: https://www.youtube.com/watch?v=cKE0jwdzWkU
// Source: https://app.crackingthecryptic.com/sudoku/2j4Bdt62rR
//
// Normal sudoku rules apply. Each outside arrow gives the sum of digits along
// the diagonal it points into; repeats are allowed on a diagonal since the
// rules do not declare it a region. LittleKiller is exactly this clue type
// (diagonal sum, repeats allowed); fromCells derives the correct canonical
// diagonal (and direction) from the drawn cell path rather than hand-picking
// a corner and sign.

const graph = cellGraph('9x9');
const geometry = cellGeometry('9x9');

return [
  new Shape('9x9'),

  // Two full corner-to-corner diagonals.
  LittleKiller.fromCells(35, graph.ray('R1C1', 1, 1), geometry),
  LittleKiller.fromCells(39, graph.ray('R1C9', 1, -1), geometry),

  // The diagonal immediately to either side of the main diagonal.
  LittleKiller.fromCells(27, graph.ray('R1C2', 1, 1), geometry),
  LittleKiller.fromCells(35, graph.ray('R2C1', 1, 1), geometry),

  // The diagonal immediately to either side of the anti-diagonal.
  LittleKiller.fromCells(12, graph.ray('R1C8', 1, -1), geometry),
  LittleKiller.fromCells(69, graph.ray('R2C9', 1, -1), geometry),
];
