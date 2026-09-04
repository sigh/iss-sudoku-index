// Title: Plaza
// Author: PixelPlucker
// Video: https://www.youtube.com/watch?v=8RfTZ-eAA-M
// Source: https://app.crackingthecryptic.com/sudoku/6dBPGMMf8r

// This is a Kakuro, not a Sudoku: place 1-9 in each white cell so that
// digits within an "entry" (an unobstructed horizontal or vertical run of
// white cells) do not repeat, and add up to the clued value when one is
// printed. Modeled on a 13x13 Raw grid (no rows/columns/boxes at all,
// since digits repeat freely outside an entry): each entry becomes a Cage
// -- AllDifferent + Sum, or AllDifferent alone when no total is printed
// (Cage(0, ...) emits only the AllDifferent, per the solver's Cage handler).

// Black (blocked) cells: 1-indexed [row, col], read from the payload's
// 65 black 1x1 underlays.
const BLACK = [
  [1,1], [1,2], [1,3], [1,4], [1,5], [1,6], [1,7], [1,8],
  [1,9], [1,10], [1,11], [1,12], [1,13], [2,1], [2,2], [2,6],
  [2,7], [2,8], [2,9], [2,13], [3,1], [3,7], [3,8], [4,1],
  [4,4], [4,11], [5,1], [5,6], [6,1], [6,2], [6,5], [6,9],
  [6,13], [7,1], [7,2], [7,3], [7,8], [7,12], [7,13], [8,1],
  [8,2], [8,3], [8,7], [8,12], [8,13], [9,1], [9,2], [9,6],
  [9,10], [9,13], [10,1], [10,9], [11,1], [11,4], [11,11], [12,1],
  [12,7], [12,8], [13,1], [13,2], [13,6], [13,7], [13,8], [13,9],
  [13,13],
];

// Clue overlays: each names the black cell immediately before an entry, its
// direction and printed total. Read from the payload's 54 text overlays by
// sub-cell position -- a top-right placement (col-fraction > .5, row-fraction
// < .5) is the classic Kakuro "across" half of a split clue box, bottom-left
// (col-fraction < .5, row-fraction > .5) is "down"; every one of the 54
// overlays resolved to exactly one of those two positions.
const CLUES = [
  {row:1, col:3, dir:'down', total:34},
  {row:1, col:4, dir:'down', total:11},
  {row:1, col:5, dir:'down', total:12},
  {row:1, col:10, dir:'down', total:33},
  {row:1, col:11, dir:'down', total:13},
  {row:1, col:12, dir:'down', total:23},
  {row:2, col:2, dir:'across', total:22},
  {row:2, col:2, dir:'down', total:21},
  {row:2, col:6, dir:'down', total:13},
  {row:2, col:9, dir:'across', total:20},
  {row:2, col:9, dir:'down', total:13},
  {row:2, col:13, dir:'down', total:21},
  {row:3, col:1, dir:'across', total:20},
  {row:3, col:7, dir:'down', total:22},
  {row:3, col:8, dir:'across', total:21},
  {row:3, col:8, dir:'down', total:13},
  {row:4, col:1, dir:'across', total:10},
  {row:4, col:4, dir:'across', total:23},
  {row:4, col:4, dir:'down', total:33},
  {row:4, col:11, dir:'across', total:11},
  {row:4, col:11, dir:'down', total:33},
  {row:5, col:1, dir:'across', total:20},
  {row:5, col:6, dir:'across', total:30},
  {row:5, col:6, dir:'down', total:20},
  {row:6, col:2, dir:'across', total:12},
  {row:6, col:5, dir:'across', total:21},
  {row:6, col:5, dir:'down', total:31},
  {row:6, col:9, dir:'across', total:21},
  {row:6, col:9, dir:'down', total:11},
  {row:7, col:3, dir:'across', total:13},
  {row:7, col:8, dir:'across', total:21},
  {row:7, col:8, dir:'down', total:20},
  {row:8, col:3, dir:'across', total:14},
  {row:8, col:7, dir:'across', total:22},
  {row:8, col:7, dir:'down', total:11},
  {row:8, col:12, dir:'down', total:32},
  {row:9, col:2, dir:'across', total:14},
  {row:9, col:6, dir:'across', total:21},
  {row:9, col:6, dir:'down', total:14},
  {row:9, col:10, dir:'across', total:10},
  {row:9, col:10, dir:'down', total:14},
  {row:9, col:13, dir:'down', total:13},
  {row:10, col:1, dir:'across', total:40},
  {row:10, col:9, dir:'across', total:14},
  {row:10, col:9, dir:'down', total:12},
  {row:11, col:1, dir:'across', total:12},
  {row:11, col:4, dir:'across', total:33},
  {row:11, col:4, dir:'down', total:13},
  {row:11, col:11, dir:'across', total:11},
  {row:11, col:11, dir:'down', total:11},
  {row:12, col:1, dir:'across', total:32},
  {row:12, col:8, dir:'across', total:31},
  {row:13, col:2, dir:'across', total:20},
  {row:13, col:9, dir:'across', total:11},
];

const SIZE = 13;
const shape = new Shape(`${SIZE}x${SIZE}`, 9, 'Raw');

const isBlack = (r, c) =>
  r < 1 || r > SIZE || c < 1 || c > SIZE ||
  BLACK.some(([br, bc]) => br === r && bc === c);

const clueTotal = (row, col, dir) => {
  const hit = CLUES.find(cl => cl.row === row && cl.col === col && cl.dir === dir);
  return hit ? hit.total : 0;
};

// Black cells hold no digit. Pin each one so it contributes no free choice:
// a Raw grid enforces nothing implicitly, so an unpinned black cell would
// range freely over 1-9 and multiply the measured solution count by 9 per
// cell, though it plays no part in the puzzle's own rule. One `Given` shape
// stamped over the whole black-cell set via `Replicate` (a group-domain
// template, per the catalog) instead of 65 near-identical constraints.
const graph = cellGraph(shape);
const blackCells = BLACK.map(([r, c]) => makeCellId(r, c));
const blackGivens = [graph.makeReplicate(new Given(graph.cells()[0], 1), blackCells)];

// Derive every entry as a maximal run of white cells along a row or column,
// matched to its clue (if any) by the black cell immediately before it.
// Deriving from BLACK instead of hand-listing the 56 entries also recovers
// the two down-entries the payload prints with no total.
const entries = [];

for (let r = 1; r <= SIZE; r++) {
  let c = 1;
  while (c <= SIZE) {
    if (isBlack(r, c)) { c++; continue; }
    const start = c;
    while (c <= SIZE && !isBlack(r, c)) c++;
    if (c - start >= 2) {
      const cells = [];
      for (let cc = start; cc < c; cc++) cells.push(makeCellId(r, cc));
      entries.push({ cells, total: clueTotal(r, start - 1, 'across') });
    }
  }
}

for (let c = 1; c <= SIZE; c++) {
  let r = 1;
  while (r <= SIZE) {
    if (isBlack(r, c)) { r++; continue; }
    const start = r;
    while (r <= SIZE && !isBlack(r, c)) r++;
    if (r - start >= 2) {
      const cells = [];
      for (let rr = start; rr < r; rr++) cells.push(makeCellId(rr, c));
      entries.push({ cells, total: clueTotal(start - 1, c, 'down') });
    }
  }
}

const cages = entries.map(e => new Cage(e.total, ...e.cells));

return [shape, ...blackGivens, ...cages];
