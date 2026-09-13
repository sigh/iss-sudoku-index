// Title: Slitherlink:  The Puzzle You've Requested For 2 Years! (1)
// Author: Thomas Snyder
// Video: https://www.youtube.com/watch?v=Nz5t_M77ATg
// Source: http://pzv.jp/p.html?slither/9/9/p3087cj5c2068co8733b8aj8733bn

// Rules encoded here:
//  Draw a single loop along the grid's edges (connecting adjacent lattice
//  points) that never crosses or touches itself. A number in a cell counts
//  how many of that cell's four edges the loop uses.
// Nothing is omitted.
//
// There is no digit layer at all, so this uses the Raw grid type: every grid
// cell holds the "side" of the loop it sits on -- IN (inside the loop) or OUT
// (outside it) -- and a grid edge is used by the loop exactly when the two
// cells it separates disagree. The grid's own outer border always faces OUT
// (nothing lies beyond it). The alphabet is widened to 3 only so the corner
// Var group below (which needs a third value) fits the same Shape; every
// playable grid cell is restricted straight back down to {IN, OUT}.
//
// A single non-self-touching loop is then exactly:
//  1. The IN cells form one connected region (the loop's interior) --
//     ConnectedValues. An empty region is rejected by the constraint itself,
//     which is correct: every loop encloses some area.
//  2. No lattice corner has exactly two IN cells placed diagonally opposite
//     each other in its surrounding 2x2 block -- that configuration is the
//     loop passing through one point twice, i.e. touching itself.
//  3. The classic turning-number identity for a simple closed curve: summing
//     +1 at every lattice corner with exactly one of its (up to four)
//     surrounding cells IN, -1 at every corner with exactly three, and 0
//     elsewhere, must total exactly 4. For one connected IN region (already
//     forced by rule 1) this total is 4*(1 - holes), so requiring 4 forces
//     zero holes -- i.e. rules out a second, inner loop nested inside the
//     first, which rule 1 alone does not exclude (an annulus-shaped IN region
//     is connected and non-self-touching but traces two loops, not one).
//     Only the border-adjacency and diagonal-touch facts above are needed to
//     derive the corner's IN count; missing (off-grid) quadrants always count
//     as OUT, matching rule (1)'s "outer border faces OUT".

const IN = 1;
const OUT = 2;
const ROWS = 9, COLS = 9;

const shape = new Shape('9x9', 3, 'Raw');
const graph = cellGraph(shape);
const geometry = graph.gridGeometry();

// Clue numbers, transcribed from the source's `clues` array (r, c already
// 1-indexed to match makeCellId). Cells with no printed clue are absent.
const CLUES = [
  ['R2C2', 3], ['R2C3', 0], ['R2C4', 3], ['R2C6', 2], ['R2C8', 2],
  ['R3C6', 0], ['R3C8', 2],
  ['R4C2', 2], ['R4C3', 0], ['R4C4', 1], ['R4C6', 3], ['R4C8', 2],
  ['R6C2', 3], ['R6C4', 2], ['R6C6', 3], ['R6C7', 3], ['R6C8', 1],
  ['R7C2', 3], ['R7C4', 0],
  ['R8C2', 3], ['R8C4', 2], ['R8C6', 3], ['R8C7', 3], ['R8C8', 1],
];

const gridCells = graph.cells();

// Every playable cell is IN or OUT (the widened third value is only for the
// corner Vars below), stamped once and replicated over the whole grid.
const domainRestriction = graph.makeReplicate(new Given(gridCells[0], IN, OUT));

// --- Rule 1: the IN cells are one connected region (the loop's inside). ---
const connected = new ConnectedValues('', IN);

// --- Rule 2: no self-touching corner. ---
// A lattice corner's surrounding 2x2 block, read top-left, top-right,
// bottom-left, bottom-right; only interior corners (i, j in 1..8) have all
// four quadrants on the grid, so only those can even have a diagonal pair.
const noTouchMachine = NFA.encodeSpec({
  startState: { block: [] },
  transition: ({ block }, value) => {
    if (block === null) return { block: null };
    const next = [...block, value === IN];
    if (next.length < 4) return { block: next };
    const [tl, tr, bl, br] = next;
    const diagonalOnly =
      (tl && br && !tr && !bl) || (tr && bl && !tl && !br);
    return diagonalOnly ? undefined : { block: null };
  },
  accept: ({ block }) => block === null,
}, geometry.numValues);
// One machine, stamped at every top-left cell whose 2x2 block stays on the
// grid (r, c in 1..8) and replicated there.
const blockOrigins = gridCells.filter(cell => graph.block(cell, 2, 2));
const noTouchTemplate = new NFA(noTouchMachine, 'no-self-touch',
  ...graph.block(gridCells[0], 2, 2));
