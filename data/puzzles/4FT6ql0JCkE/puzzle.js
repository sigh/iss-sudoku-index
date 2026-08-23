// Title: Divergence
// Author: grkles
// Video: https://www.youtube.com/watch?v=4FT6ql0JCkE
// Source: https://app.crackingthecryptic.com/sudoku/hN4mD6bGgp

// Normal sudoku rules apply (default 3x3 box regions). Arrows: digits along
// the arm sum to the digit in the circled bulb. Outside diagonal clues give
// the sum of every digit along the drawn diagonal ray, starting at the
// on-grid cell nearest the clue; digits may repeat along a diagonal.
// Each diagonal is built with graph.ray(startCell, dRow, dCol) from the
// on-grid cell nearest the outside clue, using the ray direction recorded in
// the source payload's off-grid arrow waypoint for that clue, then handed to
// LittleKiller.fromCells so the canonical corner/direction come from the
// cells themselves.

const graph = cellGraph('9x9');
const geometry = cellGeometry('9x9');

return [
  new Shape('9x9'),

  // Arrows: Arrow(bulb, ...arm) -- bulb first, then arm cells outward.
  new Arrow('R2C7', 'R3C6', 'R2C5', 'R1C4'),
  new Arrow('R3C2', 'R4C3', 'R5C2', 'R6C1'),
  new Arrow('R5C4', 'R6C3', 'R7C2'),
  new Arrow('R5C6', 'R4C7', 'R3C8'),
  new Arrow('R7C8', 'R6C7', 'R5C8', 'R4C9'),
  new Arrow('R8C3', 'R7C4', 'R8C5', 'R9C6'),

  // Outside diagonal-sum clues.
  LittleKiller.fromCells(16, graph.ray('R1C3', 1, -1), geometry),
  LittleKiller.fromCells(15, graph.ray('R1C6', 1, -1), geometry),
  LittleKiller.fromCells(14, graph.ray('R4C1', 1, 1), geometry),
  LittleKiller.fromCells(31, graph.ray('R6C9', -1, -1), geometry),
  LittleKiller.fromCells(29, graph.ray('R9C4', -1, 1), geometry),
];
