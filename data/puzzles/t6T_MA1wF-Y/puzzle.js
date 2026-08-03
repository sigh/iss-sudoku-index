// Title: Diagarrow
// Author: Celery
// Video: https://www.youtube.com/watch?v=t6T_MA1wF-Y
// Source: https://app.crackingthecryptic.com/sudoku/3Qtfj9fJPP

// Normal sudoku rules apply. Six arrows: the circled cell equals the sum of
// the rest of that arrow's cells (Arrow). Four little-killer diagonals give
// the sum of digits along the marked diagonal, read outside-in from an
// off-grid arrowhead (LittleKiller). No givens.

const graph = cellGraph('9x9');
const geometry = graph.gridGeometry();

// Arrows: circle cell first, then the line cells, per source wayPoints
// (bulb cell, then each further waypoint snapped to its cell centre).
const arrows = [
  new Arrow('R2C5', 'R3C6', 'R2C7'),
  new Arrow('R6C5', 'R7C5', 'R8C6', 'R9C5'),
  new Arrow('R3C2', 'R4C2', 'R5C3', 'R6C2'),
  new Arrow('R5C7', 'R6C8', 'R7C9'),
  new Arrow('R8C1', 'R8C2', 'R8C3'),
  new Arrow('R3C9', 'R4C9', 'R5C9'),
];

// Little-killer diagonals: each off-grid arrowhead sits exactly on the
// grid-corner point of its diagonal's outermost cell (the two waypoints
// straddle that point), so the anchor cell and direction are read directly
// off the drawn arrow, not off the nearest-cell heuristic. fromCells derives
// ISS's own canonical corner so the drawn end need not match it.
const littleKillers = [
  LittleKiller.fromCells(19, graph.ray('R1C4', 1, 1), geometry),
  LittleKiller.fromCells(26, graph.ray('R4C1', 1, 1), geometry),
  LittleKiller.fromCells(24, graph.ray('R1C6', 1, -1), geometry),
  LittleKiller.fromCells(21, graph.ray('R4C9', 1, -1), geometry),
];

return [
  new Shape('9x9'),
  ...arrows,
  ...littleKillers,
];
