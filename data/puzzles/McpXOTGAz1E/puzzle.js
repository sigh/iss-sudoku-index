// Title: Embark
// Author: dumediat
// Video: https://www.youtube.com/watch?v=McpXOTGAz1E
// Source: https://tinyurl.com/3wbmu73f
//
// 14x14. Fog of war is UI only and is not encoded.
//
// Deconstruction: nine non-overlapping 3x3 regions, each 1-9 once, digits not
// repeating in their row/column; cells outside every region hold no digit.
// The 81 digit givens below cluster into exactly nine contiguous 3x3 blocks,
// so the region layout is read directly off the given cells, not solved for.
//
// Killer: cage digits sum to the corner total and don't repeat; a cage's
// empty-cell members (shaded or not) contribute nothing to the total.
//
// Modified Yajilin, over the 115 non-region "empty" cells: shade some black so
// no two shaded cells (including the given black ones) are orthogonally
// adjacent, and route a single non-self-intersecting loop through every
// unshaded empty cell's centre. Each arrow clue (drawn on a digit cell that is
// part of a region) gives the count of shaded cells in a straight line from
// that cell to the grid edge, in the arrow's drawn direction.
//
// Only the digit givens and the 7 black-shaded cells are encoded as clues.
// The drawn loop path and 8 grey-filled cells are the puzzle's own baked-in
// answer for the fog checker, not a shown clue (no rule text describes a
// given loop or a second shading colour), so they are left for the encoding
// below to derive rather than fed in as givens.

// The active Shape's value range must be >= 14: ConnectedValues requires its
// var-cell group to have exactly as many cells as the main grid
// (js/solver/connected_handler.js), so the main grid itself has to be the
// real 14x14 (NoBoxes below drops its otherwise-mandatory box groups; its
// row/column all-different is unavoidable, so the range widens to 14 purely
// so that requirement is satisfiable -- the main-grid R#C# cells are
// otherwise unused, and every real cell lives in the D/PHYS overlays below,
// restricted back to its true small domain via Given).
const NUM_VALUES = 14;
const DIGIT = 1, SHADED = 2, LOOPCELL = 3;   // PHYS-overlay state codes (not digit values)

const graph = cellGraph('14x14');    // geometry helper, mirrors the Shape below
const gridCells = graph.cells();     // all 196 physical cells, row-major

// --- Regions: nine 3x3 top-left corners, read off the given-cell clusters. ---
const REGION_TOP_LEFTS = [
  [1, 6], [2, 2], [2, 10], [5, 7], [7, 1], [9, 12], [10, 5], [10, 8], [12, 12],
];
const regionBlocks = REGION_TOP_LEFTS.map(([r, c]) => graph.block(makeCellId(r, c), 3, 3));
const digitCellSet = new Set(regionBlocks.flat());
// Row-major order (not region-block order), so the VD overlay's cell order
// matches the stored solution's row-major, blanks-dropped ordering.
const digitCells = gridCells.filter(c => digitCellSet.has(c));
const emptyCells = gridCells.filter(c => !digitCellSet.has(c));   // all 115 non-region cells

// --- Given digits (81), transcribed as [row, col, value] from the grid's given cells. ---
const DIGIT_GIVENS = [
  [1, 6, 9], [1, 7, 5], [1, 8, 1], [2, 2, 6], [2, 3, 5], [2, 4, 9], [2, 6, 4], [2, 7, 7],
  [2, 8, 2], [2, 10, 3], [2, 11, 8], [2, 12, 1], [3, 2, 4], [3, 3, 7], [3, 4, 1], [3, 6, 6],
  [3, 7, 8], [3, 8, 3], [3, 10, 5], [3, 11, 2], [3, 12, 9], [4, 2, 3], [4, 3, 2], [4, 4, 8],
  [4, 10, 4], [4, 11, 6], [4, 12, 7], [5, 7, 9], [5, 8, 8], [5, 9, 2], [6, 7, 6], [6, 8, 4],
  [6, 9, 5], [7, 1, 5], [7, 2, 2], [7, 3, 9], [7, 7, 3], [7, 8, 7], [7, 9, 1], [8, 1, 8],
  [8, 2, 7], [8, 3, 3], [9, 1, 6], [9, 2, 1], [9, 3, 4], [9, 12, 8], [9, 13, 3], [9, 14, 7],
  [10, 5, 9], [10, 6, 8], [10, 7, 4], [10, 8, 5], [10, 9, 3], [10, 10, 7], [10, 12, 6],
  [10, 13, 1], [10, 14, 2], [11, 5, 7], [11, 6, 3], [11, 7, 2], [11, 8, 6], [11, 9, 8],
  [11, 10, 1], [11, 12, 4], [11, 13, 5], [11, 14, 9], [12, 5, 6], [12, 6, 5], [12, 7, 1],
  [12, 8, 9], [12, 9, 4], [12, 10, 2], [12, 12, 3], [12, 13, 7], [12, 14, 8], [13, 12, 5],
  [13, 13, 6], [13, 14, 1], [14, 12, 2], [14, 13, 9], [14, 14, 4],
];

