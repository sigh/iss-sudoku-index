// Title: Spider Web Sudoku
// Author: Shye
// Video: https://www.youtube.com/watch?v=9aIf4w_DuSs
// Source: https://cracking-the-cryptic.web.app/sudoku/L48t9frgJG

// Normal sudoku rules apply (standard boxes, no givens).
//
// Eight outside diagonal-sum clues: each is a LittleKiller, values may
// repeat along the diagonal. Entry cell / direction / total taken from the
// drawn arrow way-points and its paired outside-clue overlay text.
//
// Four grey cells (underlays) must each be larger than every orthogonal
// neighbour it has; encoded as one GreaterThan per grey cell, listing the
// grey cell first followed by its neighbours -- GreaterThan enforces the
// first-listed cell against every later cell in its argument list that is
// grid-adjacent to it, so only (grey, neighbour) pairs are produced, never
// neighbour-to-neighbour comparisons.

const graph = cellGraph('9x9');
const geometry = cellGeometry('9x9');

return [
  new Shape('9x9'),

  LittleKiller.fromCells(37, graph.ray('R6C1', -1, 1), geometry),
  LittleKiller.fromCells(53, graph.ray('R9C2', -1, 1), geometry),
  LittleKiller.fromCells(25, graph.ray('R4C1', 1, 1), geometry),
  LittleKiller.fromCells(46, graph.ray('R9C8', -1, -1), geometry),
  LittleKiller.fromCells(40, graph.ray('R6C9', -1, -1), geometry),
  LittleKiller.fromCells(24, graph.ray('R4C9', 1, -1), geometry),
  LittleKiller.fromCells(48, graph.ray('R1C3', 1, 1), geometry),
  LittleKiller.fromCells(37, graph.ray('R1C7', 1, -1), geometry),

  new GreaterThan('R2C5', 'R1C5', 'R3C5', 'R2C4', 'R2C6'),
  new GreaterThan('R5C8', 'R4C8', 'R6C8', 'R5C7', 'R5C9'),
  new GreaterThan('R8C5', 'R7C5', 'R9C5', 'R8C4', 'R8C6'),
  new GreaterThan('R5C2', 'R4C2', 'R6C2', 'R5C1', 'R5C3'),
];
