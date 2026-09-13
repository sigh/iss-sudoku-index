// Title: Akari (Light Up)
// Author: Unknown
// Video: https://www.youtube.com/watch?v=huMgnsAIDjw
// Source: http://pzv.jp/p.html?akari/18/10/.j.h6.i.harblahagbgah.jbbgai..bhbnbh1..kagbbh.jagbgah.n.tc.i.gaah./

// No Sudoku digit layer at all: the source payload carries genre 'akari' /
// 'Akari (Light Up)' and no rules text, so the standard Light Up ruleset
// applies. Place light bulbs in some white cells so that:
//   (1) every white cell is illuminated -- a bulb lights its entire row and
//       column, stopping at the nearest black cell or the grid edge;
//   (2) no bulb illuminates another bulb (no two bulbs share an unbroken
//       row/column run);
//   (3) a numbered black cell has exactly that many bulbs in its orthogonally
//       adjacent cells; an unnumbered black cell has no such restriction.
//
// The board is 10 rows x 18 columns. ISS's CellGeometry caps both grid
// dimensions at 16, so a canvas this wide cannot be one grid, and there is
// no single Shape this puzzle can use. It is modelled on two side-by-side
// cell groups instead, each its own 10x9 cellGraph well within the cap: VL
// for global columns 1-9, VR for global columns 10-18, joined by hand at
// the column-9/10 seam. A tiny pinned Shape('1x1') placeholder supplies the
// puzzle's 3-value alphabet (EMPTY/BULB/WALL); it carries no puzzle content
// itself.
//
// Same "shading as a widened Raw grid" 3-value technique as this pipeline's
// other Akari/Slitherlink rows: EMPTY / BULB / WALL. There is no separate
// "is illuminated" overlay: a white cell's row-run and column-run (the
// maximal stretch of white cells either side of it, up to the nearest wall
// or edge) are computed directly from the fixed wall layout, and
// illumination becomes "at least one cell in that union is a bulb" -- a
// single Or of Given(cell, BULB) branches, one branch per candidate cell,
// trivially true when the cell is itself a bulb.

const EMPTY = 1, BULB = 2, WALL = 3;
const ROWS = 10, COLS = 18, SPLIT = 9; // global columns 1-9 -> VL, 10-18 -> VR

const placeholder = new Shape('1x1', 3, 'Raw');
const placeholderPin = new Given('R1C1', EMPTY);

// Two independent 10x9 cell graphs (each within the 16-dimension cap), each
// wrapped in a full-grid overlay so row()/column()/makeReplicate() are
// available on both halves exactly as on a normal grid.
const graphL = cellGraph('10x9');
const graphR = cellGraph('10x9');
const overlayL = graphL.makeOverlay('VL');
const overlayR = graphR.makeOverlay('VR');
const varL = overlayL.toVar('left half (global columns 1-9)');
const varR = overlayR.toVar('right half (global columns 10-18)');

// A global (row, col) pair, both 1-indexed over the full 10x18 board, to its
// var cell in whichever half owns it, via each Var's own declared 10x9
// dimensions.
function cellAt(r, c) {
  return c <= SPLIT ? varL.cell(r, c) : varR.cell(r, c - SPLIT);
}

// The 38 black cells, transcribed from the source's own clue table
// (r, c 1-indexed): -2 = unnumbered wall, 0-4 = numbered wall giving the
// exact count of bulbs required in its orthogonal neighbours. Every other
// cell of the 10x18 grid is a white (playable) cell.
const WALLS = [
  [1, 1, -2], [1, 6, -2], [1, 9, 1], [1, 11, -2], [1, 15, -2], [1, 18, 0],
  [2, 15, 1],
  [3, 6, 0], [3, 11, 0], [3, 15, 1],
  [4, 1, 0], [4, 6, -2], [4, 11, 1], [4, 14, 1], [4, 18, 0],
  [5, 6, -2], [5, 7, -2], [5, 8, 1], [5, 13, 1],
  [6, 6, 1], [6, 11, 1], [6, 12, -2], [6, 13, -2],
  [7, 1, 0], [7, 5, 1], [7, 8, 1], [7, 13, -2], [7, 18, 0],
  [8, 4, 1], [8, 8, 0], [8, 13, -2],
  [9, 4, -2],
  [10, 1, 2], [10, 4, -2], [10, 8, -2], [10, 10, 0], [10, 13, 0], [10, 18, -2],
];

const wallValue = new Map(WALLS.map(([r, c, v]) => [`${r},${c}`, v]));
const isWall = (r, c) => wallValue.has(`${r},${c}`);

// --- Domain restrictions ------------------------------------------------
// Every wall cell is pinned exactly to WALL; every white cell is restricted
// to {EMPTY, BULB}. This alone is what makes a wall cell read as "0 bulbs"
// when it turns up as somebody else's orthogonal neighbour below. One
// Replicate'd template per half per class (four total).
const leftWalls = [], leftWhites = [], rightWalls = [], rightWhites = [];
for (let r = 1; r <= ROWS; r++) {
  for (let c = 1; c <= COLS; c++) {
    const id = cellAt(r, c);
    const bucket = c <= SPLIT
      ? (isWall(r, c) ? leftWalls : leftWhites)
      : (isWall(r, c) ? rightWalls : rightWhites);
    bucket.push(id);
  }
}
const domainConstraints = [
  overlayL.makeReplicate(new Given(overlayL.cells()[0], WALL), leftWalls),
  overlayL.makeReplicate(new Given(overlayL.cells()[0], EMPTY, BULB), leftWhites),
  overlayR.makeReplicate(new Given(overlayR.cells()[0], WALL), rightWalls),
  overlayR.makeReplicate(new Given(overlayR.cells()[0], EMPTY, BULB), rightWhites),
];

