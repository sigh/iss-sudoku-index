// Title: Slitherlink
// Author: Prasanna Seshadri
// Video: https://www.youtube.com/watch?v=rk_JktFyguA
// Source: http://pzv.jp/p.html?slither/10/10/g183726bdc1dbb7360817cbb1cda6281725cdc1dcc737162d

// Slitherlink: draw a single non-self-intersecting loop along grid edges so
// that each numbered cell has exactly that many of its four edges on the
// loop; unmarked cells have no constraint on their edge count.
//
// Modelled as a per-cell "side" of the loop (Raw grid, no latin rules): each
// board cell holds IN (inside the loop) or OUT (outside), with everything
// off the 10x10 board fixed OUT. An edge is on the loop exactly when the two
// cells it separates differ in side -- so a clue's edge count is the number
// of its (up to four) neighbours, real or off-board, that differ from it.
// A single simple loop is then: the IN cells form one connected region
// (ConnectedValues) with no self-touch at a corner (no lattice point with
// only its diagonal pair IN) and no hole (corner-turning number sums to 4;
// see the corner-turn block below).

const IN = 1;
const OUT = 2;

// Turn-classification values exposed by the corner-turn NFAs below.
const CONCAVE = 1;   // -1 turn
const STRAIGHT = 2;  //  0 turn (or an excluded diagonal-touch pattern)
const CONVEX = 3;    // +1 turn

// Clue grid, transcribed verbatim from the source's own board layout
// (10x10 Slitherlink): '-' = no clue, otherwise the number of loop edges
// around that cell.
const BOARD = [
  '- 1 3 - 3 2 - 2 1 -',
  '1 - - 3 - - 2 - - 1',
  '3 - - 1 - - 1 - - 2',
  '- 3 1 - 0 3 - 1 2 -',
  '2 - - 1 - - 1 - - 1',
  '2 - - 3 - - 0 - - 1',
  '- 2 3 - 1 2 - 2 0 -',
  '2 - - 3 - - 2 - - 1',
  '3 - - 2 - - 2 - - 2',
  '- 3 2 - 1 1 - 2 3 -',
].map(row => row.split(' '));

const shape = new Shape('10x10', 3, 'Raw');
const graph = cellGraph('10x10');
const gridCells = graph.cells();

// Restrict every board cell to IN/OUT (the Shape is widened to 3 values so
// the corner-turn Vars below have a CONVEX state; the main grid itself only
// ever plays IN/OUT).
const gridDomain = graph.makeReplicate(new Given(gridCells[0], IN, OUT));

// One connected IN region: with no self-touch and no hole (below), this
// forces the boundary between IN and OUT to be a single simple loop.
const singleRegion = new ConnectedValues('', IN);

// --- No diagonal self-touch: forbid a 2x2 block whose only IN cells are a
// diagonal pair. Only interior lattice corners (all four cells on the board)
// can ever show this pattern -- a corner with an off-board slot always has
// that slot fixed OUT, so the "IN diagonal pair" can only be the two real
// cells, which are never diagonal to each other there.
const noDiagonalTouchSpec = NFA.encodeSpec({
  startState: { block: [] },
  transition: ({ block }, value) => {
    if (block === null) return { block: null };
    const next = [...block, value === IN];
    if (next.length < 4) return { block: next };
    const [topLeft, topRight, bottomLeft, bottomRight] = next;
    const diagonalOnly =
      (topLeft && bottomRight && !topRight && !bottomLeft) ||
      (topRight && bottomLeft && !topLeft && !bottomRight);
    return diagonalOnly ? undefined : { block: null };
  },
  accept: ({ block }) => block === null,
}, 3);
// All 81 interior corners run the same machine over a shifted 2x2 block, so
// one Replicate (template at R1C1) stands in for 81 separate NFA copies.
const noDiagonalTouchTemplate =
  new NFA(noDiagonalTouchSpec, 'no-touch', ...graph.block(gridCells[0], 2, 2));
const noDiagonalTouchTargets = gridCells.filter(cell => graph.block(cell, 2, 2));
const noDiagonalTouches =
  graph.makeReplicate(noDiagonalTouchTemplate, noDiagonalTouchTargets);

// --- Corner turning number: classify each of the 11x11 lattice corners as
// convex (exactly one of its up-to-four surrounding cells is IN), concave
// (exactly three), or straight/none (zero, two or four) -- an off-board
// slot is fixed OUT. One connected IN region (above) plus this sum equal to
// 4 forces zero holes, i.e. a simply-connected IN region whose boundary is
// exactly one loop.
// Each corner's classification is exposed through a trailing Var (read as
// the NFA's last symbol) so it can be totalled by the Sum below.
const turn = new Var('T', 'corner turn', 121);

