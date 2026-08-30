// Title: Yajilin Sudoku
// Author: Madmahogany
// Video: https://www.youtube.com/watch?v=JAiHhqHCaK8
// Source: https://bit.ly/2Bgx2bW
//
// Normal Sudoku rules apply. Every cell is exactly one of: a grey clue cell (no
// Sudoku digit), a block, or a loop cell. No two blocks are orthogonally
// adjacent. The loop cells (everything not a clue or a block) form a single
// continuous, non-self-intersecting loop through cell centres; the loop may
// only turn (never go straight) in a cell whose digit is odd. Each grey
// clue's own value counts blocks "in the given direction" -- but the payload
// draws no direction for any of the 9 clues (no arrow glyph, no per-cell
// corner mark or styling beyond the count digit itself), so the block-count
// rule cannot be anchored to any cell range, and is omitted.
//
// Clue cells hold no Sudoku digit (the payload shows only the count glyph,
// one value per cell, and one clue's value is 0 -- not a legal Sudoku digit --
// ruling out double duty as that cell's own digit). Blocks are read as
// ordinary digit-holding cells: nothing in the rules exempts them, unlike the
// clue cells the loop/block rule explicitly carves out. Raw grid: rows,
// columns and boxes lose one to three digit cells to clues, so the AllDifferent
// groups below are scoped to non-clue cells rather than using the implicit
// Sudoku grid type (which would demand a full 1-9 permutation each unit).
const NUM_VALUES = 9;
const shape = new Shape('9x9', NUM_VALUES, 'Raw');
const graph = cellGraph(shape);
const gridCells = graph.cells();

// --- Grey clue cells (9): transcribed [row, col] from the shaded/`_N` cells
// (surface + number layers, penpa point-index -> R#C# per the payload schema).
const CLUE_CELLS = [
  [1, 1], [1, 3], [3, 3], [4, 7], [5, 3], [6, 5], [7, 8], [8, 4], [8, 5],
].map(([r, c]) => makeCellId(r, c));
const clueCellSet = new Set(CLUE_CELLS);
const digitCells = gridCells.filter(c => !clueCellSet.has(c));

// --- Sudoku givens (18), transcribed [row, col, value] from the plain
// (non-`_N`) `number` entries.
const DIGIT_GIVENS = [
  [1, 5, 6], [1, 9, 9], [2, 2, 9], [2, 8, 6], [3, 4, 4], [4, 4, 7], [4, 8, 8],
  [5, 1, 8], [5, 5, 4], [5, 9, 5], [6, 2, 2], [6, 6, 9], [7, 6, 8], [8, 2, 3],
  [8, 3, 6], [8, 8, 7], [9, 1, 2], [9, 5, 7],
].map(([r, c, v]) => new Given(makeCellId(r, c), v));

// Clue cells carry no Sudoku digit and nothing else reads their cell value, so
// pin it to a fixed constant (1) purely to keep the search from branching over
// an unused free variable -- not an assertion about the puzzle's content.
const clueDigitGivens = CLUE_CELLS.map(c => new Given(c, 1));

// Row/column/box AllDifferent, scoped to the 72 digit-holding (non-clue)
// cells: a plain AllDifferent, not a full 1-9 permutation, since a unit
// missing one to three clue cells cannot hold all nine digits.
const BOX_TOP_LEFTS = [[1, 1], [1, 4], [1, 7], [4, 1], [4, 4], [4, 7], [7, 1], [7, 4], [7, 7]];
const rowGroups = graph.rows().map(row => row.filter(c => !clueCellSet.has(c)))
  .filter(cells => cells.length >= 2).map(cells => new AllDifferent(...cells));
const colGroups = graph.columns().map(col => col.filter(c => !clueCellSet.has(c)))
  .filter(cells => cells.length >= 2).map(cells => new AllDifferent(...cells));
const boxGroups = BOX_TOP_LEFTS.map(([r, c]) => graph.block(makeCellId(r, c), 3, 3))
  .map(cells => cells.filter(c => !clueCellSet.has(c)))
  .filter(cells => cells.length >= 2).map(cells => new AllDifferent(...cells));

// === Role/shape overlay: one Var per grid cell, whichever of CLUE / BLOCK /
// one of six loop-shape codes it is. A loop-shape code records which two of a
// cell's four edges the loop uses there (straight horizontal/vertical, or one
// of the four turn corners) -- same construction as data/scripts/wendezaune.js,
// with an extra CLUE state and a BLOCK state standing in for its single OFF.
const CLUE = 1, BLOCK = 2, HORIZ = 3, VERT = 4, UL = 5, UR = 6, DL = 7, DR = 8;
const usesUp = s => s === VERT || s === UL || s === UR;
const usesDown = s => s === VERT || s === DL || s === DR;
const usesLeft = s => s === HORIZ || s === UL || s === DL;
const usesRight = s => s === HORIZ || s === UR || s === DR;
const isTurn = s => s >= UL;

