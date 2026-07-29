// Title: Parallel Interference
// Author: Legor455
// Video: https://www.youtube.com/watch?v=7e_gOdz3D7g
// Source: https://sudokupad.app/pp93atpfih

// Normal 9x9 Sudoku; outlined cages sum to their printed totals.
// The four outside clues are Little Killer diagonal sums. The blue / diagonal
// has no repeated digits.
const graph = cellGraph('9x9');
const geometry = cellGeometry('9x9');

return [
  new Shape('9x9'),

  // Cages transcribed from the drawn cage totals.
  new Cage(14, 'R1C2', 'R2C2', 'R3C2'),
  new Cage(12, 'R4C4', 'R4C5'),
  new Cage(10, 'R6C3', 'R6C4'),
  new Cage(10, 'R6C5', 'R6C6'),
  new Cage(10, 'R9C1', 'R9C2'),
  new Cage(12, 'R7C8', 'R8C8', 'R9C8'),
  new Cage(10, 'R7C9', 'R8C9'),

  // Outside diagonal clues, listed by the diagonal cells their arrows indicate.
  LittleKiller.fromCells(13, graph.ray('R1C4', 1, -1), geometry),
  LittleKiller.fromCells(60, graph.ray('R1C7', 1, -1), geometry),
  LittleKiller.fromCells(33, graph.ray('R9C6', -1, 1), geometry),
  LittleKiller.fromCells(10, graph.ray('R9C3', -1, 1), geometry),

  new Diagonal(1),
];
