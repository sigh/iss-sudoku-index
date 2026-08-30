// Title: How is Gattai Pronounced in Japanese? Asking for a pun.
// Author: Philip Newman
// Video: https://www.youtube.com/watch?v=xAU9TjIYwOk
// Source: https://tinyurl.com/5n9b7hvd

// Five 4x4 sudoku grids (values 1-4) overlap in a pinwheel: a central grid C
// shares a 1x3 strip of cells with each satellite grid T/L/R/B; no two
// satellites touch each other. Each grid independently needs all-different
// rows, columns and 2x2 boxes; a shared cell must satisfy both grids at
// once. Arrows: digits along the arm sum to the digit in the circled bulb
// (first cell), repeats allowed on the arm.
//
// C is the native ISS board (Shape('4x4')); it gets its rows/cols/boxes for
// free from the default Sudoku grid type. T/L/R/B are not real board cells:
// each contributes a 13-cell Var group for the cells it does not share with
// C, and its own row/column/box AllDifferent groups are built by hand over a
// mix of C's real cell ids and its own Var ids. GRIDS is listed C-first so a
// shared cell (found in both C's and a satellite's box) resolves to C's real
// id, never a Var.

const GRIDS = [
  { key: 'C', r0: 4, c0: 4 },
  { key: 'T', r0: 1, c0: 5 },
  { key: 'L', r0: 3, c0: 1 },
  { key: 'R', r0: 5, c0: 7 },
  { key: 'B', r0: 7, c0: 3 },
];
const N = 4;
const key = (r, c) => `${r},${c}`;
const ownerIndex = (r, c) =>
  GRIDS.findIndex(g => r >= g.r0 && r < g.r0 + N && c >= g.c0 && c < g.c0 + N);

const idOf = new Map();
const varCounts = [0, 0, 0, 0, 0];
for (const g of GRIDS)
  for (let i = 0; i < N; i++)
    for (let j = 0; j < N; j++) {
      const r = g.r0 + i, c = g.c0 + j;
      const k = key(r, c);
      if (idOf.has(k)) continue;
      const oi = ownerIndex(r, c);
      idOf.set(k, oi === 0
        ? makeCellId(r - GRIDS[0].r0 + 1, c - GRIDS[0].c0 + 1)
        : [oi, ++varCounts[oi]]);
    }

const vars = GRIDS.map((g, i) => (i === 0 ? null : new Var(g.key, `${g.key} grid`, varCounts[i])));
for (const [k, id] of idOf) if (Array.isArray(id)) idOf.set(k, vars[id[0]].cell(id[1]));
const cid = (r, c) => idOf.get(key(r, c));

// Row/column/box all-different for each satellite grid (C's own come from
// the native Shape). Boxes are the standard 4x4 2x2 tiling.
const satelliteGroups = GRIDS.slice(1).flatMap(g => {
  const at = (i, j) => cid(g.r0 + i, g.c0 + j);
  const rows = Array.from({ length: N }, (_, i) =>
    new AllDifferent(...Array.from({ length: N }, (_, j) => at(i, j))));
  const cols = Array.from({ length: N }, (_, j) =>
    new AllDifferent(...Array.from({ length: N }, (_, i) => at(i, j))));
  const boxes = [];
  for (let bi = 0; bi < 2; bi++)
    for (let bj = 0; bj < 2; bj++)
      boxes.push(new AllDifferent(
        at(2 * bi, 2 * bj), at(2 * bi, 2 * bj + 1),
        at(2 * bi + 1, 2 * bj), at(2 * bi + 1, 2 * bj + 1)));
  return [...rows, ...cols, ...boxes];
});

// Arrows: bulb cell first, then arm cells (canvas row,col on the 10x10 layout).
const arrows = [
  [[7, 3], [6, 4], [5, 5], [4, 6]],
  [[4, 5], [3, 6], [2, 7]],
  [[5, 10], [6, 9], [7, 8], [8, 7]],
  [[3, 4], [4, 3], [5, 2]],
  [[5, 3], [6, 2]],
  [[7, 5], [8, 4], [9, 3]],
  [[8, 5], [9, 4]],
].map(cells => new Arrow(...cells.map(([r, c]) => cid(r, c))));

return [
  new Shape('4x4'),
  ...vars.slice(1),
  ...satelliteGroups,
  ...arrows,
];
