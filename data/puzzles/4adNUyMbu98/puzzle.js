// Title: Abridged
// Author: Nutty
// Video: https://www.youtube.com/watch?v=4adNUyMbu98
// Source: https://app.crackingthecryptic.com/sudoku/LNjRFLdJ2r

// Rules: normal sudoku; digits on an arrow sum to the bulb; digits along a
// diagonal sum to the number printed outside the grid (repeats allowed);
// cells joined by an X sum to 10; cells joined by a V sum to 5; cells joined
// by a white dot are consecutive. "Not all dots, Xs or Vs are given" is
// non-exhaustive (no negative constraint on unmarked pairs), matching the
// video description's "No negative constraints apply."
//
// Each outside diagonal number is paired with a short off-grid stub drawn
// from the grid edge that fixes which diagonal direction it reads (the
// payload's own "arrow" entries for these have no in-grid arm); the four
// diagonals below are grid.ray() walks from that stub's on-grid cell.

const graph = cellGraph('9x9');
const geometry = cellGeometry('9x9');

return [
  new Shape('9x9'),

  // Arrows: bulb cell first, then arm cells in path order.
  new Arrow('R7C3', 'R6C3', 'R5C2', 'R4C1'),
  new Arrow('R6C4', 'R7C4', 'R8C5', 'R9C6'),
  new Arrow('R9C5', 'R8C4', 'R8C3'),
  new Arrow('R4C6', 'R3C6', 'R2C5', 'R1C4'),
  new Arrow('R3C7', 'R4C7', 'R5C8', 'R6C9'),
  new Arrow('R3C8', 'R3C9', 'R4C9'),

  // Outside diagonal sums.
  LittleKiller.fromCells(43, graph.ray('R1C9', 1, -1), geometry),
  LittleKiller.fromCells(34, graph.ray('R1C6', 1, -1), geometry),
  LittleKiller.fromCells(17, graph.ray('R4C1', 1, 1), geometry),
  LittleKiller.fromCells(15, graph.ray('R6C9', -1, -1), geometry),

  // X (sum to 10).
  new X('R2C1', 'R2C2'),
  new X('R3C1', 'R3C2'),

  // V (sum to 5).
  new V('R1C3', 'R2C3'),
  new V('R9C2', 'R9C3'),
  new V('R1C7', 'R1C8'),
  new V('R8C7', 'R9C7'),

  // White dot (consecutive).
  new WhiteDot('R7C1', 'R8C1'),
];
