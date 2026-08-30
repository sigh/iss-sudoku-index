// Title: Cave
// Author: Palmer Mebane
// Video: https://www.youtube.com/watch?v=qRnMnGY4_gQ
// Source: https://cracking-the-cryptic.web.app/sudoku/Q72RPgdfGh

// 10x10 grid, no digit layer -- a pure shading puzzle (the base "Cave"
// genre, not a Sudoku/Fillomino hybrid): no row, column or box rule, so the
// grid is Raw.
//
// Rules encoded:
//  * Every cell is shaded WALL (grey) or CAVE (unshaded). Every WALL cell has
//    an orthogonal path to the grid's edge through WALL cells only (several
//    separate wall regions are allowed, each independently reaching the
//    edge). All CAVE cells together form exactly one orthogonally-connected
//    area.
//  * A clue cell must be CAVE, and its printed number is the count of CAVE
//    cells visible from it by an orthogonal line of sight in the four
//    directions, counting the clue cell itself once; WALL cells and the grid
//    edge block the view.
//
// Omitted: whether a 2x2 block of WALL cells is forbidden -- this puzzle's
// own payload states no such rule either way.
//
// --- Two layers for WALL/CAVE, and why -------------------------------------
// The shaded WALL/CAVE pattern is this puzzle's entire content, so it belongs
// on the real board (reported as the puzzle's solution), at true 10x10.
// ConnectedValues' "every component reaches the border" trick needs a ring of
// cells one larger on every side, pinned to WALL, which cannot be real board
// cells (that would misreport the board's own dimensions). So WALL/CAVE is
// carried twice: once as the real board's own value (10x10, reported), and
// once on an independent 12x12 overlay ring purely for the border-reachable
// connectivity check, tied to the board cell-for-cell with SameValues. The
// board's own cells, not the ring, are what the visibility-count clues read.

const WALL = 1, CAVE = 2;
const SIDE = 10;

// True board: only WALL/CAVE is ever written here, but the range is widened
// to 1-10 (not just 1-2) because the run-length visibility overlays below
// share this same shape/graph and need values up to SIDE.
const shape = new Shape(`${SIDE}x${SIDE}`, `1-${SIDE}`, 'Raw');
const graph = cellGraph(shape);
const cells = graph.cells();

// Board cells hold only WALL/CAVE; explicit since the shape's own range is
// wider (see above).
const boardShadeDomain = [new Replicate(
  [new Given(cells[0], WALL, CAVE)],
  Replicate.encodeTargetCells(cells, cells[0], graph),
  cells[0])];

// --- Ring overlay for wall-to-edge connectivity -----------------------------
const RING_WIDTH = 1;
const ringLayer = cellGraph(`${SIDE + 2 * RING_WIDTH}x${SIDE + 2 * RING_WIDTH}`).makeOverlay('VG');
const ringShadeVar = ringLayer.toVar('wall or cave (connectivity ring)');
const ringAt = (row, col) => ringShadeVar.cell(row + RING_WIDTH, col + RING_WIDTH);

const trueRingCells = [];
for (let r = 1; r <= SIDE; r++) for (let c = 1; c <= SIDE; c++) trueRingCells.push(ringAt(r, c));
const trueRingCellSet = new Set(trueRingCells);
const outerRingCells = ringLayer.cells().filter(cell => !trueRingCellSet.has(cell));

const ringShading = [
  ringShadeVar,
  ringLayer.makeReplicate(new Given(ringShadeVar.cell(1), WALL, CAVE)),
  ...outerRingCells.map(cell => new Given(cell, WALL)),
  new ConnectedValues('VG', WALL),
  new ConnectedValues('VG', CAVE),
];

// Tie every true-board cell to its ring counterpart so the ring always
// mirrors the reported board.
function cellAt(row, col) { return makeCellId(row, col); }
const ringLinks = cells.map(cell => {
  const { row, col } = parseCellId(cell);
  return new SameValues(2, cell, ringAt(row, col));
});

