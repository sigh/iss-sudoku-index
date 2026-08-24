// Title: Decipede
// Author: Ri Sa
// Video: https://www.youtube.com/watch?v=4NA_gfxlxyg
// Source: https://app.crackingthecryptic.com/sudoku/gHgpJRbF98

// Normal sudoku rules apply (standard 3x3 boxes, no givens). Clues outside
// the grid sum the diagonal running into the grid at 45 degrees from the
// clue's position, continuing to the grid edge; digits on a diagonal may
// repeat (Little Killer semantics). Ten clues form two length-1/3/5/7/9
// fans: one running up-left from the top/right edges, one running up-right
// from the top/left edges. Directions and cell lists are read from each
// arrow's own drawn heading, each corner outside position paired with its
// nearest overlay total.
// The two length-1 diagonals (the far corners) are just that cell's value,
// so those use Sum directly -- LittleKiller.fromCells throws on a one-cell
// diagonal.

const graph = cellGraph('9x9');
const geometry = cellGeometry('9x9');

const upLeftLittleKillers = [
  // Top/right edge, diagonal runs up-left (dRow -1, dCol -1).
  LittleKiller.fromCells(20, graph.ray('R3C9', -1, -1), geometry),
  LittleKiller.fromCells(40, graph.ray('R5C9', -1, -1), geometry),
  LittleKiller.fromCells(28, graph.ray('R7C9', -1, -1), geometry),
  LittleKiller.fromCells(20, graph.ray('R9C9', -1, -1), geometry),
];

const upRightLittleKillers = [
  // Top/left edge, diagonal runs up-right (dRow -1, dCol +1).
  LittleKiller.fromCells(17, graph.ray('R3C1', -1, 1), geometry),
  LittleKiller.fromCells(18, graph.ray('R5C1', -1, 1), geometry),
  LittleKiller.fromCells(40, graph.ray('R7C1', -1, 1), geometry),
  LittleKiller.fromCells(42, graph.ray('R9C1', -1, 1), geometry),
];

const cornerLittleKillers = [
  new Sum(9, 'R1C9'),
  new Sum(5, 'R1C1'),
];

return [
  new Shape('9x9'),
  ...upLeftLittleKillers,
  ...upRightLittleKillers,
  ...cornerLittleKillers,
];
