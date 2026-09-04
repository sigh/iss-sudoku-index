// Title: LITS Battle (8x8 example)
// Author: AFrayedKnot
// Video: https://www.youtube.com/watch?v=aCEXiE9tYGg
// Source: https://sudokupad.app/b9GJQ2h4Nm

// Rules encoded, in full: classic LITS shading over the eight labelled
// regions below (one tetromino per region, no 2x2 area entirely shaded, the
// same free-tetromino shape may not touch orthogonally across two
// different regions, all shaded cells across the grid form one connected
// area) combined with Star Battle over the same regions plus every row and
// column (exactly one white star and one black star per house; a black
// star sits on a shaded cell, a white star on an unshaded cell; no two
// stars touch, including diagonally, regardless of colour).
//
// There is no Sudoku digit layer at all: the source's own answer-check
// alphabet is {1, 2, 8, 9} (1 = unstarred white, 2 = starred white,
// 8 = starred black, 9 = unstarred black), which is exactly the joint
// (shaded, starred) state used below -- so the board is built on a Raw
// shape widened to a 9-value alphabet with every cell's domain restricted
// to that 4-value set, and iss_solution is that literal {1,2,8,9} grid
// with no remapping.
//
// The eight regions are not a default box tiling: they are irregular
// pieces bounded by drawn interior walls, recovered by flood-filling the
// grid against those walls.

const WHITE_UNSTARRED = 1;
const WHITE_STARRED = 2;
const BLACK_STARRED = 8;
const BLACK_UNSTARRED = 9;
const CELL_VALUES = [WHITE_UNSTARRED, WHITE_STARRED, BLACK_STARRED, BLACK_UNSTARRED];
const UNSHADED_VALUES = [WHITE_UNSTARRED, WHITE_STARRED];
const SHADED_VALUES = [BLACK_STARRED, BLACK_UNSTARRED];
const isShaded = v => v === BLACK_STARRED || v === BLACK_UNSTARRED;
const isStarred = v => v === WHITE_STARRED || v === BLACK_STARRED;

const GRID = '8x8';
const shape = new Shape(GRID, 9, 'Raw');
const graph = cellGraph(shape);
const geometry = graph.gridGeometry();

// --- Regions -------------------------------------------------------------
// The eight wall-enclosed regions, transcribed from the puzzle's own drawn
// walls.
const REGIONS = [
  ['R4C7', 'R5C3', 'R5C4', 'R5C5', 'R5C6', 'R5C7', 'R6C4', 'R6C5', 'R6C6', 'R6C7', 'R7C4', 'R7C5', 'R7C7', 'R8C5'], // A
  ['R3C1', 'R3C2', 'R4C1', 'R4C2', 'R5C1', 'R5C2', 'R6C1', 'R6C2', 'R7C1', 'R7C2', 'R8C1'], // B
  ['R1C1', 'R1C2', 'R1C3', 'R2C1', 'R2C2', 'R2C3', 'R2C4', 'R3C3'], // C
  ['R2C5', 'R3C4', 'R3C5', 'R3C6', 'R4C3', 'R4C4', 'R4C5', 'R4C6'], // D
  ['R1C4', 'R1C5', 'R1C6', 'R1C7', 'R1C8', 'R2C6', 'R2C8'], // E
  ['R6C8', 'R7C6', 'R7C8', 'R8C6', 'R8C7', 'R8C8'], // F
  ['R2C7', 'R3C7', 'R3C8', 'R4C8', 'R5C8'], // G
  ['R6C3', 'R7C3', 'R8C2', 'R8C3', 'R8C4'], // H
];

const cellRegion = new Map();
REGIONS.forEach((cells, idx) => cells.forEach(cell => cellRegion.set(cell, idx)));

// --- Tetromino candidate enumeration --------------------------------------
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
// shaded; only 8 cells, so a plain per-cell Given is clearer than a
// Replicate template here.
const SHAPE_ID = { I: 1, T: 2, S: 3, L: 4 };
const shapeVar = new Var('T', 'region tetromino shape', REGIONS.length);
const shapeDomain = shapeVar.cells().map(cell => new Given(cell, 1, 2, 3, 4));

