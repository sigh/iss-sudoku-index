// Title: Unknown
// Author: PolmanPoppins
// Video: https://www.youtube.com/watch?v=ddO6Vfo_IGE
// Source: https://app.crackingthecryptic.com/sudoku/hg9FTjnfRm

// Rules encoded, in full (from the video description, quoted verbatim):
//   Nurikabe: Shade some cells such that all shaded cells form one
//   orthogonally connected region and there is no 2x2 block of shaded
//   cells. Each unshaded cell is part of an island; each island contains
//   exactly one number, which establishes how many cells are in the
//   island. A ? is a number of unknown size. Two islands cannot touch,
//   except diagonally.
//   LITS: Shade one tetromino of cells in each region. Two tetrominoes of
//   the same shape may not share a bold border, counting rotations and
//   reflections as the same.
//
// Both rulesets govern the same shading: a cell is either water (LITS
// black / Nurikabe shaded) or land (LITS white / Nurikabe island). There is
// no Sudoku digit layer at all -- the source's own two givens (7, 4) are
// island-size clues, not digits -- so the board is a Raw grid holding the
// shading directly (1 = unshaded/land, 2 = shaded/water), widened to a
// 0-5 alphabet only because the auxiliary VL overlay below needs six
// values; the playable board cells are restricted back to {1, 2}.
//
// "Two islands cannot touch, except diagonally" needs no separate clause:
// the island partition below ties every land cell's label to its
// neighbours' (same label unless one side is water), so two
// differently-labelled land cells can never be orthogonally adjacent.

const UNSHADED = 1;
const SHADED = 2;
const WATER = 0; // VL overlay value for a shaded/water cell.
const isShaded = v => v === SHADED;

const GRID = '11x11';
const shape = new Shape(GRID, '0-5', 'Raw');
const graph = cellGraph(shape);

// --- Regions (15 total) ---------------------------------------------------
// 14 regions are listed explicitly in the payload's `regions` array
// (transcribed below as 1-indexed [row, col] pairs -- the payload itself is
// 0-indexed, already converted here -- and built with makeCellId so
// rows/columns past 9 use the board's base-17 ids rather than a
// hand-written literal). Their cells cover 113 of the grid's 121 cells; the
// remaining 8 cells (rows 5-7, columns 5-7 minus R7C7) are not listed as a
// region at all -- the payload's 15th region entry is an empty stub -- but
// every rule below requires the 15 regions to partition the whole grid, so
// this leftover 8-cell block is the 15th region, recovered by elimination
// rather than transcribed from a payload entry.
const REGION_COORDS = [
  [[1, 1], [1, 2], [1, 3], [1, 4], [2, 3]],
  [[1, 10], [2, 10], [3, 10], [3, 11], [2, 11], [1, 11]],
  [[4, 11], [4, 10], [5, 10], [5, 11], [6, 11], [6, 10], [7, 10], [7, 11]],
  [[10, 11], [10, 10], [10, 9], [11, 9], [11, 10], [11, 11]],
  [[8, 11], [9, 11], [8, 10], [9, 10], [8, 9], [9, 9], [8, 8], [9, 8], [10, 8], [10, 7], [11, 7], [11, 8]],
  [[10, 6], [11, 6], [10, 5], [11, 5], [10, 4], [11, 4], [10, 3]],
  [[11, 3], [11, 2], [11, 1], [10, 1], [10, 2], [9, 2], [9, 3], [9, 4], [8, 3], [8, 4], [8, 5]],
  [[9, 5], [9, 6], [9, 7], [8, 7], [8, 6], [7, 7], [7, 8], [7, 9], [6, 9], [6, 8], [5, 9]],
  [[9, 1], [8, 1], [8, 2], [7, 1], [6, 1]],
  [[7, 3], [6, 3], [5, 3], [5, 4], [6, 4], [7, 4]],
  [[7, 2], [6, 2], [5, 2], [5, 1], [4, 1], [3, 1]],
  [[2, 1], [2, 2], [3, 2], [4, 2], [3, 3], [4, 3], [2, 4], [3, 4], [4, 4], [2, 5], [1, 5], [1, 6], [2, 6], [1, 7], [2, 7], [3, 7], [1, 8], [1, 9]],
  [[3, 6], [3, 5], [4, 5], [4, 6], [4, 7]],
  [[5, 8], [4, 8], [3, 8], [2, 8], [2, 9], [3, 9], [4, 9]],
  [[5, 5], [5, 6], [5, 7], [6, 5], [6, 6], [6, 7], [7, 5], [7, 6]], // recovered 15th region
];
const REGIONS = REGION_COORDS.map(
  coords => coords.map(([r, c]) => makeCellId(r, c)));

const cellRegion = new Map();
REGIONS.forEach((cells, idx) => cells.forEach(cell => cellRegion.set(cell, idx)));

