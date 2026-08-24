// Title: Passthrough
// Author: Clover
// Video: https://www.youtube.com/watch?v=C_ARtim-H4M
// Source: https://app.crackingthecryptic.com/sudoku/r23DHHFMT6

// Normal sudoku rules apply. Cages sum to the small clue in their top-left
// corner (when given) and forbid repeats within the cage; a cage with no
// printed total still forbids repeats. Clues outside the grid give the sum
// of the digits along the diagonal they point into; digits may repeat on
// that diagonal unless another rule forbids it (Little Killer semantics).

const graph = cellGraph('9x9');
const geometry = cellGeometry('9x9');

return [
  new Shape('9x9'),

  // Cages: cell lists and totals from the drawn `cages` array.
  new Cage(11, 'R4C1', 'R4C2', 'R4C3'),
  // No printed total (plus-shaped 9-cell cage): only the no-repeat constraint applies.
  new Cage('', 'R4C4', 'R5C4', 'R6C4', 'R7C4', 'R8C4', 'R6C2', 'R6C3', 'R6C5', 'R6C6'),
  // No printed total (second plus-shaped 9-cell cage): only the no-repeat constraint applies.
  new Cage('', 'R1C6', 'R2C6', 'R3C6', 'R4C6', 'R5C6', 'R4C5', 'R4C7', 'R4C8', 'R4C9'),
  new Cage(16, 'R2C3', 'R2C4', 'R3C4'),
  new Cage(15, 'R1C8', 'R2C8', 'R3C8', 'R2C7', 'R2C9'),
  new Cage(19, 'R6C7', 'R6C8', 'R7C8'),
  new Cage(15, 'R7C6', 'R8C6', 'R9C6'),

  // Outside diagonal-sum clues. Direction of each diagonal is read from the
  // drawn arrow stroke's entry corner and travel direction (down-right,
  // up-right, down-left, up-left), not assumed from the outside position alone.
  LittleKiller.fromCells(30, graph.ray('R5C1', 1, 1), geometry),
  LittleKiller.fromCells(6, graph.ray('R6C1', 1, 1), geometry),
  LittleKiller.fromCells(10, graph.ray('R8C1', 1, 1), geometry),
  LittleKiller.fromCells(10, graph.ray('R9C6', -1, 1), geometry),
  LittleKiller.fromCells(11, graph.ray('R9C7', -1, 1), geometry),
  LittleKiller.fromCells(10, graph.ray('R1C4', 1, -1), geometry),
  LittleKiller.fromCells(13, graph.ray('R6C9', -1, -1), geometry),
];
