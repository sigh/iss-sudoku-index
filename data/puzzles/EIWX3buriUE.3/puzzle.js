// Title: Little Killer Sudoku
// Author: Clover
// Video: https://www.youtube.com/watch?v=EIWX3buriUE
// Source: https://app.crackingthecryptic.com/sudoku/RQMpF2m6NN

// Normal sudoku rules apply (standard rows/cols/3x3 boxes, no explicit
// regions needed -- the payload's region list is the same 9 boxes). Clues
// outside the grid give the sum of the indicated corner-to-corner diagonal,
// and those diagonals may repeat digits (LittleKiller). Each ray's start
// cell and direction are read from the drawn arrow's off-grid endpoint.

const graph = cellGraph('9x9');
const geometry = cellGeometry('9x9');

return [
  new Shape('9x9'),

  // Givens.
  new Given('R1C5', 3),
  new Given('R2C2', 2),
  new Given('R2C8', 4),
  new Given('R3C3', 8),
  new Given('R4C4', 2),
  new Given('R5C1', 9),
  new Given('R5C9', 5),
  new Given('R6C6', 6),
  new Given('R7C7', 4),
  new Given('R8C2', 8),
  new Given('R8C8', 6),
  new Given('R9C5', 7),

  // Little Killer diagonals: each off-grid arrow ray gives the start cell
  // and direction, paired with a circled-number badge giving the sum.
  LittleKiller.fromCells(41, graph.ray('R1C1', 1, 1), geometry),
  LittleKiller.fromCells(9, graph.ray('R2C1', -1, 1), geometry),
  LittleKiller.fromCells(8, graph.ray('R3C1', -1, 1), geometry),
  LittleKiller.fromCells(12, graph.ray('R9C2', -1, -1), geometry),
  LittleKiller.fromCells(11, graph.ray('R9C3', -1, -1), geometry),
  LittleKiller.fromCells(9, graph.ray('R1C7', 1, 1), geometry),
  LittleKiller.fromCells(10, graph.ray('R1C8', 1, 1), geometry),
  LittleKiller.fromCells(10, graph.ray('R7C9', 1, -1), geometry),
  LittleKiller.fromCells(11, graph.ray('R8C9', 1, -1), geometry),
];
