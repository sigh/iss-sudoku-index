// Title: Gattai Another Day
// Author: Philip Newman
// Video: https://www.youtube.com/watch?v=xAU9TjIYwOk
// Source: https://tinyurl.com/mub7ue67
//
// Five 4x4 grids fused Gattai-style: normal 4x4 sudoku rules (rows, columns,
// 2x2 boxes) apply within each grid; a cell shared by two grids must satisfy
// both. Grid extents and overlaps below were derived from the puzzle's
// shaded center grid and its drawn corner brackets marking each overlap
// boundary; every extent is cross-checked against every drawn line's cells
// and against the five extents tiling the puzzle's 10x10 canvas exactly,
// with no gaps and no extra overlaps. There are no givens.
// Along each drawn line, digits must have the same sum in every box the line
// passes through; each line below is split into its per-box runs and given
// one EqualSum.

const GRIDS = [
  // name, r0, c0: 1-indexed R/C of the grid's top-left cell; every grid is 4x4.
  { name: 'C', r0: 4, c0: 4 },   // shaded center grid
  { name: 'TL', r0: 1, c0: 2 },  // overlaps C at R4C4-R4C5 (drawn corner brackets)
  { name: 'TR', r0: 2, c0: 7 },  // overlaps C at R4C7-R5C7
  { name: 'BL', r0: 6, c0: 1 },  // overlaps C at R6C4-R7C4
  { name: 'BR', r0: 7, c0: 6 },  // overlaps C at R7C6-R7C7
];
const N = 4;
const BOARD = 10;
const id = (r, c) => makeCellId(r, c); // r,c 1-indexed

const inGrid = (g, r, c) => r >= g.r0 && r < g.r0 + N && c >= g.c0 && c < g.c0 + N;
const gridsOf = (r, c) => GRIDS.filter(g => inGrid(g, r, c));

// Row/column/box AllDifferent groups, once per grid. An overlap cell is one
// shared board cell referenced by two grids' groups, which is exactly how
// Gattai overlap works.
const groups = GRIDS.flatMap(g => {
  const cellAt = (i, j) => id(g.r0 + i, g.c0 + j);
  const rows = Array.from({ length: N }, (_, i) =>
    new AllDifferent(...Array.from({ length: N }, (_, j) => cellAt(i, j))));
  const cols = Array.from({ length: N }, (_, j) =>
    new AllDifferent(...Array.from({ length: N }, (_, i) => cellAt(i, j))));
  const boxes = [];
  for (let bi = 0; bi < N; bi += 2)
    for (let bj = 0; bj < N; bj += 2)
      boxes.push(new AllDifferent(
        cellAt(bi, bj), cellAt(bi, bj + 1), cellAt(bi + 1, bj), cellAt(bi + 1, bj + 1)));
  return [...rows, ...cols, ...boxes];
});

// The five grids tile only part of the 10x10 bounding canvas; the remainder
// is outside every grid (empty canvas around the pinwheel of grids) and is
// pinned to a fixed value so the Raw grid's free digit there cannot inflate
// the solution count.
const used = new Set();
for (const g of GRIDS)
  for (let i = 0; i < N; i++)
    for (let j = 0; j < N; j++)
      used.add(id(g.r0 + i, g.c0 + j));
const deadPins = [];
for (let r = 1; r <= BOARD; r++)
  for (let c = 1; c <= BOARD; c++) {
    const cell = id(r, c);
    if (!used.has(cell)) deadPins.push(new Given(cell, 1));
  }

// The puzzle's drawn same-sum lines, transcribed as their 1-indexed R/C cell
// paths in drawn order (each is a separate stroke, reassembled from the
// payload's per-segment point pairs by shared endpoints).
const LINES = [
  [[1, 4], [2, 4], [3, 3], [4, 3], [5, 4]],
  [[3, 2], [2, 2], [2, 3]],
  [[3, 4], [3, 5], [2, 5]],
  [[4, 6], [3, 7], [3, 8]],
  [[3, 9], [4, 8]],
  [[7, 7], [7, 8], [8, 9]],
  [[8, 7], [9, 8]],
  [[6, 1], [7, 2], [7, 3]],
  [[7, 4], [8, 3], [9, 2]],
];

// Split each line into runs that share one box. A cell in a two-grid overlap
// has a box in each grid; either choice settles the split here, because each
// such cell's line-neighbours are outside that overlap and so never share a
// box under the other reading (checked for both overlap cells this puzzle's
// lines touch, R7C7 and R7C4).
const boxKey = (g, r, c) => `${g.name}:${Math.floor((r - g.r0) / 2)},${Math.floor((c - g.c0) / 2)}`;
const sameSumLines = LINES.map(path => {
  const segments = [];
  let cur = [], curKey = null;
  for (const [r, c] of path) {
    const owners = gridsOf(r, c);
    const g = owners.find(o => o.name !== 'C') || owners[0];
    const key = boxKey(g, r, c);
    if (key !== curKey) {
      if (cur.length) segments.push(cur);
      cur = [];
      curKey = key;
    }
    cur.push(id(r, c));
  }
  if (cur.length) segments.push(cur);
  return new EqualSum(...segments);
});

return [
  new Shape('10x10', '1-4', 'Raw'),
  ...groups,
  ...deadPins,
  ...sameSumLines,
];
