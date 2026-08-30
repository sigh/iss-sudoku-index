// Title: unknown
// Author: Unknown
// Video: https://www.youtube.com/watch?v=3okSllZYNRM
// Source: https://cracking-the-cryptic.web.app/sudoku/JQHG29LDf7

// Normal sudoku rules apply. Cages sum to the printed total and forbid
// repeats within the cage. Clues outside the grid give the sum of the digits
// along the diagonal they point into; digits may repeat on that diagonal
// (Little Killer semantics).

const graph = cellGraph('9x9');
const geometry = cellGeometry('9x9');

return [
  new Shape('9x9'),

  // Cages: cell lists and totals from the drawn `cages` array.
  new Cage(16, 'R1C5', 'R2C5', 'R2C6'),
  new Cage(21, 'R2C4', 'R3C4', 'R3C3'),
  new Cage(16, 'R3C7', 'R4C7', 'R4C8'),
  new Cage(10, 'R5C8', 'R6C8', 'R5C9'),
  new Cage(19, 'R7C6', 'R8C6', 'R7C7'),
  new Cage(8, 'R8C4', 'R8C5', 'R9C5'),
  new Cage(18, 'R6C2', 'R6C3', 'R7C3'),
  new Cage(11, 'R5C1', 'R5C2', 'R4C2'),

  // Outside diagonal-sum clues. Direction of each diagonal is read from the
  // drawn arrow stroke's entry corner and travel direction (down-left,
  // down-right, up-right, up-left), not assumed from the outside position
  // alone.
  LittleKiller.fromCells(8, graph.ray('R1C3', 1, -1), geometry),
  LittleKiller.fromCells(9, graph.ray('R1C4', 1, -1), geometry),
  LittleKiller.fromCells(11, graph.ray('R6C1', 1, 1), geometry),
  LittleKiller.fromCells(10, graph.ray('R7C1', 1, 1), geometry),
  LittleKiller.fromCells(13, graph.ray('R9C6', -1, 1), geometry),
  LittleKiller.fromCells(12, graph.ray('R9C7', -1, 1), geometry),
  LittleKiller.fromCells(14, graph.ray('R3C9', -1, -1), geometry),
  LittleKiller.fromCells(15, graph.ray('R4C9', -1, -1), geometry),
];