// --- Given black-shaded cells (7), as [row, col]. ---
const BLACK_GIVENS = [[4, 14], [6, 3], [6, 6], [9, 10], [10, 1], [12, 4], [14, 8]]
  .map(([r, c]) => makeCellId(r, c));
const blackGivenSet = new Set(BLACK_GIVENS);

// --- Killer cages (21): drawn total + full cell list ([row, col] pairs, digit + empty cells). ---
const CAGES = [
  [13, [[14, 13], [14, 14]]],
  [16, [[11, 12], [11, 13], [12, 13]]],
  [15, [[9, 12], [10, 12], [10, 13]]],
  [4, [[11, 10], [11, 11], [12, 11], [12, 12]]],
  [11, [[10, 9], [11, 9]]],
  [10, [[11, 6], [11, 7], [12, 6]]],
  [13, [[9, 3], [9, 4], [9, 5], [10, 5]]],
  [12, [[7, 2], [8, 2], [8, 3]]],
  [11, [[4, 3], [5, 3], [6, 3], [7, 3]]],
  [8, [[4, 1], [4, 2], [5, 1], [6, 1], [7, 1]]],
  [15, [[3, 4], [3, 5], [3, 6], [3, 7]]],
  [9, [[4, 6], [5, 6], [5, 7]]],
  [9, [[6, 8], [6, 9]]],
  [10, [[7, 7], [7, 8], [8, 8]]],
  [18, [[3, 11], [3, 12], [4, 12]]],
  [14, [[2, 8], [3, 8], [3, 9], [3, 10], [4, 10]]],
  [12, [[1, 7], [2, 7]]],
  [13, [[11, 5], [12, 5]]],
  [2, [[4, 8], [4, 9], [5, 9]]],
  [10, [[2, 2], [3, 2]]],
  [14, [[2, 3], [2, 4]]],
];

// --- Arrow clues (11): [row, col, dRow, dCol] of the digit cell + drawn
// direction. The clue value itself is read live from the digit overlay
// below, not duplicated here.
const ARROWS = [
  [1, 8, 1, 0], [4, 3, 1, 0], [2, 10, 1, 0],        // down
  [2, 12, 0, 1], [7, 9, 0, 1], [9, 2, 0, 1],        // right
  [10, 14, -1, 0], [12, 10, -1, 0],                 // up
  [12, 7, 0, -1], [13, 14, 0, -1], [14, 12, 0, -1], // left
];

// === Digit layer: full-grid Var overlay (1-9 at a region cell, NODIGIT ===
// === elsewhere). Full-grid, not sparse to the 81 region cells, only because
// the result's off-grid solution_group needs a rectangular 'RxC' Var group
// (js/lib/validation.py's check_solution_group) to carry the digit answer;
// the 115 non-region D-cells are otherwise irrelevant and pinned to one
// constant so they add no search freedom of their own.
const NODIGIT = 10;
const D = graph.makeOverlay('VD');
const digitVar = D.toVar('digit');
const digitOrigin = D.cells()[0];
const digitGivens = [
  ...DIGIT_GIVENS.map(([r, c, v]) => new Given(digitVar.cell(r, c), v)),
  D.makeReplicate(new Given(digitOrigin, NODIGIT), D.at(emptyCells)),
];
// Each region: 1-9 once (Deconstruction).
const boxGroups = regionBlocks.map(block => new AllDifferent(...D.at(block)));
// Row/column all-different, scoped to the cells that actually hold a digit
// (D is full-grid, so row()/column() must be filtered by hand).
const rowGroups = Array.from({ length: 14 }, (_, i) => graph.row(i + 1).filter(c => digitCellSet.has(c)))
  .filter(cells => cells.length >= 2).map(cells => new AllDifferent(...D.at(cells)));
const colGroups = Array.from({ length: 14 }, (_, i) => graph.column(i + 1).filter(c => digitCellSet.has(c)))
  .filter(cells => cells.length >= 2).map(cells => new AllDifferent(...D.at(cells)));