const role = graph.makeOverlay('VS');
const roleCells = role.cells();

// --- Role givens: clue cells pinned to CLUE. Every other cell is BLOCK or a
// loop-shape code, restricted so a cell can't claim an edge that runs off the
// grid (a border cell can't be a turn/straight that points outside it).
const LOOP_SHAPES = [HORIZ, VERT, UL, UR, DL, DR];
const clueRoleGivens = CLUE_CELLS.map(c => new Given(role.at(c), CLUE));
const roleDomains = digitCells.map(cell => {
  const { row, col } = parseCellId(cell);
  const allowedShapes = LOOP_SHAPES.filter(s =>
    !(row === 1 && usesUp(s)) && !(row === graph.gridGeometry().numRows && usesDown(s)) &&
    !(col === 1 && usesLeft(s)) && !(col === graph.gridGeometry().numCols && usesRight(s)));
  return new Given(role.at(cell), BLOCK, ...allowedShapes);
});

// --- Blocks cannot touch orthogonally: applied over every grid edge (edges
// touching a clue cell are automatically slack, since a clue cell is never
// BLOCK). A 2-cell relation, so `Pair` rather than `NFA`.
const noAdjacentBlocksKey = Pair.fnToKey((a, b) => !(a === BLOCK && b === BLOCK), NUM_VALUES);

// --- Edge agreement: neighbours must agree on the shared edge (same shape
// codes as wendezaune.js's edgeAgree, but as a `Pair` -- a 2-cell relation --
// rather than an NFA). CLUE/BLOCK never use any edge, so they behave like
// wendezaune's OFF on both sides of this check.
const edgeAgreeRightKey = Pair.fnToKey((a, b) => usesRight(a) === usesLeft(b), NUM_VALUES);
const edgeAgreeDownKey = Pair.fnToKey((a, b) => usesDown(a) === usesUp(b), NUM_VALUES);

// One `Pair` template per direction, anchored at R1C1 (has both a right and a
// down neighbour), shifted onto every other cell with that neighbour via
// `Replicate` -- 4 replicated templates cover all 288 direction x edge-type
// instances instead of enumerating each edge by hand.
const directedPairReplicate = (dRow, dCol, key, name) => {
  const withNeighbour = gridCells.filter(cell => graph.step(cell, dRow, dCol));
  const origin = withNeighbour[0];
  const template = new Pair(key, name, role.at(origin), role.at(graph.step(origin, dRow, dCol)));
  return role.makeReplicate(template, role.at(withNeighbour));
};
const edgeRules = [
  directedPairReplicate(0, 1, edgeAgreeRightKey, 'edge-h'),
  directedPairReplicate(1, 0, edgeAgreeDownKey, 'edge-v'),
  directedPairReplicate(0, 1, noAdjacentBlocksKey, 'no-adjacent-blocks'),
  directedPairReplicate(1, 0, noAdjacentBlocksKey, 'no-adjacent-blocks'),
];

// --- Turn-parity: a loop cell may only turn in a cell holding an odd digit.
// Reads (shape, digit); straight/BLOCK/CLUE cells are unconstrained. Cross-layer
// (role overlay x main grid), so it cannot use `Replicate` (which requires every
// cell in one template to share a cell group): one `Pair` per digit cell.
const turnParityKey = Pair.fnToKey((s, d) => !isTurn(s) || d % 2 === 1, NUM_VALUES);
const turnParityRules = digitCells.map(cell =>
  new Pair(turnParityKey, 'turn-parity', role.at(cell), cell));

// --- Single loop: loop-shape cells (everything not CLUE/BLOCK) form one
// connected cell region. Sound but not a full closure: the loop may legally
// run alongside itself (two loop cells orthogonally adjacent without a used
// edge between them), so this narrows "one loop" to "one connected blob of
// loop cells" rather than proving a single simple cycle.
const singleLoopBlob = new ConnectedValues('VS', LOOP_SHAPES);

return [
  shape,
  role.toVar('role'),
  ...DIGIT_GIVENS,
  ...clueDigitGivens,
  ...rowGroups,
  ...colGroups,
  ...boxGroups,
  ...clueRoleGivens,
  ...roleDomains,
  ...edgeRules,
  ...turnParityRules,
  singleLoopBlob,
];
