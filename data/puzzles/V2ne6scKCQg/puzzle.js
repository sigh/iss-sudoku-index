// Title: unknown
// Author: Unknown
// Video: https://www.youtube.com/watch?v=V2ne6scKCQg
// Source: https://cracking-the-cryptic.web.app/sudoku/QDnJ2QhNm2

// The board is a shading of a 10x10 grid divided by drawn borders into 19
// regions. Rules encoded below:
//   1. Each region contains exactly one stone: a non-empty, orthogonally
//      connected mass of shaded cells lying inside that region.
//   2. Stones of different regions may not share a side; they may touch at
//      corners.
//   3. A region carrying a printed number has exactly that many shaded cells.
//   4. Half the cells of every column (5 of 10) are shaded.
// Not encoded: "If dropped, stones will stack in the bottom half of the grid,
// completely filling it. Stones will remain intact, keeping their shape, and
// will not rotate." Stones fall straight down, so that rule forces each column
// to hold exactly the 5 shaded cells needed to fill its half -- which rule 4
// states on its own and which is encoded -- but the further condition, that the
// 19 stone shapes actually stack without gaps or overlaps, is not.

// Values: 1 is an unshaded cell and every other value is a shaded cell carrying
// a code that says which region's stone the cell belongs to. Codes 2..15 label
// the 14 regions whose stone needs an explicit connectivity constraint; code 16
// is shared by the 5 regions where no such constraint is needed (see below), so
// no two of them ever need telling apart.
const shape = new Shape('10x10', 16, 'Raw');
const graph = cellGraph(shape);

const UNSHADED = 1;
const SHARED_SHADED = 16;
const SHADED_PER_COLUMN = 5;  // half of the 10 cells in a column

// The 19 areas the drawn region borders enclose, each with the number printed
// in its corner (null where none is printed), as [row, col] pairs.
const REGIONS = [
  { clue: 2, cells: [[1, 1], [1, 2], [1, 3], [2, 1], [2, 2], [2, 3], [3, 1], [4, 1]] },
  { clue: 2, cells: [[1, 4], [1, 5], [2, 4]] },
  { clue: 2, cells: [[1, 6], [2, 5], [2, 6]] },
  { clue: null, cells: [[1, 7], [1, 8], [1, 9], [1, 10], [2, 7], [2, 8]] },
  { clue: 4, cells: [[2, 9], [2, 10], [3, 9], [3, 10], [4, 9], [4, 10], [5, 9]] },
  { clue: 3, cells: [[3, 2], [3, 3], [4, 3]] },
  { clue: null, cells: [[3, 4], [4, 2], [4, 4], [5, 1], [5, 2], [5, 3], [5, 4], [6, 1], [6, 2], [6, 3], [6, 4], [6, 5], [7, 1], [7, 2], [7, 3], [7, 4]] },
  { clue: 4, cells: [[3, 5], [4, 5], [4, 7], [5, 5], [5, 6], [5, 7]] },
  { clue: null, cells: [[3, 6], [3, 7], [3, 8], [4, 6]] },
  { clue: null, cells: [[4, 8], [5, 8]] },
  { clue: null, cells: [[5, 10], [6, 10], [7, 10], [8, 10], [9, 9], [9, 10], [10, 9], [10, 10]] },
  { clue: null, cells: [[6, 6], [6, 7], [6, 8], [7, 6], [7, 7], [7, 8], [8, 5], [8, 6], [8, 7], [8, 8], [8, 9]] },
  { clue: null, cells: [[6, 9], [7, 9]] },
  { clue: null, cells: [[7, 5]] },
  { clue: 3, cells: [[8, 1], [8, 2], [9, 1], [9, 2]] },
  { clue: null, cells: [[8, 3], [8, 4], [9, 3], [9, 4], [9, 5]] },
  { clue: 2, cells: [[9, 6], [9, 7], [10, 4], [10, 5], [10, 6], [10, 7]] },
  { clue: null, cells: [[9, 8], [10, 8]] },
  { clue: 2, cells: [[10, 1], [10, 2], [10, 3]] },
];

// A region's stone is connected whatever it turns out to be -- so it needs no
// connectivity constraint and no label of its own -- when the region holds at
// most two cells, or when its clue shades the whole region (which is drawn
// connected). Every other region takes the next code.
const needsOwnCode = (region) =>
  region.cells.length > 2 && region.clue !== region.cells.length;

let nextCode = UNSHADED + 1;
const regions = REGIONS.map((region) => ({
  clue: region.clue,
  cells: region.cells.map(([row, col]) => makeCellId(row, col)),
  code: needsOwnCode(region) ? nextCode++ : SHARED_SHADED,
}));

const regionOf = new Map();
for (const region of regions) {
  for (const cell of region.cells) regionOf.set(cell, region);
}

// Every cell is either unshaded or shaded as part of its own region's stone.
const shading = regions.flatMap(
  (region) => region.cells.map(
    (cell) => new Given(cell, UNSHADED, region.code)));

// Rule 1. ConnectedValues asks for a single non-empty connected group of cells
// holding the code, and only the region's own cells may hold it, so it says
// exactly "this region's shaded cells are one stone". Where the code is shared
// the same demand reduces to "at least one cell is shaded", except in the one
// region whose clue already shades all of it.
const stones = regions.flatMap((region) => {
  if (region.code !== SHARED_SHADED) return [new ConnectedValues('', region.code)];
  if (region.clue === region.cells.length) return [];
  return [new ContainAtLeast(String(SHARED_SHADED), ...region.cells)];
});

// Rule 2: no two orthogonally adjacent cells in different regions are both
// shaded, i.e. at least one of the pair is unshaded.
const separated = graph.cells().flatMap(
  (cell) => [graph.step(cell, 0, 1), graph.step(cell, 1, 0)]
    .filter((other) => other && regionOf.get(other) !== regionOf.get(cell))
    .map((other) => new ContainAtLeast(String(UNSHADED), cell, other)));

// Rule 3.
const counts = regions.filter((region) => region.clue !== null).map(
  (region) => new ContainExact(
    Array(region.clue).fill(region.code).join('_'), ...region.cells));

// Rule 4, as the complementary count: 5 of each column's cells are unshaded.
const columns = graph.columns().map(
  (cells) => new ContainExact(
    Array(SHADED_PER_COLUMN).fill(UNSHADED).join('_'), ...cells));

return [shape, ...shading, ...stones, ...separated, ...counts, ...columns];
