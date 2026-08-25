// Title: Magic Clones?
// Author: Botaku
// Video: https://www.youtube.com/watch?v=qI-PpkB1F9g
// Source: https://app.crackingthecryptic.com/webapp/P4fBQGPP64

// Normal sudoku rules apply. Clues outside the grid give the sum of the
// cells along the indicated diagonal; digits may repeat along that diagonal
// (Little Killer semantics). Omitted: the 8 identical 3-cell "little clone"
// regions with a knight's-move digit restriction, the 3 identical 5-cell
// "big clone" regions with a no-touch and distinct-little-clone-touch-count
// restriction, and the grey cell's clone membership.

const graph = cellGraph('9x9');
const geometry = cellGeometry('9x9');

return [
  new Shape('9x9'),

  new Given('R1C1', 6),
  new Given('R1C9', 8),
  new Given('R5C1', 7),
  new Given('R5C5', 5),
  new Given('R9C1', 2),
  new Given('R9C5', 9),
  new Given('R9C9', 4),

  // Outside diagonal-sum clues. Direction of each diagonal is read from the
  // drawn arrow stroke's entry cell and travel direction (down-right,
  // down-left), not assumed from the outside position alone.
  LittleKiller.fromCells(13, graph.ray('R1C5', 1, 1), geometry),
  LittleKiller.fromCells(16, graph.ray('R7C9', 1, -1), geometry),
];
