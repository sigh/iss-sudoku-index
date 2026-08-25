// Title: Pinwheel
// Author: DiMono
// Video: https://www.youtube.com/watch?v=uwI3loUMiDU
// Source: https://app.crackingthecryptic.com/webapp/L2FhbhdqQn

// Normal sudoku rules apply. Cages sum to the small clue in their top-left
// corner and forbid repeats within the cage. Clues outside the grid give the
// sum of the digits along the diagonal they point into; digits may repeat on
// that diagonal (Little Killer semantics).

const graph = cellGraph('9x9');
const geometry = cellGeometry('9x9');

return [
  new Shape('9x9'),

  // Cages: cell lists and totals from the drawn `cages` array.
  new Cage(8, 'R1C2', 'R2C2'),
  new Cage(5, 'R2C8', 'R2C9'),
  new Cage(9, 'R8C1', 'R8C2'),
  new Cage(6, 'R8C8', 'R9C8'),
  new Cage(13, 'R6C3', 'R7C3'),
  new Cage(13, 'R4C3', 'R5C3'),
  new Cage(8, 'R3C3', 'R3C4', 'R3C5'),
  new Cage(21, 'R3C6', 'R3C7', 'R4C7'),
  new Cage(12, 'R5C7', 'R6C7'),
  new Cage(13, 'R7C6', 'R7C7'),
  new Cage(13, 'R7C4', 'R7C5'),

  // Outside diagonal-sum clues. Each entry cell and direction is read from
  // its own paired drawn arrow stroke, not assumed from the outside position
  // alone -- two different diagonals pass through each of these mid-edge
  // entry points.
  LittleKiller.fromCells(30, graph.ray('R1C5', 1, -1), geometry),
  LittleKiller.fromCells(36, graph.ray('R5C9', -1, -1), geometry),
  LittleKiller.fromCells(33, graph.ray('R9C5', -1, 1), geometry),
  LittleKiller.fromCells(25, graph.ray('R5C1', 1, 1), geometry),
];
