// Title: Unknown
// Author: Unknown
// Video: https://www.youtube.com/watch?v=V2ne6scKCQg
// Source: https://cracking-the-cryptic.web.app/sudoku/QDnJ2QhNm2

// This is a pure shading puzzle: no digits, no rows/columns/boxes. The rules
// (from the video description) are:
//   (1) Each region contains one stone, a mass of connected cells.
//   (2) Stones from different sectors may not share sides, but can touch at
//       corners.
//   (3) If a region contains a number, exactly that many cells must be
//       shaded.
//   (4) Half the cells in each column must be shaded.
//   (5) If dropped, stones will stack in the bottom half of the grid,
//       completely filling it. Stones will remain intact, keeping their
//       shape, and will not rotate.
//
// Rule (5) is OMITTED: it asks whether the discovered stones, treated as
// rigid polyominoes released under gravity in their own columns (no
// rotation), come to rest packed with no gaps into the bottom 5 rows. That is
// a joint feasibility condition over every stone's shape and column position
// at once -- not a set/sum, a two-cell relation, a regular language, a
// disjunction, a Var-coded local rule, a discovered-region rule, or a
// per-target counting NFA. No ISS primitive expresses it.
//
// Rule (2) is OMITTED. "Sector" names no drawn grouping: the payload has no
// colouring or clustering of the 15 regions beyond the regions themselves,
// so the only inferable reading is sector == region. That reading is
// refuted: with rules 1, 3 and 4 all encoded, adding "no two different
// regions' shaded cells are orthogonally adjacent" (every region its own
// sector) makes the puzzle unsatisfiable -- confirmed exhaustively, and
// already true of just rules 1 and 4 with every rule-3 count clue removed,
// so it is not a rule-3 miscount. Dropping the boundary rule and keeping the
// rest is satisfiable. A puzzle this rules text describes has a solution, so
// sector == region cannot be what it means.
//
// The 10x10 grid is only a bounding box: the drawn regions cover 88 of the
// 100 cells, and the puzzle's own numbers confirm the other 12 are outside
// play, not just undrawn -- rule 4 needs 5*10 = 50 shaded cells total, which
// is exactly the 5*10 = 50 cells of the "bottom half" rule 5 must completely
// fill, so every shaded cell has to belong to some stone (some region). Those
// 12 cells are given a fixed UNSHADED value below.
//
// Model: one value per main-grid cell names both its shade and, when shaded,
// which region's stone it belongs to (UNSHADED, or SHADED_<region>). Regions
// are pairwise cell-disjoint, so at most one SHADED_<region> value is ever a
// candidate for a given cell, and ConnectedValues, run once per region value
// directly on the main grid, gets the grid's own real row/column adjacency
// for free. (A per-region Var sub-group would need ConnectedValues to derive
// adjacency from a declared width, and an irregular region has none.)

const graph = cellGraph('10x10');
const UNSHADED = 1;

// Region cell lists, transcribed from the puzzle's drawn regions as
// 1-indexed [row, col] pairs, in their drawn order. Cell ids for a 10-wide
// grid are not plain decimal R#C# (row/col 10 is not a single base-17
// digit), so build them with makeCellId rather than a hand-written string.
const REGION_CELL_INDICES = {
  A: [[1, 1], [1, 2], [1, 3], [2, 1], [2, 2], [2, 3], [3, 1], [4, 1]],
  B: [[1, 7], [1, 8], [1, 9], [1, 10], [2, 7], [2, 8]],
  C: [[3, 2], [3, 3], [4, 3]],
  D: [[3, 9], [3, 10], [4, 9], [4, 10], [2, 9], [2, 10], [5, 9]],
  E: [[5, 1], [5, 2], [5, 3], [5, 4], [6, 1], [6, 2], [6, 3], [6, 4], [6, 5],
    [4, 2], [7, 1], [7, 2], [7, 3], [7, 4], [4, 4], [3, 4]],
  F: [[5, 6], [5, 7], [3, 5], [4, 5], [5, 5], [4, 7]],
  G: [[8, 1], [8, 2], [9, 2], [9, 1]],
  H: [[7, 6], [7, 7], [7, 8], [8, 6], [8, 7], [8, 8], [8, 9], [8, 5], [6, 6],
    [6, 7], [6, 8]],
  I: [[10, 1], [10, 2], [10, 3]],
  J: [[9, 9], [9, 10], [10, 9], [10, 10], [8, 10], [7, 10], [6, 10], [5, 10]],
  K: [[10, 4], [10, 5], [10, 6], [10, 7], [9, 7], [9, 6]],
  L: [[2, 5], [2, 6], [1, 6]],
  M: [[4, 8], [5, 8]],
  N: [[2, 4], [1, 4], [1, 5]],
  O: [[10, 8], [9, 8]],
};
const REGIONS = Object.fromEntries(Object.entries(REGION_CELL_INDICES).map(
  ([letter, pairs]) =>
    [letter, pairs.map(([row, col]) => makeCellId(row, col))]));