// --- Visibility-count clues -------------------------------------------------
// Clue cells and their printed counts. 20 are transcribed from `cells[].value`;
// R3C3 and R8C3 are transcribed from the payload's text `overlays` (drawn as
// overlay text rather than a cell value because their count is two digits).
const CLUES = [
  [1, 1, 3], [1, 5, 7], [1, 10, 2],
  [2, 7, 6], [2, 9, 6],
  [3, 3, 10], [3, 8, 7],
  [4, 7, 4], [4, 9, 6],
  [5, 1, 2], [5, 5, 4],
  [6, 6, 7], [6, 10, 5],
  [7, 2, 7], [7, 4, 5],
  [8, 3, 12], [8, 8, 9],
  [9, 2, 9], [9, 4, 6],
  [10, 1, 4], [10, 6, 4], [10, 10, 3],
];
const clueGivens = CLUES.map(([r, c]) => new Given(cellAt(r, c), CAVE));

// Directional "run length" overlay, one cell value per board cell, along the
// recurrence (fixture-validated: all-CAVE row, a WALL mid-row, both a correct
// and an incorrect run assignment -- accept/accept/reject as expected):
//   run(cell) = 1                     if cell is WALL (dummy, never read further)
//   run(cell) = 1                     if cell is CAVE and the next cell that
//                                      way is WALL, or cell is the last one
//                                      before the grid edge
//   run(cell) = 1 + run(next cell)    if cell is CAVE and the next cell that
//                                      way is also CAVE
// A clue cell's printed count then equals the sum of its four runs (E/W/N/S)
// minus 3 -- each run counts the clue cell itself once, so summing all four
// counts it four times.
const runSpec = NFA.encodeSpec({
  startState: { phase: 0 },
  transition: (state, value) => {
    if (state.phase === 0) {
      return (value === WALL || value === CAVE) ? { phase: 1, myShade: value } : undefined;
    }
    if (state.phase === 1) {
      return (value === WALL || value === CAVE)
        ? { phase: 2, myShade: state.myShade, neighShade: value } : undefined;
    }
    if (state.phase === 2) {
      return { phase: 3, myShade: state.myShade, neighShade: state.neighShade, neighRun: value };
    }
    if (state.phase === 3) {
      const expected = (state.myShade === CAVE && state.neighShade === CAVE)
        ? 1 + state.neighRun : 1;
      return value === expected ? { phase: 4 } : undefined;
    }
    return undefined;
  },
  accept: state => state.phase === 4,
}, shape);

// Builds one directional run-length overlay over the whole board. `dRow`/
// `dCol` point from a cell to its "outward" (edge-ward) neighbour; `graph.step`
// returns null off-grid, which marks the edge cell in that direction (run = 1,
// no recursion).
function buildRun(prefix, dRow, dCol) {
  const overlay = graph.makeOverlay(prefix);
  const constraints = cells.map(cell => {
    const neighbour = graph.step(cell, dRow, dCol);
    return neighbour === null
      ? new Given(overlay.at(cell), 1)
      : new NFA(runSpec, `visible run ${prefix}`,
        cell, neighbour, overlay.at(neighbour), overlay.at(cell));
  });
  return { overlay, constraints };
}

const runEast = buildRun('VRE', 0, 1);
const runWest = buildRun('VRW', 0, -1);
const runNorth = buildRun('VRN', -1, 0);
const runSouth = buildRun('VRS', 1, 0);

const visibility = CLUES.map(([r, c, value]) => {
  const cell = cellAt(r, c);
  return new Sum(value + 3,
    runEast.overlay.at(cell), runWest.overlay.at(cell),
    runNorth.overlay.at(cell), runSouth.overlay.at(cell));
});

return [
  shape,
  ...boardShadeDomain,
  ...ringShading,
  ...ringLinks,
  ...clueGivens,
  runEast.overlay.toVar('cave run east'),
  runWest.overlay.toVar('cave run west'),
  runNorth.overlay.toVar('cave run north'),
  runSouth.overlay.toVar('cave run south'),
  ...runEast.constraints,
  ...runWest.constraints,
  ...runNorth.constraints,
  ...runSouth.constraints,
  ...visibility,
];
