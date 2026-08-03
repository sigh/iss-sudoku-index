// Title: Pi V squared Snake
// Author: Tulrak
// Video: https://www.youtube.com/watch?v=bsSlo44U2nw
// Source: https://app.crackingthecryptic.com/sudoku/b42FHr99Pf

// Rules encoded below:
//   Normal 9x9 sudoku. The killer cage (no repeats) shows its sum. Each outside
//   diagonal clue shows the sum of the cells on its short indicated diagonal.
//   Every orthogonally adjacent pair of cells summing to 5 is marked with a V,
//   and every such pair in the grid is marked (no unmarked pair may sum to 5).
//   Draw a 25-cell path of orthogonally connected cells that does not touch
//   itself, not even diagonally; read from one end (the head) to the other
//   (the tail), its digits are the first 25 digits of pi in order:
//   3,1,4,1,5,9,2,6,5,3,5,8,9,7,9,3,2,3,8,4,6,2,6,4,3. Neither end is marked in
//   the source, so the path's location, shape and orientation are all for the
//   solver to find.
//
// The snake is modelled as three parallel Var layers per cell (VP, VH, VL),
// built over the same grid geometry:
//   VP: OFF (not on the snake), START (the head, no predecessor), or which
//       orthogonal neighbour is this cell's predecessor (FROM_N/E/S/W).
//   VH, VL: the snake position as a two-digit base-5 counter, 0-indexed
//       (position = 5*(VH-1) + (VL-1)), meaningful only when VP != OFF. 25
//       positions need 26 states, over the 16-value cap for one Var layer, so
//       the count is split across two 5-valued layers instead of widening the
//       whole shape.
// The position pins the required pi digit directly (position i needs pi's
// (i+1)-th digit); the head is pinned to position 0 and, by the same equation
// propagated successor-to-successor, a cell whose own successor count is 0 is
// forced to hold position 24 -- so the chain can only close at length 25.

const PI_DIGITS = [
  3, 1, 4, 1, 5, 9, 2, 6, 5, 3, 5, 8, 9, 7, 9, 3, 2, 3, 8, 4, 6, 2, 6, 4, 3,
];

const graph = cellGraph('9x9');
const geometry = graph.gridGeometry();
const gridCells = graph.cells();

const vp = graph.makeOverlay('VP');
const vh = graph.makeOverlay('VH');
const vl = graph.makeOverlay('VL');

// --- VP codes -------------------------------------------------------------
const OFF = 1, START = 2, FROM_N = 3, FROM_E = 4, FROM_S = 5, FROM_W = 6;
const DIRS = [
  { code: FROM_N, dr: -1, dc: 0, back: FROM_S },
  { code: FROM_E, dr: 0, dc: 1, back: FROM_W },
  { code: FROM_S, dr: 1, dc: 0, back: FROM_N },
  { code: FROM_W, dr: 0, dc: -1, back: FROM_E },
];
const ON_CODES = [START, FROM_N, FROM_E, FROM_S, FROM_W];
const neighbourDirs = (cell) => DIRS.map(d => ({ ...d, cell: graph.step(cell, d.dr, d.dc) })).filter(d => d.cell);

// The tail (position 24, 0-indexed) is VH=5, VL=5: floor(24/5)+1 and 24%5+1.
const TAIL_VH = 5, TAIL_VL = 5;

// --- Domains: every cell may be off, the head, or arrive from any real
// neighbour; VH/VL each range over the five base-5 digits. ---
const pathDomains = gridCells.map(cell =>
  new Given(vp.at(cell), OFF, START, ...neighbourDirs(cell).map(d => d.code)));
const positionDomains = [
  vh.makeReplicate(new Given(vh.at(gridCells[0]), 1, 2, 3, 4, 5)),
  vl.makeReplicate(new Given(vl.at(gridCells[0]), 1, 2, 3, 4, 5)),
];

// --- No orthogonal touch / no branching: of two orthogonally adjacent cells,
// if both are on the snake, one must name the other as its predecessor. ---
const adjacentKey = (back) => Pair.fnToKey(
  (a, b) => a === OFF || b === OFF || b === back.into || a === back.outOf,
  geometry);