// Region shaded-count clues, transcribed from the puzzle's drawn text
// labels. Each label sits inside exactly one region's own cells, which fixes
// the region it counts for:
//   2 in R1C1 -> A, 2 in R1C4 -> N, 2 in R2C5 -> L, 2 in R10C4 -> K,
//   2 in R10C1 -> I, 3 in R8C1 -> G, 3 in R3C2 -> C, 4 in R3C5 -> F,
//   4 in R2C9 -> D.
// Regions not listed here carry no number and so have no count rule.
const CLUES = { A: 2, N: 2, L: 2, K: 2, I: 2, G: 3, C: 3, F: 4, D: 4 };

// One SHADED_<letter> value per region: UNSHADED (1) plus one value per
// region (2..16), assigned in drawn order.
const letters = Object.keys(REGIONS);
const SHADED = Object.fromEntries(letters.map((letter, i) => [letter, i + 2]));

const cellRegion = new Map();
for (const [letter, cells] of Object.entries(REGIONS))
  for (const cell of cells) cellRegion.set(cell, letter);

// Every main-grid cell's candidates: UNSHADED, plus its own region's SHADED
// value when it has one. A cell outside every region can only be UNSHADED.
const domainRestrictions = graph.cells().map(cell => {
  const letter = cellRegion.get(cell);
  return letter
    ? new Given(cell, UNSHADED, SHADED[letter])
    : new Given(cell, UNSHADED);
});

// Rule 1: each region's shaded cells form exactly one connected stone.
const stoneConnectivity = letters.map(
  letter => new ConnectedValues('', SHADED[letter]));

// Rule 3: a clued region's stone has exactly that many cells. A cell
// contributes 1 (unshaded) or SHADED[letter] (shaded) to the region's own
// sum, so summing to (size - clue) * 1 + clue * SHADED[letter] pins the
// shaded count exactly.
const clueCounts = Object.entries(CLUES).map(([letter, clue]) => {
  const cells = REGIONS[letter];
  const target = (cells.length - clue) * UNSHADED + clue * SHADED[letter];
  return new Sum(target, ...cells);
});

// Rule 4: half of each column's 10 cells must be shaded. The main grid's
// SHADED values differ per region, so counting shaded cells needs a
// parallel two-valued overlay (SH_SHADED/SH_UNSHADED) tied to the main grid
// cell-by-cell; summing that gives the usual "size + count" trick, uniform
// across every column since the overlay covers the whole grid.
const SH_UNSHADED = 1;
const SH_SHADED = 2;
const shade = graph.makeOverlay('VSH');
const shadeVar = shade.toVar('SH');
const shadeDomain = shade.makeReplicate(
  new Given(shade.cells()[0], SH_UNSHADED, SH_SHADED));
const shadeLinks = graph.cells().map(cell => new Pair(
  Pair.fnToKey((main, sh) =>
    (sh === SH_SHADED) === (main !== UNSHADED), letters.length + 1),
  '', cell, shade.at(cell)));
const columnCounts = Array.from({ length: 10 }, (_, i) =>
  new Sum(10 + 5, ...shade.column(i + 1)));

return [
  new Shape('10x10', `1-${letters.length + 1}`, 'Raw'),
  ...domainRestrictions,
  ...stoneConnectivity,
  ...clueCounts,
  shadeVar,
  shadeDomain,
  ...shadeLinks,
  ...columnCounts,
];
