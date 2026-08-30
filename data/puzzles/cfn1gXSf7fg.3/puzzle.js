// Title: Castle Wall by Murat Can Tonta
// Author: Murat Can Tonta
// Video: https://www.youtube.com/watch?v=cfn1gXSf7fg
// Source: https://tinyurl.com/qlwrvlx

// Draw a single closed loop along grid edges, with no self-touch or
// crossing. Each cell is IN (enclosed by the loop) or OUT; the space beyond
// the grid's border is OUT. There are no sudoku digits: the grid carries
// only this IN/OUT side per cell, so it is built on a Raw shape.
// iss_solution is the 169-cell (13x13) IN/OUT grid, not a digit grid.
//
// Four clue cells (see BLACK_CELLS) are drawn shaded (surface colour 4, the
// payload's only fill colour) -- read as black (rule-forced OUT) since a
// fill is how the payload marks a colour-forced cell apart from a free one;
// no cell carries a heavy border (no white/forced-IN cells). The other ten
// clue cells are grey: free, exactly as printed for an ordinary cell.
//
// Each clue counts border crossings starting at its own cell and scanning
// straight to the far edge in its own arrow direction (DIRECTION_CODE below
// has the derivation). A "border crossed" is a boundary between two
// orthogonally adjacent, same-lane cells whose IN/OUT sides differ -- that
// boundary is exactly where the loop runs.
//
// Three cell borders are drawn bold (R8C3|R8C4, R8C4|R9C4, R2C10|R2C11):
// each is a given loop-boundary crossing, so the two cells it separates
// differ in IN/OUT side.

const N = 13;
const IN = 1;
const OUT = 2;
// CONCAVE (below) is a third code the grid cells never take; corner cells
// need it, so the shape is widened to 3 values and every grid cell is
// restricted back to {IN, OUT}.

const shape = new Shape(`${N}x${N}`, 3, 'Raw');
const graph = cellGraph(shape);
const numValues = graph.gridGeometry().numValues;
const gridCells = graph.cells();

const sideDomain = graph.makeReplicate(new Given(gridCells[0], IN, OUT));

// dircode -> (dRow, dCol). The source's own encoding doesn't name a
// direction, so this is pinned by arithmetic: for a clue of count n in
// direction d, the lane from the clue to the board edge in d (inclusive)
// must hold at least n+1 cells, or d is infeasible for that clue.
// Intersecting the feasible-direction sets across every clue sharing one
// dircode pins 0=up, 2=right, 3=down outright; code 1's own intersection is
// {left, right}, settled to left only because 2 already claims right (one
// dircode can't name two directions). Holds for board width 12, 13 or 14.
const DIRECTION_CODE = {
  0: [-1, 0], // up
  1: [0, -1], // left
  2: [0, 1],  // right
  3: [1, 0],  // down
};

// Clue table: [row, col], printed count, dircode, and whether the clue cell
// is black (shaded, forced OUT). Read directly off the source's
// "<count>_<dircode>" literal text per clue cell; the black cells are the
// four also carrying a surface fill (the payload's only fill colour). Row/col
// are plain numbers here (not cell-ID strings) because ISS cell IDs pack the
// coordinate into one base-17 character, so a two-digit row or column (e.g.
// column 10) is not literally "10" in the ID -- makeCellId(row, col) does
// that conversion below.
const CLUES = [
  [[2, 2], 1, 3, false],
  [[2, 10], 3, 3, false],
  [[2, 11], 6, 3, false],
  [[3, 3], 4, 2, false],
  [[4, 8], 5, 1, true],
  [[4, 9], 7, 3, true],
  [[6, 1], 7, 2, true],
  [[7, 6], 2, 0, true],
  [[8, 3], 3, 3, false],
  [[8, 4], 5, 0, false],
  [[9, 4], 7, 2, false],
  [[11, 6], 3, 1, false],
  [[12, 7], 0, 1, false],
  [[12, 12], 6, 0, false],
];
const cellOf = ([row, col]) => makeCellId(row, col);
const BLACK_CELLS = CLUES.filter(([, , , black]) => black).map(([rc]) => cellOf(rc));

// Given loop-boundary crossings (bold edges in the source): the two cells a
// bold edge separates are forced onto opposite sides.
const GIVEN_CROSSINGS = [
  [[8, 3], [8, 4]],
  [[8, 4], [9, 4]],
  [[2, 10], [2, 11]],
].map(([a, b]) => [cellOf(a), cellOf(b)]);

