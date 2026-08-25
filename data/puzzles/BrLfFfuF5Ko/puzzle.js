// Title: LITSudoku
// Author: shye
// Video: https://www.youtube.com/watch?v=BrLfFfuF5Ko
// Source: https://app.crackingthecryptic.com/webapp/NmLdm7gjPB

// Rules encoded: normal sudoku over nine 9-cell jigsaw regions (not the
// default 3x3 boxes); classic LITS shading -- one tetromino (L, I, T or S)
// shaded per region, no 2x2 area entirely shaded, the same free-tetromino
// shape (rotations/reflections counted the same) may not touch orthogonally
// across two different regions' shaded cells, and all 36 shaded cells across
// the grid form one connected area; each region's own four shaded cells sum
// to the total printed in that region's corner. "Digits cannot repeat in a
// cage" is not a separate constraint: the four shaded cells always lie
// inside one 9-cell all-different region, so they are already distinct.
// The corner cell carrying a region's total is not claimed to be shaded --
// the Or below only pins the region's own 9 cells per candidate tetromino,
// never singles out the corner cell.
//
// Every tetromino candidate is enumerated directly from the region geometry
// below (a finite, per-region choice -- "Unknown Labelled Sets" / enumerable
// catalogue pattern), so the solver only ever picks among precomputed,
// shape-tagged options; it never has to discover a region's shape itself.
// The O tetromino is dropped from that enumeration: it is a 2x2 block, and
// the no-2x2-shaded rule already forbids it globally, so excluding it from
// the per-region Or prunes an already-impossible branch rather than
// narrowing the rule.

const GRID = '9x9';
const graph = cellGraph(GRID);
const geometry = graph.gridGeometry();

// --- Regions -----------------------------------------------------------
// The nine bold-outlined jigsaw regions, transcribed from the puzzle's own
// region layout (labelled A..I, row-major).
const REGIONS = [
  ['R1C1', 'R1C2', 'R1C3', 'R1C4', 'R2C1', 'R2C2', 'R2C3', 'R2C4', 'R3C2'], // A, total 16
  ['R1C5', 'R1C6', 'R1C7', 'R1C8', 'R2C5', 'R2C6', 'R3C3', 'R3C4', 'R3C5'], // B, total 23
  ['R1C9', 'R2C7', 'R2C8', 'R2C9', 'R3C6', 'R3C7', 'R3C8', 'R3C9', 'R4C6'], // C, total 13
  ['R3C1', 'R4C1', 'R5C1', 'R6C1', 'R7C1', 'R8C1', 'R8C2', 'R8C3', 'R8C4'], // D, total 13
  ['R4C2', 'R5C2', 'R5C3', 'R6C2', 'R6C3', 'R6C4', 'R7C2', 'R7C3', 'R7C4'], // E, total 15
  ['R4C3', 'R4C4', 'R4C5', 'R5C4', 'R5C5', 'R5C6', 'R5C7', 'R6C6', 'R6C7'], // F, total 13
  ['R4C7', 'R4C8', 'R5C8', 'R6C5', 'R6C8', 'R7C5', 'R7C6', 'R7C7', 'R7C8'], // G, total 12
  ['R4C9', 'R5C9', 'R6C9', 'R7C9', 'R8C5', 'R8C6', 'R8C7', 'R8C8', 'R8C9'], // H, total 22
  ['R9C1', 'R9C2', 'R9C3', 'R9C4', 'R9C5', 'R9C6', 'R9C7', 'R9C8', 'R9C9'], // I, total 28
];
const REGION_TOTAL = [16, 23, 13, 13, 15, 13, 12, 22, 28];

const cellRegion = new Map();
REGIONS.forEach((cells, idx) => cells.forEach(cell => cellRegion.set(cell, idx)));

