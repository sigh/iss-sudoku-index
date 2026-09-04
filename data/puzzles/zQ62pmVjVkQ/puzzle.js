// Title: Meandering Numbers
// Author: Daisuke Takei
// Video: https://www.youtube.com/watch?v=zQ62pmVjVkQ
// Source: https://cracking-the-cryptic.web.app/sudoku/8NRnqQdL4G

// Rules, transcribed from the video's on-screen rules panel (no rules text is
// carried by the payload itself):
//   "Place a number in each cell. The numbers within an area go from 1 to
//   the size of that area, with consecutive numbers horizontally or
//   vertically adjacent. Cells with equal numbers (necessarily from
//   different areas) must not touch, not even diagonally."
// No row/column/box rule is stated, and none is drawn: rows and columns
// repeat digits (an area's own numbering restarts at 1), so the grid uses
// the Raw type and every rule below is stated explicitly. The largest area
// has 9 cells, so 1-9 covers every area's own range.
const shape = new Shape('10x10', 9, 'Raw');
const graph = cellGraph(shape);
// `shape` itself only carries the serialized spec, not a `numValues` field --
// read the resolved geometry for the actual grid-wide value count (9).
const { numValues } = graph.gridGeometry();

// The 16 irregular areas, drawn data from the payload's `regions` array
// (0-indexed [row, col] pairs, converted here to 1-indexed cells).
const areas = [
  [[1, 1], [2, 1], [1, 2], [2, 2], [1, 3], [2, 3], [2, 4], [1, 4], [1, 5]],
  [[1, 6], [1, 7], [1, 8]],
  [[1, 9], [2, 9], [3, 9], [3, 10], [2, 10], [1, 10]],
  [[2, 5], [2, 6], [3, 5], [3, 6], [4, 6]],
  [[2, 7], [2, 8], [3, 8], [3, 7], [4, 7], [4, 8]],
  [[3, 1], [4, 1], [4, 2], [3, 2]],
  [[3, 3], [4, 3], [4, 4], [3, 4]],
  [[4, 5], [5, 5], [5, 4], [6, 4], [6, 5], [6, 6], [5, 6], [5, 7], [6, 7]],
  [[5, 8], [5, 9], [4, 9], [4, 10], [5, 10], [6, 10], [6, 9]],
  [[6, 8], [7, 8], [7, 9], [7, 10], [8, 9], [8, 10], [9, 9], [9, 10]],
  [[8, 7], [9, 7], [9, 8], [8, 8], [10, 8], [10, 9], [10, 10]],
  [[7, 7], [7, 6], [7, 5], [7, 4], [8, 4], [8, 5], [8, 6], [9, 6], [9, 5]],
  [[10, 2], [10, 1], [10, 3], [10, 4], [10, 5], [10, 6], [10, 7]],
  [[5, 1], [6, 1], [6, 2], [5, 2], [5, 3], [6, 3]],
  [[9, 3], [9, 4]],
  [[7, 1], [8, 1], [9, 1], [9, 2], [8, 2], [7, 2], [7, 3], [8, 3]],
].map(cells => cells.map(([row, col]) => makeCellId(row, col)));

// Givens, drawn data from the payload's `cells` array.
const givens = [
  new Given(makeCellId(2, 5), 4),
  new Given(makeCellId(3, 1), 2),
  new Given(makeCellId(7, 10), 5),
  new Given(makeCellId(8, 3), 7),
];

// Each area holds a permutation of 1..(its own size): pairwise distinct plus
// (for an area smaller than the full 1-9 range) a per-cell restriction to
// that area's own range.
const areaAllDifferent = areas.map(cells => new AllDifferent(...cells));
const areaRanges = areas.flatMap(cells => cells.length < numValues
  ? cells.map(cell => new Given(
    cell, ...Array.from({ length: cells.length }, (_, i) => i + 1)))
  : []);

// "Consecutive numbers horizontally or vertically adjacent": since each
// area's values are already forced to be a bijection onto 1..size, this is
// equivalent to forbidding a difference of 1 between any two cells of the
// same area that are NOT orthogonal neighbours -- if it held between some
// non-adjacent pair, the cells holding some k and k+1 would be that pair (or
// its mirror), which the rule forbids.
const notConsecutiveKey = Pair.fnToKey((a, b) => Math.abs(a - b) !== 1, shape);
const meanderPairs = areas.flatMap(cells => {
  const nonAdjacentPairs = [];
  for (let i = 0; i < cells.length; i++) {
    const neighbours = graph.neighbours(cells[i]);
    for (let j = i + 1; j < cells.length; j++) {
      if (!neighbours.includes(cells[j])) {
        nonAdjacentPairs.push([cells[i], cells[j]]);
      }
    }
  }
  return nonAdjacentPairs.map(
    ([a, b]) => new Pair(notConsecutiveKey, 'meander', a, b));
});

// "Cells with equal numbers must not touch, not even diagonally": no two
// king-move-adjacent cells anywhere on the grid share a value -- a two-cell
// AllDifferent per unordered king-adjacent pair (a same-area pair is already
// forced unequal by that area's own AllDifferent, so applying it there too is
// harmless).
const kingPairs = graph.cells().flatMap(cell => {
  const { row, col } = parseCellId(cell);
  return graph.kingNeighbours(cell)
    // Keep each unordered pair once: only when `other` precedes `cell` in
    // reading order.
    .filter(other => {
      const o = parseCellId(other);
      return o.row < row || (o.row === row && o.col < col);
    })
    .map(other => new AllDifferent(other, cell));
});

return [
  shape,
  ...givens,
  ...areaAllDifferent,
  ...areaRanges,
  ...meanderPairs,
  ...kingPairs,
];