const noTouchOrth = [
  [0, 1, { into: FROM_W, outOf: FROM_E }],
  [1, 0, { into: FROM_N, outOf: FROM_S }],
].map(([dr, dc, back]) => {
  const anchors = gridCells.filter(c => graph.step(c, dr, dc));
  return vp.makeReplicate(
    new Pair(adjacentKey(back), 'adjacent pair',
      vp.at(anchors[0]), vp.at(graph.step(anchors[0], dr, dc))),
    vp.at(anchors));
});

// --- No diagonal touch: forbid a 2x2 block whose only on-snake cells are a
// diagonal pair (a genuine turn also lights the connecting orthogonal cell,
// so it never matches this exact pattern). ---
const noDiagonalTouchMachine = NFA.encodeSpec({
  startState: { block: [] },
  transition: ({ block }, vpVal) => {
    if (block === null) return { block: null };
    const next = [...block, vpVal !== OFF];
    if (next.length < 4) return { block: next };
    const [topLeft, topRight, bottomLeft, bottomRight] = next;
    const diagonalOnly =
      (topLeft && bottomRight && !topRight && !bottomLeft) ||
      (topRight && bottomLeft && !topLeft && !bottomRight);
    return diagonalOnly ? undefined : { block: null };
  },
  accept: ({ block }) => block === null,
}, geometry);
// Every 2x2 block is the same shifted template, so one Replicate covers them all.
const diagAnchors = gridCells.filter(cell => graph.block(cell, 2, 2));
const noDiagonalTouch = vp.makeReplicate(
  new NFA(noDiagonalTouchMachine, 'no-touch', ...vp.at(graph.block(diagAnchors[0], 2, 2))),
  vp.at(diagAnchors));

// --- Successor count: every on-snake cell has at most one successor (a
// neighbour whose predecessor pointer names it back). A cell with zero
// successors is loose only at the true tail, so it must hold position 24;
// an off-snake cell must have zero successors (nothing may point at it). ---
const successorSpecs = new Map();
const successorSpec = (backCodes) => {
  const key = backCodes.join(',');
  if (!successorSpecs.has(key)) {
    successorSpecs.set(key, NFA.encodeSpec({
      // i: 0 reads this cell's own VP, 1 its VH, 2 its VL; i>=3 reads each
      // neighbour's VP, counting matches against that neighbour's back code.
      startState: { i: 0 },
      transition: (state, v) => {
        if (state.i === 0) return { i: 1, on: v !== OFF };
        if (state.i === 1) return { i: 2, on: state.on, vh: v };
        if (state.i === 2) return { i: 3, on: state.on, vh: state.vh, vl: v, n: 0 };
        const idx = state.i - 3;
        const n = state.n + (v === backCodes[idx] ? 1 : 0);
        if (n > 1) return undefined;
        return { ...state, i: state.i + 1, n };
      },
      accept: (state) => {
        if (!state.on) return state.n === 0;
        if (state.n === 1) return true;
        return state.vh === TAIL_VH && state.vl === TAIL_VL;
      },
      maxDepth: 3 + backCodes.length,
    }, geometry));
  }
  return successorSpecs.get(key);
};
const successorCounts = gridCells.map(cell => {
  const dirs = neighbourDirs(cell);
  return new NFA(
    successorSpec(dirs.map(d => d.back)), 'successor count',
    vp.at(cell), vh.at(cell), vl.at(cell), ...vp.at(dirs.map(d => d.cell)));
});

// --- Exactly one head; the head's own position is 0. ---
const exactlyOneHead = new ContainExact(String(START), ...vp.at(gridCells));
const headPosKey = Pair.fnToKey((v, p) => v !== START || p === 1, geometry);
const headPosition = gridCells.flatMap(cell => [
  new Pair(headPosKey, 'head position', vp.at(cell), vh.at(cell)),
  new Pair(headPosKey, 'head position', vp.at(cell), vl.at(cell)),
]);

// --- Position propagation: a non-head on-snake cell's position is exactly
// one more than its predecessor's. Off-snake cells and the head are free
// (the head's position is already pinned above). ---
const positionEquation = (cell, predCell) => new Sum(
  1, [vh.at(cell), 5], [vl.at(cell), 1], [vh.at(predCell), -5], [vl.at(predCell), -1]);
