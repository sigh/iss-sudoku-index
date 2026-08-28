// Title: 1/27/23: I'm Your Little Samurai
// Author: clover!
// Video: https://www.youtube.com/watch?v=xAU9TjIYwOk
// Source: https://tinyurl.com/578c6kf5

// Five 4x4 sudoku grids (values 1-4) overlap on a 10x10 canvas: a central
// grid C and four corner satellites TL/TR/BL/BR, each sharing exactly one
// cell (a 2x2-box corner) with C; no two satellites touch each other or
// share a cell with each other. Each grid independently needs all-different
// rows, columns and 2x2 boxes; a shared cell must satisfy both grids at
// once. Digits joined by a white dot must be consecutive; not every
// possible dot is drawn.
//
// C is the native ISS board (Shape('4x4')); it gets its rows/cols/boxes for
// free from the default Sudoku grid type. TL/TR/BL/BR are not real board
// cells: each contributes a 15-cell Var group for the cells it does not
// share with C, and its own row/column/box AllDifferent groups are built by
// hand over a mix of C's real cell ids and its own Var ids. GRIDS is listed
// C-first so a shared cell (found in both C's and a satellite's box)
// resolves to C's real id, never a Var.

const GRIDS = [
  { key: 'C', r0: 4, c0: 4 },
  { key: 'TL', r0: 1, c0: 1 },
  { key: 'TR', r0: 1, c0: 7 },
  { key: 'BL', r0: 7, c0: 1 },
  { key: 'BR', r0: 7, c0: 7 },
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

const shape = new Shape('4x4');
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

// Givens (source: payload cells array). Both given cells fall in a
// satellite-only region (not shared with C), so each pins a Var cell.
const givens = [
  new Given(cid(1, 3), 2),
  new Given(cid(10, 8), 3),
];

// White dots: consecutive digits between the two named cells (source:
// overlay circle glyphs, each straddling the shared edge of two
// orthogonally-adjacent cells). A plain Pair is used for every dot, not
// WhiteDot: most pairs bind at least one count-only Var cell, and
// WhiteDot's board-adjacency check only resolves native board cells or Var
// cells from a group with a declared rectangular shape -- neither holds
// here, so the whole group is encoded the same way rather than splitting it
// by which pairs happen to land on real board cells.
const consecutiveKey = Pair.fnToKey((a, b) => Math.abs(a - b) === 1, shape);
const dotPairs = [
  [[1, 2], [2, 2]], [[1, 9], [2, 9]], [[2, 2], [3, 2]], [[3, 8], [4, 8]],
  [[4, 7], [5, 7]], [[5, 4], [6, 4]], [[5, 7], [6, 7]], [[6, 4], [7, 4]],
  [[7, 2], [8, 2]], [[8, 1], [9, 1]], [[8, 9], [9, 9]], [[9, 4], [10, 4]],
  [[9, 9], [10, 9]],
  [[1, 2], [1, 3]], [[1, 3], [1, 4]], [[2, 7], [2, 8]], [[2, 8], [2, 9]],
  [[3, 8], [3, 9]], [[3, 9], [3, 10]], [[7, 2], [7, 3]], [[8, 1], [8, 2]],
  [[10, 3], [10, 4]], [[10, 7], [10, 8]], [[10, 8], [10, 9]],
];
const whiteDots = dotPairs.map(([[r1, c1], [r2, c2]]) =>
  new Pair(consecutiveKey, `white dot R${r1}C${c1}-R${r2}C${c2}`, cid(r1, c1), cid(r2, c2)));

return [
  shape,
  ...vars.slice(1),
  ...satelliteGroups,
  ...givens,
  ...whiteDots,
];
