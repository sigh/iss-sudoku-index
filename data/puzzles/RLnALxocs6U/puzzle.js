// Title: Humble Pi
// Author: James Kopp
// Video: https://www.youtube.com/watch?v=RLnALxocs6U
// Source: https://sudokupad.app/1q74h2zlba
//
// Rules encoded: normal sudoku (default row/column/box all-different);
// orthogonally adjacent cells cannot be consecutive; cells joined by a
// black dot are in ratio 1:2; two diagonal outside-sum arrows.
//
// The "22" arrow's diagonal runs from R6C9 up-left to R1C4, where it meets
// the grid edge (drawn arrowhead position and direction; the alternative
// direction from R6C9, down-right, would run off the grid after one cell).
// The "7" arrow enters the grid at the row boundary between R8 and R9 on
// the right edge, pointing down-left; that direction leaves the grid
// immediately, so the diagonal it names is the single cell R9C9 -- its sum
// clue is exactly a given for that cell.

const graph = cellGraph('9x9');
const geometry = cellGeometry('9x9');

return [
  new Shape('9x9'),

  // Givens, from the puzzle's clue cells.
  new Given('R3C3', 3),
  new Given('R3C5', 1),
  new Given('R3C6', 4),
  new Given('R4C7', 1),
  new Given('R5C4', 3),
  new Given('R5C7', 5),
  new Given('R6C4', 5),
  new Given('R6C7', 9),
  new Given('R7C5', 6),
  new Given('R7C6', 2),

  new AntiConsecutive(),

  new BlackDot('R3C3', 'R3C4'),

  LittleKiller.fromCells(22, graph.ray('R6C9', -1, -1), geometry),

  // Single-cell diagonal (see header): the sum clue is just R9C9's value.
  new Given('R9C9', 7),
];
