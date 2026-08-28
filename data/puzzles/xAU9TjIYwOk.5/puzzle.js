// Title: Serial Killer Gattai
// Author: Bill Murphy
// Video: https://www.youtube.com/watch?v=xAU9TjIYwOk
// Source: https://tinyurl.com/32np496p
//
// Five 4x4 sudoku grids (digits 1-4) sit on one 10x10 canvas in a pinwheel: a
// central grid plus a Top, Right, Bottom, and Left arm, each sharing exactly
// one row or column with the central grid ("normal 4x4 gattai rules": cells
// two grids share must obey sudoku rules for both). Grid extents below were
// derived from the puzzle's own box-divider walls (thickness-5.1 lines) and
// cross-checked against the drawn pinwheel outline, which they reproduce
// exactly.
//
// The grid uses the Raw type, so no cell gets an implicit row/column/box
// rule; every grid's own rows, columns, and four 2x2 boxes are stated
// explicitly. Cells outside all five grids (the pinwheel's four corner
// voids) are not part of the puzzle -- they are pinned to a fixed value so
// they add no free multiplicity to the solution count.
//
// Cages: digits sum to the printed total and the cage must contain at least
// one repeated digit (repeats beyond one pair are allowed) -- encoded as
// Sum(total) plus Or(SameValues) over every cell pair in the cage.

const GRIDS = [
  { name: 'Central', r0: 4, c0: 4 },
  { name: 'Top', r0: 1, c0: 5 },
  { name: 'Right', r0: 5, c0: 7 },
  { name: 'Bottom', r0: 7, c0: 3 },
  { name: 'Left', r0: 3, c0: 1 },
];

const id = (r, c) => makeCellId(r, c);
const cellsOf = (r0, c0) => {
  const out = [];
  for (let i = 0; i < 4; i++) for (let j = 0; j < 4; j++) out.push([r0 + i, c0 + j]);
  return out;
};

const gridGroups = GRIDS.flatMap(({ r0, c0 }) => {
  const rows = Array.from({ length: 4 }, (_, i) =>
    new AllDifferent(...Array.from({ length: 4 }, (_, j) => id(r0 + i, c0 + j))));
  const cols = Array.from({ length: 4 }, (_, j) =>
    new AllDifferent(...Array.from({ length: 4 }, (_, i) => id(r0 + i, c0 + j))));
  const boxOffsets = [[0, 0], [0, 2], [2, 0], [2, 2]];
  const boxes = boxOffsets.map(([di, dj]) => new AllDifferent(
    id(r0 + di, c0 + dj), id(r0 + di, c0 + dj + 1),
    id(r0 + di + 1, c0 + dj), id(r0 + di + 1, c0 + dj + 1)));
  return [...rows, ...cols, ...boxes];
});

// Cells covered by at least one of the five grids; everything else is void.
const covered = new Set();
for (const { r0, c0 } of GRIDS) for (const [r, c] of cellsOf(r0, c0)) covered.add(`${r},${c}`);
const voidGivens = [];
for (let r = 1; r <= 10; r++)
  for (let c = 1; c <= 10; c++)
    if (!covered.has(`${r},${c}`)) voidGivens.push(new Given(id(r, c), 1));

// Cage cells and totals, transcribed from the payload's `cages` array
// (cageValue "r#c#=T" gives the total; a corner-to-corner hidden entry with
// no total is rendering scaffolding, not a real cage, and is omitted).
const CAGES = [
  [14, [4, 2], [4, 3], [5, 2], [5, 3]],
  [7, [2, 6], [2, 7], [3, 7]],
  [7, [3, 4], [3, 5], [4, 5]],
  [8, [8, 4], [9, 4], [9, 5]],
  [7, [7, 6], [8, 6], [8, 7]],
  [6, [6, 8], [6, 9], [7, 8], [7, 9]],
];

const cageConstraints = CAGES.flatMap(([total, ...cells]) => {
  const ids = cells.map(([r, c]) => id(r, c));
  const pairs = [];
  for (let i = 0; i < ids.length; i++)
    for (let j = i + 1; j < ids.length; j++) pairs.push(new SameValues(2, ids[i], ids[j]));
  return [new Sum(total, ...ids), new Or(pairs)];
});

return [
  new Shape('10x10', 4, 'Raw'),
  ...gridGroups,
  ...voidGivens,
  ...cageConstraints,
];
