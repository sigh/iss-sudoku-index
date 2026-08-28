// Title: Serial Killer Gattai
// Author: Bill Murphy
// Video: https://www.youtube.com/watch?v=xAU9TjIYwOk
// Source: https://tinyurl.com/yckazcjz

// Five 4x4 sudoku grids (values 1-4) overlap in a pinwheel: a central grid C
// shares a 1x3 strip of cells with each satellite grid T/L/R/B; no two
// satellites touch each other. Each grid independently needs all-different
// rows, columns and 2x2 boxes; a shared cell must satisfy both grids at once.
// Cages: digits sum to the printed total and the cage must contain at least
// one repeated digit (repeats may occur more than once, and more than one
// pair may repeat, so long as no other sudoku rule breaks). This overrides
// the payload's per-cage "unique" flag, which is left over from a normal-
// cage default and contradicts the rules text.
//
// C is the native ISS board (Shape('4x4')); it gets its rows/cols/boxes for
// free from the default Sudoku grid type. T/L/R/B are not real board cells:
// each contributes a cell-count Var group for the cells it does not share
// with C, and its own row/column/box AllDifferent groups are built by hand
// over a mix of C's real cell ids and its own Var ids. GRIDS is listed
// C-first so a shared cell (found in both C's and a satellite's box)
// resolves to C's real id, never a Var.

const GRIDS = [
  { key: 'C', r0: 4, c0: 4 },
  { key: 'T', r0: 1, c0: 5 },
  { key: 'L', r0: 3, c0: 1 },
  { key: 'R', r0: 5, c0: 7 },
  { key: 'B', r0: 7, c0: 3 },
];
const N = 4;
const key = (r, c) => `${r},${c}`;
const owners = (r, c) => GRIDS
  .map((g, i) => (r >= g.r0 && r < g.r0 + N && c >= g.c0 && c < g.c0 + N) ? i : -1)
  .filter(i => i >= 0);
const ownerIndex = (r, c) => owners(r, c)[0];

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

// Cages: canvas row/col cell lists and totals, transcribed from the six
// printed cage totals (each cage's total is printed at its top-left cell,
// e.g. 14 for the cage at R4C2). An invisible, no-total cage spanning
// R1C1/R10C10 -- two cells outside every grid -- is a decorative
// canvas-sizing artifact, not a clue, and is omitted.
const cages = [
  { total: 14, cells: [[4, 2], [4, 3], [5, 2], [5, 3]] },
  { total: 7, cells: [[2, 6], [2, 7], [3, 7]] },
  { total: 7, cells: [[3, 4], [3, 5], [4, 5]] },
  { total: 8, cells: [[8, 4], [9, 4], [9, 5]] },
  { total: 7, cells: [[7, 6], [8, 6], [8, 7]] },
  { total: 6, cells: [[6, 8], [6, 9], [7, 8], [7, 9]] },
];

// A pair of cells in a cage is forced distinct only if some one grid
// contains both cells and places them in the same row, column or 2x2 box of
// that grid; cells with no grid in common, or in different rows/cols/boxes
// of every grid they share, are free to hold the same digit. "At least one
// repeat" is then an Or over exactly the pairs that are not forced distinct.
const boxOf = (g, r, c) => [Math.floor((r - g.r0) / 2), Math.floor((c - g.c0) / 2)];
const forcedDistinct = ([ra, ca], [rb, cb]) =>
  owners(ra, ca).some(i => {
    if (!owners(rb, cb).includes(i)) return false;
    if (ra === rb || ca === cb) return true;
    const g = GRIDS[i];
    const [bra, bca] = boxOf(g, ra, ca), [brb, bcb] = boxOf(g, rb, cb);
    return bra === brb && bca === bcb;
  });

const cageConstraints = cages.flatMap(({ total, cells }) => {
  const repeatPairs = [];
  for (let i = 0; i < cells.length; i++)
    for (let j = i + 1; j < cells.length; j++)
      if (!forcedDistinct(cells[i], cells[j])) repeatPairs.push([cells[i], cells[j]]);
  return [
    new Sum(total, ...cells.map(([r, c]) => cid(r, c))),
    new Or(repeatPairs.map(([a, b]) => new SameValues(2, cid(...a), cid(...b)))),
  ];
});

return [
  new Shape('4x4'),
  ...vars.slice(1),
  ...satelliteGroups,
  ...cageConstraints,
];