// --- Tetromino candidate enumeration ------------------------------------
// Free-tetromino reference shapes (row/col offsets); canonicalized the same
// way as any candidate below, so shape identity is rotation/reflection
// invariant.
const SHAPE_REFS = {
  I: [[0, 0], [0, 1], [0, 2], [0, 3]],
  O: [[0, 0], [0, 1], [1, 0], [1, 1]],
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

// Every valid tetromino placement within a region: a connected 4-cell subset
// classified as I/T/S/L (O excluded -- see header comment).
function tetrominoCandidates(regionCells) {
  return combinations4(regionCells)
    .filter(isConnected)
    .map(cells => ({ cells, shape: shapeOf(cells) }))
    .filter(({ shape }) => shape !== 'O');
}

// --- Shade and shape-family state ---------------------------------------
const SHADED = 1;
const UNSHADED = 2;
const shade = graph.makeOverlay('VS');
const shadeDomain = shade.makeReplicate(
  new Given(shade.cells()[0], SHADED, UNSHADED));

// One Var per region holding which free-tetromino family (I/T/S/L) it
// shaded; only 9 cells, so a plain per-cell Given is clearer than a
// Replicate template here.
const SHAPE_ID = { I: 1, T: 2, S: 3, L: 4 };
const shapeVar = new Var('T', 'region tetromino shape', REGIONS.length);
const shapeDomain = shapeVar.cells().map(cell => new Given(cell, 1, 2, 3, 4));

// Per region: Or over every candidate tetromino, each branch pinning the
// region's 9 shade cells, stamping the region's shape family, and requiring
// the chosen 4 cells to sum to the region's printed total.
function regionConstraint(regionIdx, regionCells) {
  const shapeCell = shapeVar.cell(regionIdx + 1);
  const total = REGION_TOTAL[regionIdx];
  const branches = tetrominoCandidates(regionCells).map(({ cells, shape }) => {
    const shadedSet = new Set(cells);
    const shadeGivens = regionCells.map(cell => new Given(
      shade.at(cell), shadedSet.has(cell) ? SHADED : UNSHADED));
    const cageSum = new Sum(total, ...cells);
    return new And([...shadeGivens, new Given(shapeCell, SHAPE_ID[shape]), cageSum]);
  });
  return new Or(branches);
}

const regionShading = REGIONS.map((cells, idx) => regionConstraint(idx, cells));

// --- Global shading rules -------------------------------------------------
// All shaded cells form one connected area of exactly 4 x 9 = 36 cells.
const shadedConnectivity = new ConnectedValues('VS', SHADED, 4 * REGIONS.length);

// No 2x2 area may be entirely shaded: one NFA on a 2x2 block rejecting only
// the all-SHADED case, replicated to every block origin.
const no2x2ShadedMachine = NFA.encodeSpec({
  startState: { seen: [] },
  transition({ seen, done }, value) {
    if (done) return { done: true };
    const next = [...seen, value];
    if (next.length < 4) return { seen: next };
    return next.every(v => v === SHADED) ? undefined : { done: true };
  },
  accept: ({ done }) => done === true,
}, geometry.numValues);
const blockOrigins = graph.cells().filter(cell => graph.block(cell, 2, 2));
const no2x2Shaded = shade.makeReplicate(
  new NFA(no2x2ShadedMachine, 'no-2x2-shaded',
    ...shade.at(graph.block(graph.cells()[0], 2, 2))),
  shade.at(blockOrigins));

// Same-shape tetrominoes may not share a border: for every grid-adjacent
// cell pair whose two cells fall in different regions, forbid "both shaded
// and the two regions' shape families match". One small NFA per boundary
// pair, reading [shade(c1), shade(c2), shapeVar(regionA), shapeVar(regionB)]
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
      case 'start': return { stage: value === SHADED ? 'sawFirst' : 'safe' };
      case 'sawFirst': return { stage: value === SHADED ? 'sawBoth' : 'safe' };
      case 'sawBoth': return { stage: 'gotShapeA', shapeA: value };
      case 'gotShapeA': return value === shapeA ? undefined : { stage: 'safe' };
      case 'safe': return { stage: 'safe' };
    }
  },
  accept: ({ stage }) => stage === 'safe',
}, geometry.numValues);

const noSameShapeTouch = boundaryPairs().map(([c1, c2, ra, rb], i) => new NFA(
  noSameShapeTouchMachine, `no-same-shape-touch-${i}`,
  shade.at(c1), shade.at(c2), shapeVar.cell(ra + 1), shapeVar.cell(rb + 1)));

// --- Givens ---------------------------------------------------------------
// Transcribed from the puzzle's printed digits.
const givens = [
  new Given('R1C7', 9),
  new Given('R2C9', 8),
  new Given('R3C4', 2),
  new Given('R4C7', 5),
  new Given('R6C4', 8),
  new Given('R8C3', 3),
  new Given('R8C9', 1),
];

return [
  new Shape(GRID),
  new NoBoxes(),
  ...REGIONS.map(cells => new Jigsaw(GRID, ...cells)),
  ...givens,
  shade.toVar('shade'),
  shadeDomain,
  shapeVar,
  ...shapeDomain,
  ...regionShading,
  shadedConnectivity,
  no2x2Shaded,
  ...noSameShapeTouch,
];
