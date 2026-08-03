// Title: June 25, 2023: Two Sudokus
// Author: clover!
// Video: https://www.youtube.com/watch?v=yfuBifYKQnU
// Source: https://tinyurl.com/25bcx4yu

// metadata.rules: "Normal 6x6 sudoku rules apply for each of the two
// overlapping 6x6 grids." Two 6x6 sudokus share a 7x7 board: Grid A =
// R1C1-R6C6, Grid B = R2C2-R7C7 (offset one row and one column). They share
// the 5x5 band R2C2-R6C6. R1C7 and R7C1 belong to neither grid -- two short
// white decorative strokes ring exactly those two cells, and the source's
// withheld solution leaves exactly those two cells unfilled. They get no id
// below: no digit, no constraint.
//
// Grid A is the ISS main grid, so `Shape('6x6')` gives it row/column
// all-different for free, and its default 2x3 box tiling already matches
// the payload's `regions` array (verified: boxDimsForSize(6,6,6) = [2,3]),
// so Grid A needs no explicit region code.
//
// Grid B has no on-grid representation of its own: its 11 cells outside
// Grid A (C7 rows R2-R6, row R7 cols C2-C7) become Var cells VB1..VB11, and
// its row/column/box groups are stated explicitly, since ISS's automatic
// row/column/box groups only cover the main grid (Grid A).

const key = (r, c) => `${r},${c}`;

// Grid A cells (0-indexed rows/cols 0-5) get the main grid's own ids.
const idOf = new Map();
for (let r = 0; r < 6; r++)
  for (let c = 0; c < 6; c++)
    idOf.set(key(r, c), makeCellId(r + 1, c + 1));

// Grid B cells (0-indexed rows/cols 1-6) reuse Grid A's id where the two
// grids overlap; the rest become Var cells, numbered in reading order.
let varCount = 0;
for (let r = 1; r < 7; r++)
  for (let c = 1; c < 7; c++) {
    const k = key(r, c);
    if (!idOf.has(k)) idOf.set(k, ['B', ++varCount]);
  }
const varsB = new Var('B', 'Grid B only', varCount);
for (const [k, id] of idOf) {
  if (Array.isArray(id)) idOf.set(k, varsB.cell(id[1]));
}
const cid = (r, c) => idOf.get(key(r, c));

// Givens, from `cells[][].value` (0-indexed row, col, value).
const givens = [
  [0, 1, 2], [0, 3, 4], [1, 0, 1], [1, 2, 3],
  [2, 5, 5], [3, 6, 6], [4, 5, 3], [5, 6, 2],
].map(([r, c, v]) => new Given(cid(r, c), v));

// Grid B's six boxes: derived from the blue overlay-line dividers (row
// boundaries 3/5, column boundary 4, spanning R2C2-R7C7). Same 2-row x
// 3-col shape as Grid A's boxes, offset by one row and one column.
const BOXES_B = [
  { rows: [1, 2], cols: [1, 2, 3] }, { rows: [1, 2], cols: [4, 5, 6] },
  { rows: [3, 4], cols: [1, 2, 3] }, { rows: [3, 4], cols: [4, 5, 6] },
  { rows: [5, 6], cols: [1, 2, 3] }, { rows: [5, 6], cols: [4, 5, 6] },
];
const boxesB = BOXES_B.map(({ rows, cols }) =>
  new AllDifferent(...rows.flatMap(r => cols.map(c => cid(r, c)))));

// Grid B's six rows and six columns.
const rowsB = Array.from({ length: 6 }, (_, i) =>
  new AllDifferent(...Array.from({ length: 6 }, (_, j) => cid(1 + i, 1 + j))));
const colsB = Array.from({ length: 6 }, (_, j) =>
  new AllDifferent(...Array.from({ length: 6 }, (_, i) => cid(1 + i, 1 + j))));

return [
  new Shape('6x6'),
  varsB,
  ...givens,
  ...boxesB,
  ...rowsB,
  ...colsB,
];