const positionLinks = gridCells.map(cell => new Or([
  new Given(vp.at(cell), OFF),
  new Given(vp.at(cell), START),
  ...neighbourDirs(cell).map(d => new And([
    new Given(vp.at(cell), d.code),
    positionEquation(cell, d.cell),
  ])),
]));

// --- The digit at an on-snake cell's position must be the matching pi digit;
// off-snake cells are unconstrained. One shared lookup NFA, reused per cell. ---
const digitLinkMachine = NFA.encodeSpec({
  startState: { p: 0 },
  transition: (state, v) => {
    if (state.p === 0) return { p: v === OFF ? 'off' : 1 };
    if (state.p === 'off') return { p: 'off' };
    if (state.p === 1) return { p: 2, vh: v };
    if (state.p === 2) return { p: 3, vh: state.vh, vl: v };
    const idx = (state.vh - 1) * 5 + (state.vl - 1);
    return (idx >= 0 && idx < 25 && PI_DIGITS[idx] === v) ? { p: 'done' } : undefined;
  },
  accept: (state) => state.p === 'off' || state.p === 'done',
}, geometry);
const digitLinks = gridCells.map(cell => new NFA(
  digitLinkMachine, 'digit at position', vp.at(cell), vh.at(cell), vl.at(cell), cell));

// Single connected snake (redundant with the position arithmetic above, which
// already rules out a disjoint cycle or second chain, but pairs with the
// degree rules above and helps the solver prune).
const connectivity = new ConnectedValues('VP', ON_CODES);

// --- Killer cage, transcribed from the drawn cage. ---
const cage = new Cage(23, 'R1C1', 'R1C2', 'R2C1');

// --- Outside diagonal-sum clues. Each drawn arrow enters the grid at a
// corner cell and rays inward; the ray runs exactly to the far grid edge,
// so LittleKiller's own canonical diagonal (from that corner) is the clue. ---
const outsideDiagonals = [
  LittleKiller.fromCells(6, graph.ray('R9C7', -1, 1), geometry),
  LittleKiller.fromCells(15, graph.ray('R3C9', -1, -1), geometry),
];

// --- V clues: all pairs summing to 5 are marked, so every other orthogonal
// pair must not sum to 5. Marked edges transcribed from the drawn V overlays. ---
const V_EDGES = [
  ['R1C6', 'R1C7'],
  ['R4C7', 'R4C8'],
  ['R5C4', 'R5C5'],
  ['R6C3', 'R6C4'],
  ['R7C8', 'R7C9'],
  ['R2C2', 'R3C2'],
  ['R8C2', 'R9C2'],
  ['R2C3', 'R3C3'],
  ['R6C4', 'R7C4'],
  ['R1C7', 'R2C7'],
  ['R6C8', 'R7C8'],
  ['R1C9', 'R2C9'],
];
const edgeKey = ([a, b]) => [a, b].slice().sort().join('-');
const vEdgeSet = new Set(V_EDGES.map(edgeKey));
const notFiveKey = Pair.fnToKey((a, b) => a + b !== 5, geometry);
// One shifted Replicate template per direction covers every unmarked edge.
const notVReplicates = [[0, 1], [1, 0]].flatMap(([dr, dc]) => {
  const anchors = gridCells.filter(cell => {
    const other = graph.step(cell, dr, dc);
    return other && !vEdgeSet.has(edgeKey([cell, other]));
  });
  if (!anchors.length) return [];
  return [graph.makeReplicate(
    new Pair(notFiveKey, 'not V', anchors[0], graph.step(anchors[0], dr, dc)),
    anchors)];
});
const vClues = [
  ...V_EDGES.map(([a, b]) => new V(a, b)),
  ...notVReplicates,
];

return [
  new Shape('9x9'),
  vp.toVar('snake predecessor'),
  vh.toVar('snake position tens'),
  vl.toVar('snake position units'),
  ...pathDomains,
  ...positionDomains,
  ...noTouchOrth,
  noDiagonalTouch,
  ...successorCounts,
  exactlyOneHead,
  ...headPosition,
  ...positionLinks,
  ...digitLinks,
  connectivity,
  cage,
  ...outsideDiagonals,
  ...vClues,
];
