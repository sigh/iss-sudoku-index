// Title: X-cellent Variant Sudoku
// Author: Jonny Kaufman
// Video: https://www.youtube.com/watch?v=BYs0X4DWM9Q
// Source: https://cracking-the-cryptic.web.app/sudoku/PBqQfMDp23

// Normal sudoku rules: default Shape(9x9) gives rows/cols/boxes.
// XV rule: every neighbouring pair summing to 10 is marked X, every pair
// summing to 5 is marked V, and every such pair is marked (an unmarked
// neighbouring pair sums to neither) -- the exhaustive-marking reading.
// The grid is a torus for this rule only: "neighbouring" also includes the
// wraparound pairs (col9/col1 of a row, row9/row1 of a column). Row/col/box
// groups stay the ordinary non-wrapping ones -- the rules text scopes the
// torus to the X/V marking, not to sudoku's own regions.
//
// ISS's built-in adjacency (cellGraph()) has no notion of the torus wrap,
// and the native X()/V() classes validate their cells against that same
// adjacency, so they can only carry the 9 ordinary-adjacent X marks. Those
// use native X() plus a global StrictXV(), which supplies the negative
// (not-10-and-not-5) over every other ordinary adjacent pair automatically.
// The 5 V marks and the negative over the remaining unmarked wrap pairs are
// hand-written as Pair() constraints, since neither StrictXV()'s negative
// pass nor the X/V adjacency check reaches the wrap.

const sum5 = Pair.fnToKey((a, b) => a + b === 5, 9);
const notXV = Pair.fnToKey((a, b) => a + b !== 5 && a + b !== 10, 9);

// Torus row-wrap pairs R9C_-R1C_ (one per column) and col-wrap pairs
// R_C9-R_C1 (one per row); computed for all 9 columns/rows, then split by
// which carry a drawn V mark: V is at the top/bottom edge of columns 3, 6, 7
// (row wrap) and the left/right edge of rows 7, 8 (column wrap).
const markedRowWrapCols = [3, 6, 7];
const markedColWrapRows = [7, 8];

const rowWrapPairs = [];
for (let c = 1; c <= 9; c++) rowWrapPairs.push([c, makeCellId(9, c), makeCellId(1, c)]);
const colWrapPairs = [];
for (let r = 1; r <= 9; r++) colWrapPairs.push([r, makeCellId(r, 9), makeCellId(r, 1)]);

const wrapV = [
  ...rowWrapPairs.filter(([c]) => markedRowWrapCols.includes(c)),
  ...colWrapPairs.filter(([r]) => markedColWrapRows.includes(r)),
].map(([, a, b]) => new Pair(sum5, 'V (torus)', a, b));

const wrapNotXV = [
  ...rowWrapPairs.filter(([c]) => !markedRowWrapCols.includes(c)),
  ...colWrapPairs.filter(([r]) => !markedColWrapRows.includes(r)),
].map(([, a, b]) => new Pair(notXV, 'not XV (torus)', a, b));

return [
  new Shape('9x9'),

  new Given('R1C9', 5),
  new Given('R6C2', 1),
  new Given('R7C2', 3),
  new Given('R8C3', 8),
  new Given('R8C4', 4),
  new Given('R9C1', 6),

  new StrictXV(),
  // The 9 drawn X marks, all ordinary adjacent pairs.
  new X('R2C3', 'R3C3'),
  new X('R4C3', 'R4C4'),
  new X('R4C5', 'R4C6'),
  new X('R5C5', 'R5C6'),
  new X('R3C5', 'R4C5'),
  new X('R9C5', 'R9C6'),
  new X('R4C8', 'R5C8'),
  new X('R1C8', 'R2C8'),
  new X('R2C7', 'R3C7'),

  ...wrapV,
  ...wrapNotXV,
];
