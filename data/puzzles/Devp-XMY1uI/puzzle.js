// Title: Queens via LinkedIn
// Author: Thomas Snyder
// Video: https://www.youtube.com/watch?v=Devp-XMY1uI
// Source: https://sudokupad.app/tlr3i291g8

// Place exactly one queen in every row, column and coloured region. Two
// queens cannot touch each other, not even diagonally. The source's own
// solution-check convention marks a queen with 1 and an empty cell with 2, so
// this grid holds only those two values. Rows and columns repeat one of
// them, so the puzzle has no latin-square structure and is built on the Raw
// grid type, which states every rule itself (no implicit row/column/box
// all-different).
const shape = new Shape('9x9', '1-2', 'Raw');
const graph = cellGraph(shape);

// Exactly one queen (1) and the rest empty (2) in a group of `cells`,
// whatever its size -- ContainExact pins that exact multiset.
const oneQueen = (...cells) =>
  new ContainExact(['1', ...Array(cells.length - 1).fill('2')].join('_'), ...cells);

const rows = graph.rows().map(row => oneQueen(...row));
const columns = graph.columns().map(column => oneQueen(...column));

// The nine coloured regions, transcribed from the payload's own `regions`
// array (0-indexed [row, col] pairs), converted to 1-indexed cell ids. This
// is not the same partition as the drawn underlay fill colours: the source
// reuses one colour across two disjoint regions for two of its nine colours
// (purple = regions 0 and 6; deepskyblue = regions 2 and 3), so the fill
// colour alone would merge them into an over-sized "region".
const regionCells = [
  [makeCellId(1, 1), makeCellId(2, 1), makeCellId(2, 2), makeCellId(3, 1), makeCellId(4, 1), makeCellId(5, 1), makeCellId(6, 1), makeCellId(7, 1), makeCellId(7, 2), makeCellId(7, 3)],
  [makeCellId(1, 2), makeCellId(1, 3), makeCellId(2, 3), makeCellId(3, 3), makeCellId(3, 2), makeCellId(1, 4), makeCellId(1, 5), makeCellId(1, 6), makeCellId(1, 7), makeCellId(2, 7), makeCellId(3, 7), makeCellId(3, 8), makeCellId(2, 8), makeCellId(1, 8), makeCellId(1, 9), makeCellId(2, 9), makeCellId(3, 9), makeCellId(4, 9), makeCellId(5, 9), makeCellId(6, 9), makeCellId(7, 9), makeCellId(7, 8), makeCellId(7, 7), makeCellId(8, 7), makeCellId(8, 8), makeCellId(8, 9), makeCellId(9, 9), makeCellId(9, 8), makeCellId(4, 3)],
  [makeCellId(8, 1), makeCellId(9, 1), makeCellId(9, 2)],
  [makeCellId(2, 4), makeCellId(2, 5), makeCellId(2, 6), makeCellId(3, 4), makeCellId(3, 6)],
  [makeCellId(4, 4), makeCellId(4, 5), makeCellId(4, 6), makeCellId(5, 4), makeCellId(5, 5), makeCellId(5, 6), makeCellId(3, 5), makeCellId(5, 3), makeCellId(5, 7), makeCellId(6, 5), makeCellId(7, 5)],
  [makeCellId(9, 4), makeCellId(9, 5), makeCellId(9, 6), makeCellId(8, 2), makeCellId(8, 3), makeCellId(9, 3), makeCellId(9, 7)],
  [makeCellId(4, 7), makeCellId(4, 8), makeCellId(5, 8), makeCellId(6, 8), makeCellId(6, 7)],
  [makeCellId(6, 4), makeCellId(7, 4), makeCellId(8, 4), makeCellId(8, 6), makeCellId(7, 6), makeCellId(8, 5), makeCellId(6, 6)],
  [makeCellId(4, 2), makeCellId(5, 2), makeCellId(6, 2), makeCellId(6, 3)],
];
const regions = regionCells.map(cells => oneQueen(...cells));

// No two queens touch, including diagonally: forbid a king-move-adjacent
// pair of cells from both holding 1. The king-move neighbourhood is 4
// direction templates (right, down, down-right, down-left) shifted across
// the whole grid, so each direction is one Replicate rather than one Pair
// per edge (272 of them, all copies of these same 4 templates).
const notBothQueens = Pair.fnToKey((a, b) => !(a === 1 && b === 1), 2);
const noTouch = [[0, 1], [1, 0], [1, 1], [1, -1]].map(([dRow, dCol]) => {
  const starts = graph.cells().filter(cell => graph.step(cell, dRow, dCol));
  const origin = starts[0];
  const template = new Pair(
    notBothQueens, 'no-touch', origin, graph.step(origin, dRow, dCol));
  return new Replicate(
    [template], Replicate.encodeTargetCells(starts, origin, graph), origin);
});

return [shape, ...rows, ...columns, ...regions, ...noTouch];
