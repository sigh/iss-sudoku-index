// Title: Nanro
// Author: Myxo
// Video: https://www.youtube.com/watch?v=Q2qV2E0oTBg
// Source: https://app.crackingthecryptic.com/sudoku/8h2hhpg44r

// Rules encoded here, over the 9x12 grid (no Sudoku layer: rows, columns and
// boxes carry no implicit constraint, so the grid is Raw):
//
//  - A cell is "labelled" iff its board value is nonzero, and the number it
//    shows is that value; a blank cell holds 0.
//  - The labelled cells across the whole grid form exactly one orthogonally-
//    connected region, and no 2x2 block of cells is entirely labelled.
//  - REGIONS below is the wall-enclosed partition into 13 bold regions, read
//    from the drawn thick walls (the flood-filled layout, lettered A-M in
//    reading order). Every region must contain at least one labelled cell,
//    and every labelled cell in a region shows that region's own total
//    labelled-cell count.
//  - Where two labelled cells in different regions are orthogonally
//    adjacent, their numbers differ.
//
// Nothing is omitted.

// A region's count is tied to its labelled cells with a boolean overlay VB
// (1 iff the matching board cell is nonzero) and an EqualSum equating
// sum(VB over the region) with the region's own count Var VN<i>. Each VN<i>
// is restricted to 1..min(9, region size): a region cannot show a count
// above its own cell count, and the board's 0-9 alphabet bounds every
// reachable count at 9 regardless -- the printed givens are all single
// digits, so nothing here widens the grid past 0-9. VN's domain starting at
// 1 (never 0) is what forces "at least one labelled cell per region"; no
// separate constraint is needed for that clause.
const shape = new Shape('9x12', '0-9', 'Raw');
const graph = cellGraph(shape);
const labelled = graph.makeOverlay('VB');
const counts = new Var('VN', 'region counts', 13);

// --- Drawn data -------------------------------------------------------------

// The 13 wall-enclosed regions, read off the drawn thick walls (flood-filled
// partition; lettered A-M in reading order). Cells are [row, col] pairs,
// converted to cell IDs below with makeCellId -- columns run past 9, and
// hand-written 'R#C##' strings do not parse on this shape (cell IDs pack
// row/col into single base-17 characters, so column 11 is the character
// 'b', not the digits '11').
const REGION_COORDS = [
  [[2, 6], [3, 6], [3, 7], [3, 8], [3, 9], [4, 9], [5, 9], [5, 8], [5, 7], [5, 6], [5, 5], [6, 5], [4, 5], [6, 6], [7, 6], [7, 7], [8, 6], [6, 7], [4, 8], [4, 7], [3, 5], [4, 6]], // A (22)
  [[1, 8], [1, 9], [1, 10], [1, 11], [1, 12], [2, 12], [3, 12], [3, 11], [3, 10], [4, 11], [5, 11], [2, 11], [2, 10]], // B (13)
  [[1, 1], [1, 2], [1, 3], [1, 4], [1, 5], [1, 6], [1, 7], [2, 7], [2, 8], [2, 9], [2, 5], [2, 4]], // C (12)
  [[2, 1], [2, 2], [3, 2], [3, 3], [3, 4], [4, 3], [5, 3], [6, 3], [7, 3], [4, 2], [4, 1], [3, 1]], // D (12)
  [[4, 10], [5, 10], [6, 10], [6, 9], [6, 8], [7, 8], [8, 8], [8, 9], [8, 10], [8, 7], [7, 9], [7, 10]], // E (12)
  [[6, 2], [7, 2], [8, 2], [8, 3], [8, 4], [9, 4], [9, 5], [9, 6], [9, 7], [9, 8], [9, 3], [9, 2]], // F (12)
  [[7, 12], [8, 12], [8, 11], [9, 11], [9, 10], [9, 9], [9, 12]], // G (7)
  [[4, 4], [5, 4], [6, 4], [7, 4], [7, 5], [8, 5]], // H (6)
  [[5, 1], [5, 2], [6, 1], [7, 1], [8, 1], [9, 1]], // I (6)
  [[4, 12], [5, 12]], // J (2)
  [[6, 11], [7, 11]], // K (2)
  [[2, 3]], // L (1)
  [[6, 12]], // M (1)
];
const REGIONS = REGION_COORDS.map(
  cells => cells.map(([r, c]) => makeCellId(r, c)));

