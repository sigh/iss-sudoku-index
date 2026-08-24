// Title: Disjoint Group Little Killer Sudoku X
// Author: Lizzy01
// Video: https://www.youtube.com/watch?v=aBC_gNEsBGU
// Source: https://app.crackingthecryptic.com/sudoku/F3Ntnqqf26

// Rules: normal sudoku; disjoint groups (no digit repeats in the same
// within-box position across boxes); the two marked corner-to-corner
// diagonals have no repeated digit; each outside clue gives the sum of the
// cells along its indicated diagonal ray, where digits may repeat unless
// another rule (box/disjoint-group/marked-diagonal) forbids it -- so no
// extra constraint is added for that allowance, it is simply the absence of
// one.

const graph = cellGraph('9x9');
const geometry = cellGeometry('9x9');

return [
  // Givens, drawn on the grid.
  new Given('R3C5', 3),
  new Given('R8C3', 4),

  new DisjointSets(),

  // Marked diagonals, both drawn deepskyblue corner-to-corner (lines #0, #1
  // in the payload); direction values per Diagonal's own convention.
  new Diagonal(-1), // R1C1-R9C9 ("\")
  new Diagonal(1),  // R9C1-R1C9 ("/")

  // Little killer diagonal sums. Each ray's start cell and direction are
  // taken from the drawn arrow, paired to its sum overlay by nearest
  // spatial distance.
  LittleKiller.fromCells(17, graph.ray('R1C6', 1, -1), geometry),
  LittleKiller.fromCells(42, graph.ray('R5C1', 1, 1), geometry),
  LittleKiller.fromCells(12, graph.ray('R7C1', 1, 1), geometry),
  LittleKiller.fromCells(15, graph.ray('R8C1', 1, 1), geometry),
  LittleKiller.fromCells(20, graph.ray('R3C9', -1, -1), geometry),
  LittleKiller.fromCells(22, graph.ray('R7C9', -1, -1), geometry),
  LittleKiller.fromCells(41, graph.ray('R9C4', -1, 1), geometry),
  LittleKiller.fromCells(8, graph.ray('R9C7', -1, 1), geometry),
];