// Per region: Or over every candidate tetromino, each branch restricting
// the region's shaded 4 cells to the shaded value pair {8, 9} and its
// remaining cells to the unshaded value pair {1, 2}, and stamping the
// region's shape family. Whether a shaded/unshaded cell also carries a star
// is left open here; the star ContainExact constraints below pin that.
function regionShadingConstraint(regionIdx, regionCells) {
  const shapeCell = shapeVar.cell(regionIdx + 1);
  const branches = tetrominoCandidates(regionCells).map(({ cells, shape }) => {
    const shadedSet = new Set(cells);
    const domainGivens = regionCells.map(cell => new Given(
      cell, ...(shadedSet.has(cell) ? SHADED_VALUES : UNSHADED_VALUES)));
    return new And([...domainGivens, new Given(shapeCell, SHAPE_ID[shape])]);
  });
  return new Or(branches);
}

const regionShading = REGIONS.map((cells, idx) => regionShadingConstraint(idx, cells));

// --- Global shading rules --------------------------------------------------
// Every board cell's domain is the puzzle's own 4-value alphabet (the
// Or branches above already restrict each cell to one 2-value half of it,
// but the alphabet has holes in the widened 1-9 range, which needs an
// explicit Given per cell regardless of what else pins it).
const domainRestriction = graph.makeReplicate(
  new Given(graph.cells()[0], ...CELL_VALUES), graph.cells());

// All shaded cells (values 8 or 9) form one connected area of exactly
// 4 x 8 = 32 cells.
const shadedConnectivity = new ConnectedValues('', SHADED_VALUES, 4 * REGIONS.length);

// No 2x2 area may be entirely shaded: one NFA on a 2x2 block rejecting only
// the all-shaded case, replicated to every block origin.
const no2x2ShadedMachine = NFA.encodeSpec({
  startState: { seen: [] },
  transition({ seen, done }, value) {
    if (done) return { done: true };
    const next = [...seen, value];
    if (next.length < 4) return { seen: next };
    return next.every(isShaded) ? undefined : { done: true };
  },
  accept: ({ done }) => done === true,
}, geometry.numValues);
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
}, geometry.numValues);

const noSameShapeTouch = boundaryPairs().map(([c1, c2, ra, rb], i) => new NFA(
  noSameShapeTouchMachine, `no-same-shape-touch-${i}`,
  c1, c2, shapeVar.cell(ra + 1), shapeVar.cell(rb + 1)));

// --- Star Battle -----------------------------------------------------------
// Exactly one white star (value 2) and one black star (value 8) in every
// row, column and region: ContainExact("2_8", ...) requires exactly one
// occurrence of each, leaving the other cells' 1/9 split (which the
// shading branches above already pinned) untouched.
const starHouses = [...graph.rows(), ...graph.columns(), ...REGIONS]
  .map(house => new ContainExact(`${WHITE_STARRED}_${BLACK_STARRED}`, ...house));

// No two stars touch, including diagonally: for every king-move edge, not
// both cells are starred. One Replicate per offset stamps the relation over
// every edge at that offset; the anti-diagonal offset needs the explicit
// target-cell encoding below rather than graph.makeReplicate, whose origin
// anchor would shift a template cell off the board.
const notBothStars = Pair.fnToKey((a, b) => !(isStarred(a) && isStarred(b)), shape);
const KING_OFFSETS = [[0, 1], [1, 0], [1, 1], [1, -1]];
const noTouch = KING_OFFSETS.map(([dRow, dCol]) => {
  const targets = graph.cells().filter(cell => graph.step(cell, dRow, dCol) !== null);
  const origin = targets[0];
  const neighbour = graph.step(origin, dRow, dCol);
  return new Replicate(
    [new Pair(notBothStars, 'stars do not touch', origin, neighbour)],
    Replicate.encodeTargetCells(targets, origin, graph),
    origin,
  );
});

return [
  shape,
  domainRestriction,
  shapeVar,
  ...shapeDomain,
  ...regionShading,
  shadedConnectivity,
  no2x2Shaded,
  ...noSameShapeTouch,
  ...starHouses,
  ...noTouch,
];
