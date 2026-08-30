// Title: Gattai Another Day
// Author: Philip Newman
// Video: https://www.youtube.com/watch?v=xAU9TjIYwOk
// Source: https://tinyurl.com/mub7ue67

// Five 4x4 sudoku grids (values 1-4) overlap in a pinwheel: a central grid C
// shares a 2-cell strip with each satellite grid T/L/R/B; no two satellites
// touch each other. Each grid independently needs all-different rows,
// columns and 2x2 boxes; a shared cell must satisfy both grids at once.
// Along each line, every 2x2 box the line passes through has the same sum
// (a region sum line); a line that revisits a box sums that visit
// separately from its other visits.
//
// C is the native ISS board (Shape('4x4')); it gets its rows/cols/boxes for
// free from the default Sudoku grid type. T/L/R/B are not real board cells:
// each contributes a 14-cell Var group for the cells it does not share with
// C, and its own row/column/box AllDifferent groups are built by hand over a
// mix of C's real cell ids and its own Var ids. GRIDS is listed C-first so a
// shared cell (found in both C's and a satellite's box) resolves to C's real
// id, never a Var.

const GRIDS = [
  { key: 'C', r0: 4, c0: 4 },
  { key: 'T', r0: 1, c0: 2 },
  { key: 'R', r0: 2, c0: 7 },
  { key: 'L', r0: 6, c0: 1 },
  { key: 'B', r0: 7, c0: 6 },
];
const N = 4;
const key = (r, c) => `${r},${c}`;
const gridsContaining = (r, c) =>
  GRIDS.filter(g => r >= g.r0 && r < g.r0 + N && c >= g.c0 && c < g.c0 + N);
const ownerIndex = (r, c) => GRIDS.findIndex(g => gridsContaining(r, c).includes(g));

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

// Region sum lines: each drawn line's cells (canvas row,col), in stroke
// order, from the payload's line clues. A cell in the 2-cell overlap strip
// belongs to a 2x2 box in each of its two grids at once, so a line only
// crosses a box boundary where it leaves EVERY box shared by the two
// consecutive cells -- computed below from the same box tiling as the
// row/column/box groups above, not asserted by hand.
const lineCells = [
  [[1, 4], [2, 4], [3, 3], [4, 3], [5, 4]],
  [[2, 3], [2, 2], [3, 2]],
  [[2, 5], [3, 5], [3, 4]],
  [[3, 8], [3, 7], [4, 6]],
  [[3, 9], [4, 8]],
  [[6, 1], [7, 2], [7, 3]],
  [[7, 4], [8, 3], [9, 2]],
  [[7, 7], [7, 8], [8, 9]],
  [[8, 7], [9, 8]],
];
const boxKeysOf = (r, c) => gridsContaining(r, c).map(g =>
  `${g.key}-${Math.floor((r - g.r0) / 2)}-${Math.floor((c - g.c0) / 2)}`);
const shareBox = (a, b) => {
  const kb = boxKeysOf(...b);
  return boxKeysOf(...a).some(k => kb.includes(k));
};
const regionSumLines = lineCells.map(cells => {
  const segments = [[cells[0]]];
  for (let i = 1; i < cells.length; i++) {
    if (shareBox(cells[i - 1], cells[i])) segments[segments.length - 1].push(cells[i]);
    else segments.push([cells[i]]);
  }
  return new EqualSum(...segments.map(seg => seg.map(([r, c]) => cid(r, c))));
});

return [
  new Shape('4x4'),
  ...vars.slice(1),
  ...satelliteGroups,
  ...regionSumLines,
];
