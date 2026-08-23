// Title: Frames
// Author: AFrayedKnot
// Video: https://www.youtube.com/watch?v=-2ltlr06JKA
// Source: https://app.crackingthecryptic.com/sudoku/qfF8MpQ6Dm

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
  new Cage(8, 'R5C1', 'R6C1', 'R5C2'),
  new Cage(8, 'R5C4', 'R5C5', 'R6C5'),
  new Cage(8, 'R8C5', 'R9C5', 'R9C4'),
  new Cage(27, 'R7C2', 'R8C2', 'R8C3', 'R7C3'),
  new Cage(20, 'R2C2', 'R1C2', 'R1C3'),
  new Cage(21, 'R2C8', 'R2C7', 'R3C7', 'R3C8'),
  new Cage(19, 'R7C9', 'R8C9', 'R8C8'),
  // No printed total: still a real cage, so only the no-repeat constraint applies.
  new Cage('', 'R2C6', 'R3C6', 'R4C6', 'R4C7', 'R4C8'),

  // Outside diagonal-sum clues. Direction of each diagonal is read from the
  // drawn arrow stroke's entry corner and travel direction (down-right,
  // up-left, up-right), not assumed from the outside position alone.
  LittleKiller.fromCells(49, graph.ray('R1C2', 1, 1), geometry),
  LittleKiller.fromCells(15, graph.ray('R1C6', 1, 1), geometry),
  LittleKiller.fromCells(10, graph.ray('R2C9', -1, -1), geometry),
  LittleKiller.fromCells(48, graph.ray('R9C1', -1, 1), geometry),
  LittleKiller.fromCells(13, graph.ray('R5C1', 1, 1), geometry),
];