// --- Single loop: connected IN region, no hole, no self-touch --------------
// Standard corner-classification trick: a lattice corner is convex/plain/
// concave by how many of its (up to 4) cells are IN -- treating an off-grid
// cell as OUT -- and forbidding the diagonal 2-2 split at a true 2x2 corner
// rules out the loop crossing/touching itself. With the IN region connected,
// (convex - concave) = 4 forces exactly one hole-free loop; that sum is
// realised as 2*(corner count) - 4 over corner codes 1/2/3 -- see the Sum
// below.
const CONVEX = 1, PLAIN = 2, CONCAVE = 3;
const corner = cellGraph(`${N + 1}x${N + 1}`).makeOverlay('VC');
const cornerAt = (row, col) => corner.cells()[row * (N + 1) + col];

const cornerClass = inCount => (inCount === 1 ? CONVEX : inCount === 3 ? CONCAVE : PLAIN);

const cornerMachine = (arity, checkDiagonal) => NFA.encodeSpec({
  startState: { i: 0 },
  transition: (state, value) => {
    if (state.i === -1) return undefined;
    if (state.i === 0) return { i: 1, code: value, seen: [] };
    const seen = [...state.seen, value === IN];
    if (seen.length < arity) return { i: state.i + 1, code: state.code, seen };
    if (checkDiagonal) {
      const [topLeft, topRight, bottomLeft, bottomRight] = seen;
      if ((topLeft && bottomRight && !topRight && !bottomLeft)
        || (topRight && bottomLeft && !topLeft && !bottomRight)) return undefined;
    }
    return state.code === cornerClass(seen.filter(Boolean).length)
      ? { i: -1 } : undefined;
  },
  accept: ({ i }) => i === -1,
}, numValues);
const cornerMachines = new Map([2, 4].map(
  arity => [arity, cornerMachine(arity, arity === 4)]));
const gridCornerKey = Pair.fnToKey(
  (code, sv) => code === cornerClass(sv === IN ? 1 : 0), numValues);

const cornerCells = [];
const cornerCodes = [];
for (let row = 0; row <= N; row++) {
  for (let col = 0; col <= N; col++) {
    const around = [[row, col], [row, col + 1], [row + 1, col], [row + 1, col + 1]]
      .filter(([r, c]) => r >= 1 && r <= N && c >= 1 && c <= N)
      .map(([r, c]) => makeCellId(r, c));
    cornerCells.push(cornerAt(row, col));
    cornerCodes.push(around.length === 1
      ? new Pair(gridCornerKey, 'corner', cornerAt(row, col), around[0])
      : new NFA(cornerMachines.get(around.length), 'corner',
        cornerAt(row, col), ...around));
  }
}

const singleLoop = [
  new ConnectedValues('', IN),
  new Sum(2 * cornerCells.length - 4, ...cornerCells),
];

// --- Border-crossing count clues: reads a full lane (clue cell first, then
// every cell to the far edge in its own direction) and counts a crossing
// each time two consecutively-read cells differ. The target is baked into
// the machine per clue, clamped at target+1 so the state stays bounded.
const makeCrossingMachine = target => NFA.encodeSpec({
  startState: { started: false, prev: null, count: 0 },
  transition: ({ started, prev, count }, value) => {
    if (!started) return { started: true, prev: value, count: 0 };
    const hit = value !== prev ? 1 : 0;
    return { started: true, prev: value, count: Math.min(count + hit, target + 1) };
  },
  accept: ({ started, count }) => started && count === target,
}, numValues);

const crossingCounts = CLUES.map(([rc, count, dircode]) => {
  const [dRow, dCol] = DIRECTION_CODE[dircode];
  const lane = graph.ray(cellOf(rc), dRow, dCol);
  return new NFA(makeCrossingMachine(count), 'crossing count', ...lane);
});

const blackGivens = BLACK_CELLS.map(cell => new Given(cell, OUT));
const givenCrossings = GIVEN_CROSSINGS.map(([a, b]) => new AllDifferent(a, b));

return [
  shape,
  sideDomain,
  corner.toVar('loop corner type'),
  corner.makeReplicate(new Given(cornerCells[0], CONVEX, PLAIN, CONCAVE)),
  ...cornerCodes,
  ...singleLoop,
  ...crossingCounts,
  ...blackGivens,
  ...givenCrossings,
];