// The 9 printed givens, as [row, col, value].
const GIVEN_COORDS = [
  [1, 6, 9], [2, 11, 9], [3, 6, 4], [4, 2, 9], [7, 5, 4], [8, 10, 9],
  [9, 1, 3], [9, 6, 9], [9, 12, 3],
];
const GIVENS = new Map(
  GIVEN_COORDS.map(([r, c, v]) => [makeCellId(r, c), v]));

// --- Derived geometry --------------------------------------------------------

const cellToRegion = new Map();
REGIONS.forEach((cells, i) => cells.forEach(cell => cellToRegion.set(cell, i)));

const allCells = graph.cells();

// Every orthogonally adjacent cell pair, derived from the grid dimensions.
const adjacentPairs = [];
for (let r = 1; r <= 9; r++) {
  for (let c = 1; c <= 12; c++) {
    const a = makeCellId(r, c);
    if (c < 12) adjacentPairs.push([a, makeCellId(r, c + 1)]);
    if (r < 9) adjacentPairs.push([a, makeCellId(r + 1, c)]);
  }
}
// The subset that crosses a region boundary: where numbers must differ.
const crossBoundaryPairs = adjacentPairs.filter(
  ([a, b]) => cellToRegion.get(a) !== cellToRegion.get(b));

// Every 2x2 window, derived from the grid dimensions.
const windows = [];
for (let r = 1; r <= 8; r++) {
  for (let c = 1; c <= 11; c++) {
    windows.push([
      makeCellId(r, c), makeCellId(r, c + 1),
      makeCellId(r + 1, c), makeCellId(r + 1, c + 1),
    ]);
  }
}

// --- Cell domains ------------------------------------------------------------

const boardGivens = Array.from(
  GIVENS, ([cell, value]) => new Given(cell, value));

// VB is a plain boolean flag.
const boolDomain = labelled.makeReplicate(
  new Given(labelled.cells()[0], 0, 1), labelled.cells());

// VN<i> is restricted to 1..min(9, region size).
const countDomains = REGIONS.map((cells, i) => new Given(
  counts.cell(i + 1),
  ...Array.from({ length: Math.min(9, cells.length) }, (_, k) => k + 1)));

// --- Labelled <-> board value tie ---------------------------------------

// value === 0 iff flag === 0.
const labelledKey = Pair.fnToKey(
  (value, flag) => (value === 0) === (flag === 0), shape);
const labelledTies = allCells.map(
  cell => new Pair(labelledKey, 'labelled', cell, labelled.at(cell)));

// --- Connectivity and no-2x2 -------------------------------------------------

const connectivity = new ConnectedValues('', [1, 2, 3, 4, 5, 6, 7, 8, 9]);

const no2x2 = windows.map(([a, b, c, d]) => new Or([
  new Given(a, 0), new Given(b, 0), new Given(c, 0), new Given(d, 0),
]));

// --- Region count ties --------------------------------------------------

// Every cell in a region is either blank or shows the region's own count.
const cellTiesToCount = REGIONS.flatMap((cells, i) => cells.map(
  cell => new Or([
    new Given(cell, 0),
    new SameValues(2, cell, counts.cell(i + 1)),
  ])));

// The count equals the number of labelled cells in the region.
const regionCounts = REGIONS.map(
  (cells, i) => new EqualSum(labelled.at(cells), [counts.cell(i + 1)]));

// --- Cross-region adjacency ---------------------------------------------

const crossBoundaryDiffer = crossBoundaryPairs.map(([a, b]) => new Or([
  new Given(a, 0),
  new Given(b, 0),
  new AllDifferent(
    counts.cell(cellToRegion.get(a) + 1),
    counts.cell(cellToRegion.get(b) + 1)),
]));

return [
  shape,
  labelled.toVar('labelled flags'),
  counts,
  ...boardGivens,
  boolDomain,
  ...countDomains,
  ...labelledTies,
  connectivity,
  ...no2x2,
  ...cellTiesToCount,
  ...regionCounts,
  ...crossBoundaryDiffer,
];
