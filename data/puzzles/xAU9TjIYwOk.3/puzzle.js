// Title: January 24, 2023: Teeny Tiny Thermos
// Author: clover!
// Video: https://www.youtube.com/watch?v=xAU9TjIYwOk
// Source: https://tinyurl.com/2s436uhh

// Five 4x4 sudoku grids (values 1-4) overlap on a 10x10 canvas: a central
// grid C and four satellites T/L/R/B, each sharing a 2-cell strip with C; no
// two satellites touch each other. Each grid independently needs
// all-different rows, columns and 2x2 boxes; a shared cell must satisfy both
// grids at once. Ten thermometers: digits strictly increase from the round
// bulb to the tip (repeats not required elsewhere on the arm beyond what the
// grids already forbid). Four dotted lines each join one satellite grid to
// an adjacent satellite, routed visually through the canvas cells outside
// every grid (which carry no digit); only the two drawn endpoints are real
// cells, and they must hold equal digits.
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
  { key: 'T', r0: 1, c0: 6 },
  { key: 'L', r0: 2, c0: 1 },
  { key: 'R', r0: 6, c0: 7 },
  { key: 'B', r0: 7, c0: 2 },
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

// Thermometers: bulb cell first, then arm cells (canvas row,col).
const thermos = [
  [[4, 5], [4, 4], [5, 4]],
  [[5, 7], [4, 7], [4, 6]],
  [[7, 6], [7, 7], [6, 7]],
  [[6, 4], [7, 4], [7, 5]],
  [[4, 2], [4, 1]],
  [[3, 3], [3, 4]],
  [[2, 7], [2, 6]],
  [[3, 8], [3, 9]],
  [[8, 8], [9, 7]],
  [[7, 10], [6, 9]],
].map(cells => new Thermo(...cells.map(([r, c]) => cid(r, c))));

// Dotted-line equal pairs: each line's drawn interior waypoints cross
// canvas cells outside every grid (no Var/board id, no digit), so only the
// two grid cells at its ends are encoded.
const equalPairs = [
  [[2, 2], [2, 6]],
  [[2, 9], [6, 9]],
  [[5, 2], [9, 2]],
  [[9, 9], [9, 5]],
].map(([[r1, c1], [r2, c2]]) =>
  new SameValues(2, cid(r1, c1), cid(r2, c2)));

return [
  new Shape('4x4'),
  ...vars.slice(1),
  ...satelliteGroups,
  ...thermos,
  ...equalPairs,
];
