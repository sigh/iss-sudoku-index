// Title: Wheel Of Arrows
// Author: Aspartagcus
// Video: https://www.youtube.com/watch?v=Vc-FYo_nur4
// Source: https://app.crackingthecryptic.com/sudoku/DfPhM8T7bD

// Normal sudoku rules apply (default 9x9 grid, default row/column/box
// all-different). Digits on an arrow sum to the digit in the circle of
// that arrow (Arrow: bulb cell first, then arm cells, repeats allowed on
// the arm). Clues outside the grid give the sum of digits along the
// indicated diagonal, repeats allowed (LittleKiller).
//
// The four bulb circles (R3C3, R3C7, R7C3, R7C7) are each the shared start
// of two separate arrows -- one short spoke and one longer bent spoke --
// so each bulb cell appears as the control cell of two independent Arrow
// constraints. Each LittleKiller below is built from its starting cell and
// (dRow, dCol) direction into the grid, matching the direction each
// diagonal's drawn off-grid arrowhead points.

const geometry = cellGeometry('9x9');
const graph = cellGraph('9x9');

const arrows = [
  new Arrow('R3C3', 'R4C4'),
  new Arrow('R3C3', 'R4C2', 'R5C2', 'R6C2'),
  new Arrow('R3C7', 'R4C6'),
  new Arrow('R3C7', 'R2C6', 'R2C5', 'R2C4'),
  new Arrow('R7C3', 'R6C4'),
  new Arrow('R7C3', 'R8C4', 'R8C5', 'R8C6'),
  new Arrow('R7C7', 'R6C6'),
  new Arrow('R7C7', 'R6C8', 'R5C8', 'R4C8'),
];

const littleKillers = [
  LittleKiller.fromCells(55, graph.ray('R1C1', 1, 1), geometry),
  LittleKiller.fromCells(8, graph.ray('R1C3', 1, -1), geometry),
  LittleKiller.fromCells(53, graph.ray('R1C9', 1, -1), geometry),
  LittleKiller.fromCells(26, graph.ray('R6C9', -1, -1), geometry),
  LittleKiller.fromCells(15, graph.ray('R9C7', -1, 1), geometry),
  LittleKiller.fromCells(31, graph.ray('R4C1', 1, 1), geometry),
];

return [
  new Shape('9x9'),
  ...arrows,
  ...littleKillers,
];
