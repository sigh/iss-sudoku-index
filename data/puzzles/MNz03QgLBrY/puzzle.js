// Title: Minutes to Solve?  Or Weeks?
// Author: Unknown
// Video: https://www.youtube.com/watch?v=MNz03QgLBrY
// Source: https://cracking-the-cryptic.web.app/sudoku/h8mqM936B8

// Star Battle (not a digit Sudoku): a 10x10 grid divided into four regions.
// Place stars so that:
// - every row and every column contains exactly two stars;
// - three of the regions contain exactly two stars each, and the fourth
//   contains exactly fourteen;
// - no two stars touch, even diagonally.
//
// The payload's `regions` array lists only three regions (14, 13 and 17
// cells); the fourth region is every other cell (56 cells), read as the
// remainder of the 10x10 canvas the three drawn regions do not cover.
// Region-to-count assignment is not stated by name -- it is forced by shape:
// each of the three drawn regions is a connected chain of width one (a
// snaking path), whose greedy no-two-touching maximum tops out at 6-7 cells,
// so none of them can physically hold 14 non-touching stars; only the much
// larger 56-cell remainder region can. That leaves exactly one consistent
// assignment (drawn regions -> 2 stars each, remainder -> 14), derived from
// the regions' own cell counts and adjacency, not from solving the puzzle.
//
// Model: a single Raw grid, values 1 (no star) / 2 (star), one flag per
// cell -- there is no separate digit layer since the puzzle has no digits at
// all. ContainExact states each row/column/region's exact star count in one
// call each; a king-move Pair (reused verbatim from the A7CPYMUnafw /
// u34CsZaZTdI Star Battle machinery) forbids two stars from touching.

const NOT_STAR = 1;
const STAR = 2;

const SHAPE = new Shape('10x10', '1-2', 'Raw');
const graph = cellGraph(SHAPE);
const gridCells = graph.cells();

// Drawn regions, cell coordinates (1-based row, col) transcribed from the
// puzzle's three explicit source regions (0-indexed pairs there, +1 here).
const regionA = [
  [1, 1], [2, 1], [3, 1], [4, 1], [5, 1], [6, 1], [7, 1], [8, 1], [9, 1],
  [10, 1], [10, 2], [10, 3], [10, 4], [10, 5],
].map(([row, col]) => makeCellId(row, col));

const regionB = [
  [9, 4], [9, 3], [9, 2], [8, 2], [7, 2], [6, 2], [5, 2], [4, 2], [3, 2],
  [5, 3], [5, 4], [6, 4], [7, 4],
].map(([row, col]) => makeCellId(row, col));

const regionC = [
  [6, 3], [7, 3], [8, 3], [8, 4], [8, 5], [7, 5], [7, 6], [8, 6], [9, 5],
  [9, 6], [10, 6], [10, 10], [10, 9], [9, 8], [10, 8], [9, 7], [10, 7],
].map(([row, col]) => makeCellId(row, col));

// Fourth region: every cell not in the three drawn regions (computed, not
// hand-transcribed).
const drawn = new Set([...regionA, ...regionB, ...regionC]);
const regionD = gridCells.filter(cell => !drawn.has(cell));

// Row/column: exactly two stars each.
const rowCounts = graph.rows().map(row => new ContainExact(`${STAR}_${STAR}`, ...row));
const colCounts = graph.columns().map(col => new ContainExact(`${STAR}_${STAR}`, ...col));

// Region star counts: two stars in each drawn region, fourteen in the
// remainder (see header note for why the assignment is forced).
const regionCounts = [
  new ContainExact(`${STAR}_${STAR}`, ...regionA),
  new ContainExact(`${STAR}_${STAR}`, ...regionB),
  new ContainExact(`${STAR}_${STAR}`, ...regionC),
  new ContainExact(Array(14).fill(STAR).join('_'), ...regionD),
];

// No two stars touch, even diagonally: a king-move Pair forbidding both
// cells of an adjacent pair from being STAR, applied once per relative
// offset via Replicate (direct reuse of the A7CPYMUnafw / u34CsZaZTdI
// Star Battle no-touch construction, adapted to run on the grid cells
// themselves rather than a separate flag overlay).
const noTouchKey = Pair.fnToKey((a, b) => !(a === STAR && b === STAR), SHAPE);
const seenTouch = new Set();
const noTouchPairs = [];
for (const cell of gridCells) {
  for (const nb of graph.kingNeighbours(cell)) {
    const key = [cell, nb].sort().join('_');
    if (seenTouch.has(key)) continue;
    seenTouch.add(key);
    noTouchPairs.push([cell, nb]);
  }
}
const noTouchSpecs = [
  { offset: [0, 1], template: ['R1C1', 'R1C2'], anchor: ([a]) => a },
  { offset: [1, -1], template: ['R1C2', 'R2C1'], anchor: ([a]) => graph.step(a, 0, -1) },
  { offset: [1, 0], template: ['R1C1', 'R2C1'], anchor: ([a]) => a },
  { offset: [1, 1], template: ['R1C1', 'R2C2'], anchor: ([a]) => a },
];
const noTouch = noTouchSpecs.map(({ offset: [dRow, dCol], template, anchor }) => {
  const pairs = noTouchPairs.filter(([a, b]) => {
    const from = parseCellId(a), to = parseCellId(b);
    return to.row - from.row === dRow && to.col - from.col === dCol;
  });
  const [origin, adjacent] = template;
  const constraint = new Pair(
    noTouchKey, 'Star Battle: no touch', origin, adjacent);
  return graph.makeReplicate(constraint, pairs.map(pair => anchor(pair)));
});

return [
  SHAPE,
  ...rowCounts,
  ...colCounts,
  ...regionCounts,
  ...noTouch,
];
