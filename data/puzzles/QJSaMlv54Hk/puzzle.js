// Title: Seeing Double
// Author: James Kopp
// Video: https://www.youtube.com/watch?v=QJSaMlv54Hk
// Source: https://app.crackingthecryptic.com/sudoku/tJQLHFtF36

// Normal sudoku rules apply (default row/column/box all-different; boxes are
// the drawn regions, which match the default 3x3 boxes). Two givens.
//
// Each of the 8 numbers outside the grid is read twice, per the rules text:
// once as an XSum for the row/column it fronts, and once as a LittleKiller
// diagonal sum. The two readings use two different start cells: the XSum
// reads from the number's own row/column edge cell, while the diagonal
// starts one cell further over, at the cell a separate small arrowhead
// drawn beside the number points into (its own drawn geometry, offset by
// one cell from the number in the diagonal's own direction).
// Both start cells and directions are decode facts, not a modelling choice.

const graph = cellGraph('9x9');
const geometry = cellGeometry('9x9');

// [clue value, XSum lane cells from the clue's own edge inward], one pair
// per outside number and the row/column edge it is printed against.
const xsumLanes = [
  [29, graph.ray('R1C2', 1, 0)],
  [12, graph.ray('R1C6', 1, 0)],
  [7, graph.ray('R1C7', 1, 0)],
  [16, graph.ray('R5C1', 0, 1)],
  [9, graph.ray('R6C1', 0, 1)],
  [30, graph.ray('R4C9', 0, -1)],
  [9, graph.ray('R6C9', 0, -1)],
  [26, graph.ray('R9C8', -1, 0)],
];

// [clue value, LittleKiller diagonal cells from the arrow's entry cell],
// one pair per drawn diagonal arrow (same 8 clue values, paired by which
// arrow sits beside which number in the source art).
const littleKillerDiagonals = [
  [29, graph.ray('R1C3', 1, 1)],
  [12, graph.ray('R1C7', 1, 1)],
  [7, graph.ray('R1C8', 1, 1)],
  [16, graph.ray('R6C1', 1, 1)],
  [9, graph.ray('R7C1', 1, 1)],
  [30, graph.ray('R5C9', 1, -1)],
  [9, graph.ray('R7C9', 1, -1)],
  [26, graph.ray('R9C7', -1, -1)],
];

return [
  new Shape('9x9'),
  new Given('R1C1', 5),
  new Given('R9C9', 5),
  ...xsumLanes.map(([value, cells]) => XSum.fromCells(value, cells, geometry)),
  ...littleKillerDiagonals.map(
    ([value, cells]) => LittleKiller.fromCells(value, cells, geometry)),
];