// Killer cages: sum + distinct over each cage's digit-holding cells only.
const cageConstraints = CAGES.map(([total, cells]) => new Cage(
  total, ...D.at(cells.map(([r, c]) => makeCellId(r, c)).filter(c => digitCellSet.has(c)))));

// === Physical layer: full-grid Var overlay, one of DIGIT/SHADED/LOOPCELL. ===
const PHYS = graph.makeOverlay('VP');
// The two bulk given-sets are one uniform template shifted onto every member
// cell, so each is a single Replicate rather than one Given per cell. The
// {SHADED, LOOPCELL} domain is stamped over every empty cell, including the
// 7 given-black ones; the narrower per-cell Given below then intersects it
// down to {SHADED} there (Given.mergeConstraints), rather than hand-excluding
// them from the Replicate's target set.
const physOrigin = PHYS.cells()[0];
const physicalGivens = [
  PHYS.makeReplicate(new Given(physOrigin, DIGIT), PHYS.at(digitCells)),
  PHYS.makeReplicate(new Given(physOrigin, SHADED, LOOPCELL), PHYS.at(emptyCells)),
  ...BLACK_GIVENS.map(c => new Given(PHYS.at(c), SHADED)),
];

// Loop cells (unshaded empty cells) form one orthogonally-connected region.
// This is *not* the full "single non-intersecting loop" rule: the puzzle's
// own loop repeatedly runs two of its cells orthogonally adjacent without a
// loop edge between them, so the route may legally touch itself, and a
// per-cell "exactly 2 same-membership neighbours" degree check -- sound only
// when a route cannot touch itself -- rejects the puzzle's real answer
// (checked against the decoded loop/shading layers, not the withheld
// solution). The precise loop shape is an omission -- see the worker's notes.
const loopConnected = new ConnectedValues('VP', LOOPCELL);

// No two shaded cells orthogonally adjacent. Applied over every orthogonal
// edge in the grid; edges touching a digit cell are automatically slack since
// a digit cell is never SHADED. The 364 edges are two replicable shapes --
// "cell, its right neighbour" and "cell, its down neighbour" -- both anchored
// at R1C1, PHYS's own first cell, which has both, so overlay.makeReplicate()
// (origin = its first cell) applies directly.
const noAdjacentShadedKey = Pair.fnToKey((a, b) => !(a === SHADED && b === SHADED), NUM_VALUES);
const adjacentPairReplicate = (dRow, dCol) => {
  const withNeighbour = gridCells.filter(cell => graph.step(cell, dRow, dCol));
  const origin = withNeighbour[0];   // R1C1: has both a right and a down neighbour
  const template = new Pair(noAdjacentShadedKey, 'no-adjacent-shaded',
    PHYS.at(origin), PHYS.at(graph.step(origin, dRow, dCol)));
  return PHYS.makeReplicate(template, PHYS.at(withNeighbour));
};
const adjacentShadeConstraints = [
  adjacentPairReplicate(0, 1),   // horizontal edges
  adjacentPairReplicate(1, 0),   // vertical edges
];

// Arrow clues: from the arrow's cell to the grid edge, the number of SHADED
// cells equals the arrow cell's own digit. The digit is read live as the
// first symbol (same pattern as nordschleife.js's circleCounts), so nothing
// here duplicates the DIGIT_GIVENS values.
const arrowMachine = NFA.encodeSpec({
  startState: { target: null, count: 0 },
  transition: ({ target, count }, value) => {
    if (target === null) return { target: value, count: 0 };   // the arrow cell's digit
    const next = count + (value === SHADED ? 1 : 0);
    return next > target ? undefined : { target, count: next };
  },
  accept: ({ target, count }) => target !== null && count === target,
}, NUM_VALUES);
const arrowConstraints = ARROWS.map(([r, c, dRow, dCol]) => {
  const arrowCell = makeCellId(r, c);
  const rayCells = graph.ray(arrowCell, dRow, dCol).slice(1);   // exclude the arrow cell itself
  return new NFA(arrowMachine, 'arrow-count', D.at(arrowCell), ...PHYS.at(rayCells));
});

return [
  new Shape('14x14', NUM_VALUES),   // real geometry is in the D/PHYS overlays, not R#C#
  new NoBoxes(),                    // the main grid's R#C# cells are unused scaffolding
  digitVar,
  PHYS.toVar('physical'),
  ...digitGivens,
  ...boxGroups,
  ...rowGroups,
  ...colGroups,
  ...cageConstraints,
  ...physicalGivens,
  loopConnected,
  ...adjacentShadeConstraints,
  ...arrowConstraints,
];