// --- Tetromino candidate enumeration ---------------------------------------
// Free-tetromino reference shapes (row/col offsets); canonicalized the same
// way as any candidate below, so shape identity is rotation/reflection
// invariant. O is intentionally absent: it is a 2x2 block, already
// forbidden globally by the no-2x2-shaded rule, so leaving it out of the
// per-region enumeration below prunes an already-impossible branch rather
// than narrowing the rule.
const SHAPE_REFS = {
  I: [[0, 0], [0, 1], [0, 2], [0, 3]],
  T: [[0, 0], [0, 1], [0, 2], [1, 1]],
  S: [[0, 1], [0, 2], [1, 0], [1, 1]],
  L: [[0, 0], [1, 0], [2, 0], [2, 1]],
};

function canonicalKey(points) {
  // Lexicographically smallest normalized point list over all 4 rotations x
  // 2 reflections -- the free-polyomino canonical form.
  let best = null;
  let base = points;
  for (let refl = 0; refl < 2; refl++) {
    let cur = base;
    for (let rot = 0; rot < 4; rot++) {
      const minR = Math.min(...cur.map(p => p[0]));
      const minC = Math.min(...cur.map(p => p[1]));
      const norm = cur
        .map(([r, c]) => [r - minR, c - minC])
        .sort((a, b) => (a[0] - b[0]) || (a[1] - b[1]));
      const key = norm.map(p => p.join(',')).join(';');
      if (best === null || key < best) best = key;
      cur = cur.map(([r, c]) => [c, -r]); // rotate 90 degrees
    }
    base = points.map(([r, c]) => [r, -c]); // reflect
  }
  return best;
}

const SHAPE_KEY_TO_NAME = Object.fromEntries(
  Object.entries(SHAPE_REFS).map(([name, pts]) => [canonicalKey(pts), name]));

function shapeOf(cellIds) {
  const points = cellIds.map(id => {
    const { row, col } = parseCellId(id);
    return [row, col];
  });
  return SHAPE_KEY_TO_NAME[canonicalKey(points)];
}

function isConnected(cellIds) {
  const set = new Set(cellIds);
  const seen = new Set([cellIds[0]]);
  const queue = [cellIds[0]];
  while (queue.length) {
    const cur = queue.pop();
    for (const n of graph.neighbours(cur)) {
      if (set.has(n) && !seen.has(n)) {
        seen.add(n);
        queue.push(n);
      }
    }
  }
  return seen.size === set.size;
}

function combinations4(arr) {
  const out = [];
  const n = arr.length;
  for (let a = 0; a < n; a++)
    for (let b = a + 1; b < n; b++)
      for (let c = b + 1; c < n; c++)
        for (let d = c + 1; d < n; d++)
          out.push([arr[a], arr[b], arr[c], arr[d]]);
  return out;
}

// Every valid tetromino placement within a region: a connected 4-cell
// subset classified as I/T/S/L (O excluded -- see header comment).
function tetrominoCandidates(regionCells) {
  return combinations4(regionCells)
    .filter(isConnected)
    .map(cells => ({ cells, shape: shapeOf(cells) }))
    .filter(({ shape }) => shape !== undefined);
}

// --- Shape-family state ----------------------------------------------------
// One Var per region holding which free-tetromino family (I/T/S/L) it
// shaded.
const SHAPE_ID = { I: 1, T: 2, S: 3, L: 4 };
const shapeVar = new Var('T', 'region tetromino shape', REGIONS.length);
const shapeDomain = shapeVar.cells().map(cell => new Given(cell, 1, 2, 3, 4));

// Per region: Or over every candidate tetromino, each branch restricting
// the region's shaded 4 cells to SHADED and its remaining cells to
// UNSHADED, and stamping the region's shape family.
function regionShadingConstraint(regionIdx, regionCells) {
  const shapeCell = shapeVar.cell(regionIdx + 1);
  const branches = tetrominoCandidates(regionCells).map(({ cells, shape }) => {
    const shadedSet = new Set(cells);
    const domainGivens = regionCells.map(cell => new Given(
      cell, shadedSet.has(cell) ? SHADED : UNSHADED));
    return new And([...domainGivens, new Given(shapeCell, SHAPE_ID[shape])]);
  });
  return new Or(branches);
}

const regionShading = REGIONS.map((cells, idx) => regionShadingConstraint(idx, cells));

// --- Global shading rules ---------------------------------------------------
// All shaded cells form one connected area of exactly 4 x 15 = 60 cells (one
// tetromino per region, and the regions above partition the whole grid).
const shadedConnectivity = new ConnectedValues('', SHADED, 4 * REGIONS.length);

// No 2x2 area may be entirely shaded: one NFA on a 2x2 block rejecting only
// the all-shaded case, replicated to every block origin. (The rules do not
// forbid a fully-unshaded 2x2, unlike some Nurikabe variants -- only shaded
// 2x2s are named.)
const no2x2ShadedMachine = NFA.encodeSpec({
  startState: { seen: [] },
  transition({ seen, done }, value) {
    if (done) return { done: true };
    const next = [...seen, value];
    if (next.length < 4) return { seen: next };
    return next.every(isShaded) ? undefined : { done: true };
  },
  accept: ({ done }) => done === true,
}, shape);
const blockOrigins = graph.cells().filter(cell => graph.block(cell, 2, 2));
const no2x2Shaded = graph.makeReplicate(
  new NFA(no2x2ShadedMachine, 'no-2x2-shaded', ...graph.block(graph.cells()[0], 2, 2)),
  blockOrigins,
);

