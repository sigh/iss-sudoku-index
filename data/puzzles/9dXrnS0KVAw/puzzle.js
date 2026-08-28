// Title: Unknown
// Author: Phistomefel
// Video: https://www.youtube.com/watch?v=9dXrnS0KVAw
// Source: https://cracking-the-cryptic.web.app/sudoku/HBj9LtDj9M

// Normal sudoku rules apply. Both main diagonals contain each digit 1-9
// exactly once (Diagonal). Ten outside-grid arrows each give the sum of the
// digits along a shorter partial diagonal running from the labelled edge
// cell to the opposite side; digits on those diagonals may repeat
// (LittleKiller). None of the ten little-killer diagonals is one of the two
// full 9-cell main diagonals, so the "may repeat" rule and the "all
// different" rule never apply to the same cell set.

const graph = cellGraph('9x9');
const geometry = cellGeometry('9x9');

return [
  new Shape('9x9'),

  // Both main diagonals contain each digit once. Diagonal(-1) is the
  // '\' diagonal (R1C1..R9C9), Diagonal(1) is the '/' diagonal (R1C9..R9C1).
  new Diagonal(-1),
  new Diagonal(1),

  // Little-killer diagonal sums, one per outside-grid arrow; each ray starts
  // at the labelled edge cell and runs to the grid edge in the drawn direction.
  LittleKiller.fromCells(19, graph.ray('R1C3', 1, -1), geometry),
  LittleKiller.fromCells(28, graph.ray('R1C4', 1, -1), geometry),
  LittleKiller.fromCells(17, graph.ray('R1C5', 1, -1), geometry),
  LittleKiller.fromCells(21, graph.ray('R4C9', -1, -1), geometry),
  LittleKiller.fromCells(14, graph.ray('R8C9', -1, -1), geometry),
  LittleKiller.fromCells(11, graph.ray('R9C7', -1, 1), geometry),
  LittleKiller.fromCells(12, graph.ray('R9C6', -1, 1), geometry),
  LittleKiller.fromCells(13, graph.ray('R8C1', 1, 1), geometry),
  LittleKiller.fromCells(9, graph.ray('R7C1', 1, 1), geometry),
  LittleKiller.fromCells(66, graph.ray('R2C1', 1, 1), geometry),
];
