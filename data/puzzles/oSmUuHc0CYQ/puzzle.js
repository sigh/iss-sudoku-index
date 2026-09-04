// Title: The Hardest 'Easy Puzzle' Ever
// Author: Sam Cappleman-Lynes
// Video: https://www.youtube.com/watch?v=oSmUuHc0CYQ
// Source: https://app.crackingthecryptic.com/sudoku/ddGfd499G7

// This is a Kakuro, not a Sudoku: place 1-9 in each white cell so that
// digits within an "entry" (an unobstructed horizontal or vertical run of
// white cells) do not repeat, and add up to the clued value when one is
// printed. Modeled on an 8x8 Raw grid (no rows/columns/boxes at all, since
// digits repeat freely outside an entry): each entry becomes a Cage --
// AllDifferent + Sum, or AllDifferent alone when no total is printed
// (Cage(0, ...) emits only the AllDifferent, per the solver's Cage
// handler). No length-2+ run here lacks a printed total, so every Cage
// below carries a real Sum; every length-1 run (a cell fully bordered by
// grey along one axis) contributes no entry in that axis at all, since a
// 1-cell AllDifferent/Sum is vacuous -- each such cell still gets a real
// Cage from its other axis.

// Grey (non-digit) cells: 1-indexed [row, col]. Row 1 and column 1 are the
// outer clue border; the rest are scattered interior clue cells. Read from
// the payload's 28 grey 1x1 underlays.
const GREY = [
  [1,1], [1,2], [1,3], [1,4], [1,5], [1,6], [1,7], [1,8],
  [2,1], [3,1], [4,1], [5,1], [6,1], [7,1], [8,1],
  [3,3], [4,5], [5,5], [6,5], [5,4], [5,6], [2,5], [3,7],
  [7,3], [7,7], [8,5], [5,8], [5,2],
];

// Clue overlays: each names a grey cell, a direction and its printed
// total. Read from the payload's 20 text overlays by pixel `center`
// offset within the cell -- a lower-row/left-column offset is the
// classic Kakuro "down" half of a split clue box, an upper-row/right-column
// offset is "across"; every one of the 20 overlays resolved to exactly one
// of those two positions.
const CLUES = [
  {row:1, col:2, dir:'down', total:15},
  {row:1, col:4, dir:'down', total:14},
  {row:1, col:6, dir:'down', total:12},
  {row:1, col:8, dir:'down', total:15},
  {row:5, col:4, dir:'down', total:12},
  {row:3, col:3, dir:'down', total:10},
  {row:5, col:6, dir:'down', total:10},
  {row:3, col:7, dir:'down', total:11},
  {row:5, col:8, dir:'down', total:11},
  {row:5, col:2, dir:'down', total:13},
  {row:2, col:1, dir:'across', total:15},
  {row:2, col:5, dir:'across', total:17},
  {row:8, col:1, dir:'across', total:17},
  {row:3, col:3, dir:'across', total:19},
  {row:6, col:5, dir:'across', total:19},
  {row:7, col:3, dir:'across', total:19},
  {row:4, col:1, dir:'across', total:16},
  {row:6, col:1, dir:'across', total:16},
  {row:8, col:5, dir:'across', total:15},
  {row:4, col:5, dir:'across', total:18},
];

const SIZE = 8;
const shape = new Shape(`${SIZE}x${SIZE}`, 9, 'Raw');

const isGrey = (r, c) =>
  r < 1 || r > SIZE || c < 1 || c > SIZE ||
  GREY.some(([gr, gc]) => gr === r && gc === c);

const clueTotal = (row, col, dir) => {
  const hit = CLUES.find(cl => cl.row === row && cl.col === col && cl.dir === dir);
  return hit ? hit.total : 0;
};

// Grey cells hold no digit. Pin each one so it contributes no free choice:
// a Raw grid enforces nothing implicitly, so an unpinned grey cell would
// range freely over 1-9 and multiply the measured solution count by 9 per
// cell, though it plays no part in the puzzle's own rule. One `Given` shape
// stamped over the whole grey-cell set via `Replicate` (a group-domain
// template, per the catalog) instead of 28 near-identical constraints.
const graph = cellGraph(shape);
const greyCells = GREY.map(([r, c]) => makeCellId(r, c));
const greyGivens = [graph.makeReplicate(new Given(graph.cells()[0], 1), greyCells)];

// Derive every entry as a maximal run of white cells along a row or column,
// matched to its clue (if any) by the grey cell immediately before it.
// Deriving from GREY instead of hand-listing the entries also recovers the
// run/no-run distinction directly from the grid layout.
const entries = [];

for (let r = 1; r <= SIZE; r++) {
  let c = 1;
  while (c <= SIZE) {
    if (isGrey(r, c)) { c++; continue; }
    const start = c;
    while (c <= SIZE && !isGrey(r, c)) c++;
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
    if (isGrey(r, c)) { r++; continue; }
    const start = r;
    while (r <= SIZE && !isGrey(r, c)) r++;
    if (r - start >= 2) {
      const cells = [];
      for (let rr = start; rr < r; rr++) cells.push(makeCellId(rr, c));
      entries.push({ cells, total: clueTotal(start - 1, c, 'down') });
    }
  }
}

const cages = entries.map(e => new Cage(e.total, ...e.cells));

return [shape, ...greyGivens, ...cages];
