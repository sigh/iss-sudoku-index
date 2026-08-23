// Title: Happy Birthday!
// Author: Akash Doulani
// Video: https://www.youtube.com/watch?v=3YN_PqKozmQ
// Source: https://app.crackingthecryptic.com/sudoku/g8JDR3TR6p

// Normal sudoku rules apply (standard rows/cols/3x3 boxes, no explicit
// regions needed). Some cages show their sums; unlabelled cages (including
// the three single-cell ones) still forbid repeats within themselves.
// Clues outside the grid give the sum of the indicated corner-to-corner
// diagonal, and those diagonals may repeat digits (LittleKiller).
// The payload's coloured cell shading is decorative -- the rules text gives
// colour no semantics -- and is omitted.

const graph = cellGraph('9x9');
const geometry = cellGeometry('9x9');

return [
  new Shape('9x9'),

  // Cages.
  new Cage(17, 'R1C1', 'R2C1', 'R3C1'),
  new Cage(17, 'R3C2', 'R3C3'),
  new Cage(17, 'R1C4', 'R2C4', 'R3C4'),
  new Cage(17, 'R1C6', 'R2C6', 'R3C6'),
  new Cage(7, 'R1C7', 'R1C8'),
  new Cage(7, 'R3C7', 'R3C8'),
  new Cage(7, 'R5C7', 'R5C8'),
  new Cage(7, 'R4C6', 'R5C6'),
  new Cage(7, 'R4C4', 'R5C4'),
  new Cage(7, 'R4C1', 'R5C1'),
  new Cage(17, 'R6C4', 'R7C4', 'R8C4'),
  new Cage(7, 'R9C4', 'R9C5'),
  new Cage(17, 'R7C6', 'R8C6'),
  // No-total single-cell cages: mark membership only, no local constraint.

  // Diagonal outside clues: each off-grid arrow ray gives the start cell and
  // direction, paired with a circled-number badge giving the sum.
  LittleKiller.fromCells(7, graph.ray('R1C3', 1, -1), geometry),
  LittleKiller.fromCells(17, graph.ray('R5C1', 1, 1), geometry),
  LittleKiller.fromCells(7, graph.ray('R8C1', 1, 1), geometry),
  LittleKiller.fromCells(7, graph.ray('R8C9', 1, -1), geometry),
  LittleKiller.fromCells(17, graph.ray('R7C9', 1, -1), geometry),
  LittleKiller.fromCells(17, graph.ray('R4C9', -1, -1), geometry),
];