const noTouches = graph.makeReplicate(noTouchTemplate, blockOrigins);

// --- Rule 3: turning-number total. ---
// Every lattice point (i, j), i and j each 0..9 (10x10 = 100 points), reads
// the up-to-four cells that meet there; a cell outside the 1..9 range is
// dropped rather than read, since it always counts as OUT.
const corners = [];
for (let i = 0; i <= ROWS; i++) {
  for (let j = 0; j <= COLS; j++) {
    const quads = [[i, j], [i, j + 1], [i + 1, j], [i + 1, j + 1]]
      .filter(([r, c]) => r >= 1 && r <= ROWS && c >= 1 && c <= COLS)
      .map(([r, c]) => makeCellId(r, c));
    corners.push(quads);
  }
}

// One Var per lattice point holding its turning contribution as a code
// (CONVEX=3 means +1, NONE=2 means 0, CONCAVE=1 means -1), so the total is
// read by a native Sum instead of a hand-summed running total.
const CONCAVE = 1, NONE = 2, CONVEX = 3;
const cornerVars = new Var('K', 'cornerTurn', corners.length);

// Reads the corner's real quadrant cells, counts how many are IN (a missing
// quadrant is OUT and never counted), then requires the final symbol -- the
// corner's own Var -- to spell the resulting code.
const cornerMachineCache = new Map();
const cornerMachine = (numReal) => {
  if (!cornerMachineCache.has(numReal)) {
    cornerMachineCache.set(numReal, NFA.encodeSpec({
      startState: null,
      transition(state, value) {
        if (state === null) {
          return { count: value === IN ? 1 : 0, remaining: numReal - 1 };
        }
        if (state.done) return undefined; // no more symbols expected past the code
        const { count, remaining } = state;
        if (remaining === 0) {
          const contribution = count === 1 ? CONVEX : count === 3 ? CONCAVE : NONE;
          return value === contribution ? { done: true } : undefined;
        }
        return { count: count + (value === IN ? 1 : 0), remaining: remaining - 1 };
      },
      accept: (state) => state !== null && state.done === true,
    }, geometry.numValues));
  }
  return cornerMachineCache.get(numReal);
};

// A 1-quadrant corner (the grid's own four corners) can only ever be
// none/convex, a plain 2-cell relation -- Pair instead of a 1-cell NFA.
const cornerPairKey = Pair.fnToKey(
  (quad, code) =>
    (quad === IN && code === CONVEX) || (quad === OUT && code === NONE),
  geometry.numValues);

const cornerConstraints = corners.map((quads, idx) => {
  const codeCell = cornerVars.cell(idx + 1);
  return quads.length === 1
    ? new Pair(cornerPairKey, 'corner-turn', quads[0], codeCell)
    : new NFA(cornerMachine(quads.length), 'corner-turn', ...quads, codeCell);
});

// sum(code - 2) = 4  <=>  sum(code) = 4 + 2*100 = 204.
const turningTotal = new Sum(4 + 2 * corners.length, ...cornerVars.cells());

// --- Clue numbers: count of on-loop edges around a clued cell. ---
// Reads the clued cell's own side, then each real orthogonal neighbour's;
// a missing (off-grid) neighbour's edge is on-loop exactly when the clued
// cell itself is IN (the border faces OUT), so it is added as a fixed base
// rather than read.
const clueMachineCache = new Map();
const clueMachine = (target, missing, numReal) => {
  const key = target + '_' + missing;
  if (!clueMachineCache.has(key)) {
    clueMachineCache.set(key, NFA.encodeSpec({
      startState: null,
      transition(state, value) {
        if (state === null) {
          return { own: value, count: value === IN ? missing : 0, remaining: numReal };
        }
        if (state.done) return undefined; // no more symbols expected past the last neighbour
        const { own, count, remaining } = state;
        const next = count + (value === own ? 0 : 1);
        if (remaining === 1) {
          return next === target ? { done: true } : undefined;
        }
        return { own, count: next, remaining: remaining - 1 };
      },
      accept: (state) => state !== null && state.done === true,
    }, geometry.numValues));
  }
  return clueMachineCache.get(key);
};

const clueConstraints = CLUES.map(([cell, target]) => {
  const neighbours = graph.neighbours(cell);
  const missing = 4 - neighbours.length;
  return new NFA(clueMachine(target, missing, neighbours.length), 'edge-count',
    cell, ...neighbours);
});

return [
  shape,
  domainRestriction,
  cornerVars,
  connected,
  noTouches,
  ...cornerConstraints,
  turningTotal,
  ...clueConstraints,
];