// Same-shape tetrominoes may not share a border: for every grid-adjacent
// cell pair whose two cells fall in different regions, forbid "both shaded
// and the two regions' shape families match". One small NFA per boundary
// pair, reading [shaded(c1), shaded(c2), shapeVar(regionA), shapeVar(regionB)]
// in order. The first two reads short-circuit to an always-accepting "safe"
// state as soon as either cell is unshaded, since only a shaded/shaded pair
// can conflict; only then does it remember region A's shape and compare it
// against region B's.
function boundaryPairs() {
  const pairs = [];
  for (const cell of graph.cells()) {
    // Right and down only, so each adjacent pair is visited once.
    for (const [dr, dc] of [[0, 1], [1, 0]]) {
      const neighbour = graph.step(cell, dr, dc);
      if (!neighbour) continue;
      const ra = cellRegion.get(cell), rb = cellRegion.get(neighbour);
      if (ra !== rb) pairs.push([cell, neighbour, ra, rb]);
    }
  }
  return pairs;
}

const noSameShapeTouchMachine = NFA.encodeSpec({
  startState: { stage: 'start' },
  transition({ stage, shapeA }, value) {
    switch (stage) {
      case 'start': return { stage: isShaded(value) ? 'sawFirst' : 'safe' };
      case 'sawFirst': return { stage: isShaded(value) ? 'sawBoth' : 'safe' };
      case 'sawBoth': return { stage: 'gotShapeA', shapeA: value };
      case 'gotShapeA': return value === shapeA ? undefined : { stage: 'safe' };
      case 'safe': return { stage: 'safe' };
    }
  },
  accept: ({ stage }) => stage === 'safe',
}, shape);

const noSameShapeTouch = boundaryPairs().map(([c1, c2, ra, rb], i) => new NFA(
  noSameShapeTouchMachine, `no-same-shape-touch-${i}`,
  c1, c2, shapeVar.cell(ra + 1), shapeVar.cell(rb + 1)));

// --- Nurikabe islands --------------------------------------------------
// Five clues (transcribed from the payload's givens and its three "?" text
// overlays): two carry an island-size number, three leave the size
// unstated. VL is 0 (water, i.e. a shaded cell) or the 1-based index of
// the island (land) that reaches that cell.
const anchors = [
  { cell: 'R3C9', size: 7 },
  { cell: 'R6C6', size: 4 },
  { cell: 'R3C3', size: null },
  { cell: 'R9C3', size: null },
  { cell: 'R9C9', size: null },
];
const labelOf = i => i + 1;
const label = graph.makeOverlay('VL');
const gridCells = graph.cells();

// Every cell may hold water or any of the five island labels; connectivity,
// per-island sizing and the edge-agreement rule below (not this domain) are
// what actually confine each island to its true reach.
const labelDomains = [label.makeReplicate(
  new Given(label.at(gridCells[0]), WATER, ...anchors.map((_, i) => labelOf(i))),
  label.at(gridCells))];

// Each clue sits in its own island, so the five islands are distinct and
// every island holds exactly one clue.
const clueLabels = anchors.map(
  (anchor, i) => new Given(label.at(anchor.cell), labelOf(i)));

// Water is one connected region (60 cells, matching shadedConnectivity);
// each island label is its own connected class, sized where the clue gives
// a size and left open ("?") otherwise.
const connectivity = [
  new ConnectedValues('VL', WATER, 4 * REGIONS.length),
  ...anchors.map((anchor, i) => anchor.size === null
    ? new ConnectedValues('VL', labelOf(i))
    : new ConnectedValues('VL', labelOf(i), anchor.size)),
];

// Two adjacent land cells are in the same island by definition, which is
// what makes the label classes the islands (and is also what makes
// "two islands cannot touch" automatic -- see header comment).
const agreeOnLandKey = Pair.fnToKey(
  (a, b) => a === WATER || b === WATER || a === b, shape);
const oneIsland = [[0, 1], [1, 0]].map(([dRow, dCol]) => {
  const origin = gridCells[0];
  const starts = gridCells.filter(cell => graph.step(cell, dRow, dCol));
  return label.makeReplicate(
    new Pair(agreeOnLandKey, 'one island',
      label.at(origin), label.at(graph.step(origin, dRow, dCol))),
    label.at(starts));
});

// A cell is water on the VL layer exactly when it is shaded on the board.
const shadingAgreesKey = Pair.fnToKey(
  (l, b) => (l === WATER) === (b === SHADED), shape);
const shadingAgrees = gridCells.map(
  cell => new Pair(shadingAgreesKey, 'shading agrees', label.at(cell), cell));

return [
  shape,
  shapeVar,
  ...shapeDomain,
  ...regionShading,
  shadedConnectivity,
  no2x2Shaded,
  ...noSameShapeTouch,
  label.toVar('island'),
  ...labelDomains,
  ...clueLabels,
  ...connectivity,
  ...oneIsland,
  ...shadingAgrees,
];
