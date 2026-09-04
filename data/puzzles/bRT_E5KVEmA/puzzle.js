// Title: 3 in 1
// Author: PjotrV
// Video: https://www.youtube.com/watch?v=bRT_E5KVEmA
// Source: https://sudokupad.app/ox3v11xvil

// 9x9 grid. No Sudoku layer at all: rows, columns and boxes carry no rule.
// The puzzle stacks three rulesets on one grid fill:
//
//  Part 1 (Fillomino): divide the grid into orthogonally connected regions;
//  every cell holds its own region's cell count; no two orthogonally adjacent
//  regions may show the same count.
//  Part 2 (LITS): place one tetromino (I/L/T/S; rotations/reflections count
//  as the same shape) inside each region found in Part 1, so that no two
//  same-shaped tetrominoes share an edge, every shaded cell across the whole
//  grid forms one connected area, and no 2x2 area is fully shaded.
//  Part 3 (Star Battle): over the unshaded remainder of each Part-2 region
//  (not the Part-1 region itself), place exactly one star per row, column and
//  region, no two stars touching even diagonally.
//
// The setter's own solution-check convention records only the 9 star
// positions (a "1" per starred cell, blank elsewhere): exactly nine "1"s,
// one per row and one per column, no two diagonally adjacent. The board here
// is that star layer -- the one thing the published answer verifies.
//
// Rules encoded: Part 3 (Star Battle)'s row and column clauses, plus the
// no-touch rule. A star per row/column already forbids two stars sharing a
// row or a column, so no two stars can be orthogonally adjacent either --
// only the diagonal case needs its own rule.
//
// Omitted, in full:
//  * Part 1 (Fillomino): the region partition and its size/adjacency rule.
//  * Part 2 (LITS): the tetromino placement, its shape identity, the
//    no-same-shape-touch rule, the global shaded-connectivity rule and the
//    no-2x2-shaded rule.
//  * Part 3's region clause ("one star per [LITS-carved] region").
//  All three need a per-region predicate (a Fillomino cell's own count; an
//  enumerable tetromino shape inside the region; an exact star count inside
//  the Part-2-derived region) attached to a partition that is unanchored
//  (most cells carry no drawn Fillomino clue) and unbounded in size (no rule
//  caps a region below the 81-cell board, and the givens alone already reach
//  14). This is exactly the standing "no ISS primitive for an unbounded,
//  unanchored cell-region partition with a per-component predicate" gap:
//  blocker #861 (consolidated ask) and its still-open children #1070
//  (per-component shape test plus per-component count, no anchor) and #2057
//  (Snake Egg (Star Battle): a derived, unbounded, unanchored partition
//  needing a per-region exact star count -- the same shape Part 3 needs
//  here). #723 additionally covers the "no two same-shape discovered
//  components may touch" half Part 2 needs on its own. Citing these rather
//  than re-filing, per the pipeline's well-known-gap policy.
//
//  A full rooted-tree Fillomino encoding for Part 1 (the construction used
//  for QMe-6fKgFdc, ZrfTSUxm0iE and -CgmQDoPWfI: a tens/units split plus a
//  root-row/root-col/coprime-distance identity stack) was built and does
//  lint clean, but no reference exists for the grid it produces -- the
//  stored answer carries only star positions, none of the Fillomino fill --
//  and the acceptance search for any completion consistent with the 28
//  drawn givens still had not resolved after 100,000 backtracks (all of
//  5,000/50,000/100,000 backtrack attempts came back CAPPED).

const SIDE = 9;
const STAR = 1;
const NO_STAR = 0;

const shape = new Shape(SIDE + 'x' + SIDE, '0-9', 'Raw');
const graph = cellGraph(shape);
const cells = graph.cells();

const domain = graph.makeReplicate(new Given(cells[0], NO_STAR, STAR));

// --- Star Battle: row/column count and diagonal no-touch -------------------
const range = (lo, hi) => Array.from({ length: hi - lo + 1 }, (_, i) => lo + i);
const rows = range(1, SIDE).map(
  row => range(1, SIDE).map(col => makeCellId(row, col)));
const cols = range(1, SIDE).map(
  col => range(1, SIDE).map(row => makeCellId(row, col)));
const lineStars = [...rows, ...cols].map(
  line => new ContainExact(String(STAR), ...line));

// A star per row and a star per column already forbid two stars sharing an
// edge (they would share a row or a column), so only the diagonal case needs
// its own rule. One Replicate per diagonal offset: the template constrains
// the first pair at that offset and is stamped onto every other cell with a
// neighbour there.
const noTouchDiag = Pair.fnToKey((a, b) => !(a === STAR && b === STAR), shape);
const noTouch = [[1, -1], [1, 1]].map(([dRow, dCol]) => {
  const origins = cells.filter(cell => graph.step(cell, dRow, dCol));
  const anchor = origins[0];
  const template = new Pair(
    noTouchDiag, 'stars do not touch diagonally',
    anchor, graph.step(anchor, dRow, dCol));
  return new Replicate(
    [template], Replicate.encodeTargetCells(origins, anchor, graph), anchor);
});

return [
  shape,
  domain,
  ...lineStars,
  ...noTouch,
];
