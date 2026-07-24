// Title: RAT RUN: 51 Years Later
// Author: Marty Sears
// Video: https://www.youtube.com/watch?v=BRYSUrKXZHc
// Source: https://sudokupad.app/b7mlk88xmf

// Fill an 8x8 grid with digits 0-3 so each digit appears exactly TWICE in
// every row, column, and marked 4x2 box (four row-bands of two rows, crossed
// with two column-bands of four columns). A rat (R, R1C4) must reach a
// cupcake (C, R1C1) by a self-avoiding orthogonal route through a maze whose
// walls the solver must reconstruct (only the outer perimeter is drawn);
// CIRCLES give each cell's wall count. ONE-WAY DOORS: a purple arrow sits on
// a wall-free edge between two different digits and points at the smaller
// one; a route may only cross it in that direction. TEST CONSTRAINT:
// adjacent digits along the route must sum to at least 3.
//
// ENCODED HERE (validated against the known solution): the digit-multiset
// rule (0-3 twice per row/column/box) and, for each of the 16 one-way-door
// edges, the digit inequality alone (larger digit on the arrow's tail side,
// smaller on the side it points to) -- the only part of that rule that
// constrains digits rather than the route.
//
// Rows/columns/boxes need a repeated-digit multiset (each digit exactly
// twice), which the ISS main grid's automatic row/column all-different can
// never express. The real 8x8 grid therefore lives entirely in a Var group
// (`VG`), with row/column/box ContainExact built from scratch; the main
// grid is reduced to a single pinned placeholder cell so it adds no search
// space of its own.
//
// OMITTED:
// - CIRCLES (wall-count digits): no digit values are recoverable anywhere in
//   the source payload for any of the 43 circle overlays -- a decode gap,
//   not a modeling choice.
// - Maze-wall reconstruction and the rat<->cupcake route itself: a
//   self-avoiding path over an unknown, wall-blocked, solver-discovered
//   adjacency graph has no ISS primitive (the standing Rat Run family
//   blocker: wall-aware connectivity is unsupported, independent of the
//   diagonal-move question).
// - The one-way doors' traversal restriction ("only passable in the
//   direction it points"): needs the route, which is omitted.
// - The path-sum TEST constraint ("adjacent digits along the route sum to
//   at least 3"): needs the route, which is omitted.

const GRID = new Var('G', 'Grid', '8x8');

// A plain 8x8 reference geometry supplies the row/column/box groupings;
// gridOverlay translates those cell lists onto the Var grid. The geometry is
// never itself part of the constraints. (Its default box tiling for an
// 8x8/8-value grid is 2 rows x 4 columns -- exactly the drawn "marked 4x2
// box" bands, confirmed against the drawn box-boundary dashes: dense
// stippling at row-coords 2,4,6 and column-coord 4.)
const refGraph = cellGraph('8x8');
const gridOverlay = refGraph.makeOverlay('VG');
const cellAt = (r, c) => GRID.cell(r + 1, c + 1); // r, c: 0-indexed

// Every row, column, and box holds each of 0,1,2,3 exactly twice (8 cells).
const MULTISET = '0_0_1_1_2_2_3_3';
const rows = refGraph.rows().map(row => new ContainExact(MULTISET, ...gridOverlay.at(row)));
const cols = refGraph.columns().map(col => new ContainExact(MULTISET, ...gridOverlay.at(col)));
const boxes = refGraph.boxes().map(box => new ContainExact(MULTISET, ...gridOverlay.at(box)));

// One-way doors: [big, small] cell pairs (0-indexed [row, col]), read off
// the 16 purple arrow glyphs. The arrow points at the smaller digit, so the
// first cell in each pair must be strictly greater than the second.
const ONE_WAY_DOORS = [
  [[0, 0], [0, 1]], // R1C1 > R1C2
  [[0, 2], [1, 2]], // R1C3 > R2C3
  [[0, 3], [0, 4]], // R1C4 > R1C5
  [[0, 6], [0, 5]], // R1C7 > R1C6
  [[1, 4], [1, 5]], // R2C5 > R2C6
  [[1, 5], [2, 5]], // R2C6 > R3C6
  [[1, 7], [1, 6]], // R2C8 > R2C7
  [[5, 1], [5, 0]], // R6C2 > R6C1
  [[6, 1], [7, 1]], // R7C2 > R8C2
  [[7, 3], [7, 4]], // R8C4 > R8C5
  [[6, 4], [6, 5]], // R7C5 > R7C6
  [[7, 5], [7, 6]], // R8C6 > R8C7
  [[2, 7], [2, 6]], // R3C8 > R3C7
  [[2, 6], [3, 6]], // R3C7 > R4C7
  [[2, 4], [2, 3]], // R3C5 > R3C4
  [[5, 3], [5, 4]], // R6C4 > R6C5
];
const GREATER_THAN_KEY = Pair.fnToKey((a, b) => a > b, 4, 0);
const oneWayDoors = ONE_WAY_DOORS.map(([big, small]) =>
  new Pair(GREATER_THAN_KEY, 'one-way door', cellAt(...big), cellAt(...small))
);

return [
  new Shape('1x1', '0-3'),
  new Given('R1C1', 0), // unused placeholder; pinned so it adds no solutions
  GRID,
  ...rows,
  ...cols,
  ...boxes,
  ...oneWayDoors,
];