// --- Row/column runs -----------------------------------------------------
// A run is a maximal stretch of consecutive white cells in one row or one
// column, split at every wall and at the grid edge. Row runs may cross the
// VL/VR seam (a row's columns 1-18 are scanned as one continuous line
// regardless of which half owns each cell); column runs never do, since
// every column lies wholly inside one half.
function computeRuns(coords) {
  const runs = [];
  let current = [];
  for (const [r, c] of coords) {
    if (isWall(r, c)) {
      if (current.length) runs.push(current);
      current = [];
    } else {
      current.push(cellAt(r, c));
    }
  }
  if (current.length) runs.push(current);
  return runs;
}

const rowRuns = [];
const rowRunOfCell = new Map();
for (let r = 1; r <= ROWS; r++) {
  const coords = Array.from({ length: COLS }, (_, i) => [r, i + 1]);
  for (const run of computeRuns(coords)) {
    rowRuns.push(run);
    for (const id of run) rowRunOfCell.set(id, run);
  }
}

const colRuns = [];
const colRunOfCell = new Map();
for (let c = 1; c <= COLS; c++) {
  const coords = Array.from({ length: ROWS }, (_, i) => [i + 1, c]);
  for (const run of computeRuns(coords)) {
    colRuns.push(run);
    for (const id of run) colRunOfCell.set(id, run);
  }
}

// --- Rule (2): no two bulbs share a run ----------------------------------
// A run of length 1 trivially satisfies "at most one bulb", so only runs of
// 2+ cells need a constraint. A 2-cell run is a plain pairwise relation
// (Pair, not a whole NFA machine); 3+ cells need the running-count machine.
const atMostOneBulbPairKey = Pair.fnToKey(
  (a, b) => !(a === BULB && b === BULB), 3);
const atMostOneBulb = NFA.encodeSpec({
  startState: 0,
  transition: (bulbSeen, value) => {
    if (value !== BULB) return bulbSeen;
    return bulbSeen === 1 ? undefined : 1;
  },
  accept: () => true,
}, 3);

const noSeeConstraints = [...rowRuns, ...colRuns].flatMap(run => {
  if (run.length < 2) return [];
  if (run.length === 2) {
    return [new Pair(atMostOneBulbPairKey, 'no-see', run[0], run[1])];
  }
  return [new NFA(atMostOneBulb, 'no-see', ...run)];
});

// --- Rule (1): every white cell is illuminated ---------------------------
// A cell is illuminated exactly when its row-run or its column-run holds a
// bulb (a run of at most one bulb, from rule 2 above, so "holds a bulb" and
// "the union contains exactly one BULB" coincide). Encoded directly as one
// Or per white cell over every cell of that union taking the value BULB --
// true whether the bulb is this cell itself or another cell sharing either
// run.
const illuminationConstraints = [];
for (let r = 1; r <= ROWS; r++) {
  for (let c = 1; c <= COLS; c++) {
    if (isWall(r, c)) continue;
    const id = cellAt(r, c);
    const union = new Set([...rowRunOfCell.get(id), ...colRunOfCell.get(id)]);
    illuminationConstraints.push(new Or([...union].map(u => new Given(u, BULB))));
  }
}

// --- Rule (3): numbered wall clues ---------------------------------------
// Reads only the existing orthogonal neighbours (a corner wall has 2, an
// edge wall has 3, an interior wall has 4) and counts how many equal BULB.
// Neighbours are computed by hand in (row, col) space -- not via
// graph.neighbours(), since a wall's neighbour can lie in the other half
// (e.g. a wall at column 9 has its column-10 neighbour in VR), which no
// single overlay's own graph spans.
// lint-ok: custom-neighbour-helper
function neighboursOf(r, c) {
  const coords = [];
  if (r > 1) coords.push([r - 1, c]);
  if (r < ROWS) coords.push([r + 1, c]);
  if (c > 1) coords.push([r, c - 1]);
  if (c < COLS) coords.push([r, c + 1]);
  return coords.map(([nr, nc]) => cellAt(nr, nc));
}

const bulbCountMachines = new Map();
function bulbCountMachine(target, arity) {
  const key = `${target}_${arity}`;
  if (!bulbCountMachines.has(key)) {
    bulbCountMachines.set(key, NFA.encodeSpec({
      startState: 0,
      transition: (count, value) => {
        const next = count + (value === BULB ? 1 : 0);
        return next > target ? undefined : next;
      },
      accept: count => count === target,
    }, 3));
  }
  return bulbCountMachines.get(key);
}

// A corner wall has only 2 orthogonal neighbours, so its clue is a plain
// pairwise relation (Pair) rather than a whole NFA machine.
const bulbCountPairKeys = new Map();
function bulbCountPairKey(target) {
  if (!bulbCountPairKeys.has(target)) {
    bulbCountPairKeys.set(target, Pair.fnToKey(
      (a, b) => (a === BULB ? 1 : 0) + (b === BULB ? 1 : 0) === target, 3));
  }
  return bulbCountPairKeys.get(target);
}

const wallClueConstraints = WALLS
  .filter(([, , value]) => value >= 0)
  .map(([r, c, target]) => {
    const neighbourIds = neighboursOf(r, c);
    if (neighbourIds.length === 2) {
      return new Pair(
        bulbCountPairKey(target), 'wall-clue', neighbourIds[0], neighbourIds[1]);
    }
    return new NFA(
      bulbCountMachine(target, neighbourIds.length), 'wall-clue', ...neighbourIds);
  });

return [
  placeholder,
  placeholderPin,
  varL,
  varR,
  ...domainConstraints,
  ...noSeeConstraints,
  ...illuminationConstraints,
  ...wallClueConstraints,
];