const cornerSpecCache = new Map();
const getCornerSpec = (present) => {
  const key = present.join('');
  let spec = cornerSpecCache.get(key);
  if (spec) return spec;
  const order = [];
  for (let i = 0; i < 4; i++) if (present[i]) order.push(i);
  spec = NFA.encodeSpec({
    startState: { i: 0, flags: [false, false, false, false], done: false },
    transition: ({ i, flags, done }, value) => {
      // Exactly order.length + 1 symbols are ever fed (the real cells, then
      // the corner-turn Var); reject any further one so `i` cannot climb
      // past that and blow the compile-time state limit.
      if (done) return undefined;
      if (i < order.length) {
        const next = flags.slice();
        next[order[i]] = value === IN;
        return { i: i + 1, flags: next, done: false };
      }
      // Final symbol: the corner-turn Var. Compare it to the classification
      // computed from the (up to four) cells just read.
      const count = flags.filter(Boolean).length;
      const expected = count === 1 ? CONVEX : count === 3 ? CONCAVE : STRAIGHT;
      return value === expected ? { i: i + 1, flags, done: true } : undefined;
    },
    accept: (s) => s.done === true,
    maxDepth: order.length + 1,
  }, 3);
  cornerSpecCache.set(key, spec);
  return spec;
};

// The four actual corners of the board (top-left, top-right, bottom-left,
// bottom-right of the 10x10) have only one real cell against three fixed-OUT
// slots, so their classification collapses to a plain function of that one
// cell (IN -> convex, OUT -> none) -- a Pair, not a one-cell NFA.
const cornerPairKey = Pair.fnToKey(
  (realVal, turnVal) => turnVal === (realVal === IN ? CONVEX : STRAIGHT), 3);

const cornerTurns = [];
let cornerIndex = 0;
for (let i = 0; i <= 10; i++) {
  for (let j = 0; j <= 10; j++) {
    cornerIndex++;
    const hasTop = i >= 1, hasBottom = i <= 9;
    const hasLeftCol = j >= 1, hasRightCol = j <= 9;
    const present = [
      hasTop && hasLeftCol,    // top-left cell is (i, j)
      hasTop && hasRightCol,   // top-right cell is (i, j+1)
      hasBottom && hasLeftCol, // bottom-left cell is (i+1, j)
      hasBottom && hasRightCol,// bottom-right cell is (i+1, j+1)
    ];
    const realCells = [];
    if (present[0]) realCells.push(makeCellId(i, j));
    if (present[1]) realCells.push(makeCellId(i, j + 1));
    if (present[2]) realCells.push(makeCellId(i + 1, j));
    if (present[3]) realCells.push(makeCellId(i + 1, j + 1));
    const turnCell = turn.cell(cornerIndex);
    cornerTurns.push(realCells.length === 1
      ? new Pair(cornerPairKey, 'corner-turn', realCells[0], turnCell)
      : new NFA(getCornerSpec(present), 'corner-turn', ...realCells, turnCell));
  }
}
const cornerSum = new Sum(4 + 2 * turn.count, ...turn.cells());

// --- Clues: the count of a cell's (up to four) neighbours -- real or, fixed
// OUT, off-board -- that differ from its own side. Reads the cell's own side
// first, then each real neighbour, and adds one for each off-board side (a
// missing neighbour) only when the cell itself is IN (an OUT cell never
// differs from an off-board OUT neighbour).
const clueSpecCache = new Map();
const getClueSpec = (missingCount, target) => {
  const key = `${missingCount}:${target}`;
  let spec = clueSpecCache.get(key);
  if (spec) return spec;
  spec = NFA.encodeSpec({
    startState: { own: null, diff: 0 },
    transition: ({ own, diff }, value) => {
      if (own === null) return { own: value, diff: 0 };
      // Clamp: a real cell has at most 4 neighbours, so diff never needs to
      // exceed that -- keeps the compiled state count finite.
      return { own, diff: Math.min(diff + (value !== own ? 1 : 0), 4) };
    },
    accept: ({ own, diff }) => diff + (own === IN ? missingCount : 0) === target,
    maxDepth: 5, // own + up to four neighbours
  }, 3);
  clueSpecCache.set(key, spec);
  return spec;
};

const clues = [];
for (let r = 1; r <= 10; r++) {
  for (let c = 1; c <= 10; c++) {
    const token = BOARD[r - 1][c - 1];
    if (token === '-') continue;
    const cell = makeCellId(r, c);
    const neighbours = graph.neighbours(cell);
    const missingCount = 4 - neighbours.length;
    const target = +token;
    clues.push(new NFA(getClueSpec(missingCount, target), 'clue', cell, ...neighbours));
  }
}

return [
  shape,
  gridDomain,
  singleRegion,
  noDiagonalTouches,
  turn,
  ...cornerTurns,
  cornerSum,
  ...clues,
];
