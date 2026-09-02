// Title: U-Turns
// Author: Eric Fox
// Video: https://www.youtube.com/watch?v=XAn4PzLRauM
// Source: https://tinyurl.com/48wx9su7

// Rules: draw a non-intersecting path through the centres of some cells which
// passes through every white circle and no black circles. Grey circles mark the
// ends of the path. Between each pair of circles the path uses, the path must
// turn exactly twice, and both turns must be in the same direction.
//
// Omitted: which of the two non-grey circle groups is white and which is black.
// The drawing stores each circle's colour as a numeric fill id (grey = 9 at the
// two path ends, and 7 circles each at ids 8 and 2), and nothing available maps
// those ids to named colours. The encoding therefore disjoins over the two
// possible assignments instead of committing to one, so it admits both puzzles.
//
// The grid carries no digits. The board itself is the path layer: each cell
// holds a shape code saying which of its four edges the path uses.

const OFF = 1, HORIZ = 2, VERT = 3, UL = 4, UR = 5, DL = 6, DR = 7;
const UP = 0, RIGHT = 1, DOWN = 2, LEFT = 3;   // clockwise, so +1 is a right turn
const SHAPE_DIRS = {
  [OFF]: [], [HORIZ]: [LEFT, RIGHT], [VERT]: [UP, DOWN],
  [UL]: [UP, LEFT], [UR]: [UP, RIGHT], [DL]: [DOWN, LEFT], [DR]: [DOWN, RIGHT],
};
const ALL_SHAPES = [OFF, HORIZ, VERT, UL, UR, DL, DR];
const STEP = { [UP]: [-1, 0], [RIGHT]: [0, 1], [DOWN]: [1, 0], [LEFT]: [0, -1] };

// Predecessor overlay: which of its own edges a path cell entered through.
const PNONE = 1;
const P_OF = { [UP]: 2, [RIGHT]: 3, [DOWN]: 4, [LEFT]: 5 };
const DIR_OF_P = { 2: UP, 3: RIGHT, 4: DOWN, 5: LEFT };

// Turn accumulator overlay: turns made since the last circle, with their
// handedness. A2L/A2R are the two states a segment must be in when it reaches
// the next circle.
const AOFF = 1, A0 = 2, A1L = 3, A1R = 4, A2L = 5, A2R = 6;
const advance = (a, turn) => {
  if (a === AOFF) return undefined;
  if (turn === 0) return a;                                  // straight on
  if (turn === 1) return a === A0 ? A1R : a === A1R ? A2R : undefined;
  if (turn === 3) return a === A0 ? A1L : a === A1L ? A2L : undefined;
  return undefined;                                          // a reversal
};

// Position counters mod 8 and mod 9: consecutive along the path, so a closed
// loop would need its length divisible by both. lcm(8, 9) = 72 > 64 cells, so
// no loop can be numbered and the used cells are forced to be one open path.
const NB = 8, BOFF = NB + 1;
const NC = 9, COFF = NC + 1;

const boardShape = new Shape('8x8', `1-${COFF}`, 'Raw');
const graph = cellGraph(boardShape);
const geometry = graph.gridGeometry();
const gridCells = graph.cells();
const pred = graph.makeOverlay('VP');
const acc = graph.makeOverlay('VA');
const posB = graph.makeOverlay('VB');
const posC = graph.makeOverlay('VC');

// Circles, transcribed from the drawing's 16 large circles by fill id:
// id 9 (grey, the two path ends), then the two unidentified groups.
const GREY = ['R1C1', 'R8C8'];
const GROUP_8 = ['R2C1', 'R2C3', 'R2C7', 'R5C3', 'R5C6', 'R5C7', 'R6C5'];
const GROUP_2 = ['R3C4', 'R4C2', 'R4C3', 'R4C6', 'R7C2', 'R7C6', 'R7C8'];
const isCircle = new Set([...GREY, ...GROUP_8, ...GROUP_2]);

// The two path ends are given a single edge leaving the grid, so every path cell
// -- ends included -- uses exactly two edges and needs no separate degree-1
// codes. R1C1 exits upwards and R8C8 downwards; both are grid corners, so the
// choice only fixes which end the traversal starts from.
const VIRTUAL_EDGE = { R1C1: UP, R8C8: DOWN };

const inGrid = (cell, dir) => graph.step(cell, ...STEP[dir]) !== null;
const edgeExists = (cell, dir) => inGrid(cell, dir) || VIRTUAL_EDGE[cell] === dir;
const shapeDomain = (cell) => ALL_SHAPES.filter(s =>
  SHAPE_DIRS[s].every(d => edgeExists(cell, d)) &&
  (VIRTUAL_EDGE[cell] === undefined || SHAPE_DIRS[s].includes(VIRTUAL_EDGE[cell])));

// The board alphabet is widened to 10 so the mod-9 counter fits, so every layer
// holds values its own rule never uses. Each Var cell is given its layer's
// domain, and the machines below reject an out-of-domain value rather than
// reading it, since NFA compilation walks the whole alphabet.
const MAX = { shape: DR, pred: P_OF[LEFT], acc: A2R, posB: BOFF, posC: COFF };

// --- Per cell: the four overlays agree about whether the cell is on the path.
const offAgree = NFA.encodeSpec({
  startState: { phase: 0 },
  transition: ({ phase, on, done }, value) => {
    if (done) return undefined;   // the machine reads exactly its four cells
    if (phase === 0) {
      return value > MAX.shape ? undefined : { phase: 1, on: value !== OFF };
    }
    const [limit, sentinel] = phase === 1 ? [MAX.acc, AOFF]
      : phase === 2 ? [MAX.posB, BOFF] : [MAX.posC, COFF];
    if (value > limit || on !== (value !== sentinel)) return undefined;
    return phase === 3 ? { done: true } : { phase: phase + 1, on };
  },
  accept: ({ done }) => done === true,
}, geometry);

// --- Per cell: the predecessor edge must be one the cell's shape actually uses,
// and an off-path cell names no predecessor.
const predUsesEdge = Pair.fnToKey((sh, p) => {
  if (sh > MAX.shape || p > MAX.pred) return false;
  if (sh === OFF) return p === PNONE;
  return p !== PNONE && SHAPE_DIRS[sh].includes(DIR_OF_P[p]);
}, geometry);

const upTo = (limit) => Array.from({ length: limit }, (_, i) => i + 1);
const domains = [[pred, MAX.pred], [acc, MAX.acc], [posB, MAX.posB]].map(
  ([overlay, limit]) => overlay.makeReplicate(
    new Given(overlay.at(gridCells[0]), ...upTo(limit))));

const cellRules = gridCells.flatMap(cell => [
  new Given(cell, ...shapeDomain(cell)),
  new NFA(offAgree, 'on-path-agree', cell, acc.at(cell), posB.at(cell), posC.at(cell)),
  new Pair(predUsesEdge, 'pred-edge', cell, pred.at(cell)),
]);

// --- Per adjacent pair: the two cells agree on whether their shared edge is
// used, and a used edge is claimed as a predecessor edge by exactly one of its
// two cells. That gives every path cell one predecessor and one successor, so
// the used cells form disjoint chains and loops; the counters below remove the
// loops and the pinned start below removes the reversed traversal.
const memo = (fn) => { const m = new Map(); return k => (m.has(k) ? m : m.set(k, fn(k))).get(k); };
const structure = memo((key) => {
  const [dXY, dYX] = key.split(',').map(Number);
  return NFA.encodeSpec({
    startState: { phase: 0 },
    transition: ({ phase, used, claimedX, done }, value) => {
      if (done) return undefined;
      if (phase < 2 && value > MAX.shape) return undefined;
      if (phase >= 2 && value > MAX.pred) return undefined;
      if (phase === 0) return { phase: 1, used: SHAPE_DIRS[value].includes(dXY) };
      if (phase === 1) {
        return SHAPE_DIRS[value].includes(dYX) === used ? { phase: 2, used } : undefined;
      }
      if (phase === 2) return { phase: 3, used, claimedX: value === P_OF[dXY] };
      const claims = (claimedX ? 1 : 0) + (value === P_OF[dYX] ? 1 : 0);
      return claims === (used ? 1 : 0) ? { done: true } : undefined;
    },
    accept: ({ done }) => done === true,
  }, geometry);
});

// --- Per adjacent pair, per direction: when Y names X as its predecessor, the
// turn accumulator and both position counters step from X to Y. Reading
// [P(Y), S(Y), A(X), A(Y), B(X), B(Y), C(X), C(Y)] lets each pair of values
// collapse back to "inactive or one required value", keeping the machine small.
// Arriving at a circle demands the segment made its two same-handed turns and
// restarts the count; the circle's own turn, being at a circle rather than
// between two of them, is charged to neither segment.
const propagate = memo((key) => {
  const [dXY, dYX, circleY] = key.split(',');
  const dIn = Number(dXY), entry = Number(dYX), isCircleY = circleY === '1';
  return NFA.encodeSpec({
    startState: { phase: 0 },
    transition: (state, value) => {
      const { phase, active } = state;
      if (state.done) return undefined;
      if (phase === 0) {
        return value > MAX.pred ? undefined : { phase: 1, active: value === P_OF[entry] };
      }
      if (!active) return phase === 7 ? { done: true } : { phase: phase + 1, active: false };
      if (phase === 1) {
        if (value > MAX.shape) return undefined;
        const dirs = SHAPE_DIRS[value];
        if (!dirs.includes(entry)) return undefined;
        const exit = dirs.find(d => d !== entry);
        if (exit === undefined) return undefined;
        const turn = (exit - dIn + 4) % 4;
        return turn === 2 ? undefined : { phase: 2, active: true, turn };
      }
      if (phase === 2) {
        if (value > MAX.acc) return undefined;
        if (isCircleY) {
          if (value !== A2L && value !== A2R) return undefined;
          return { phase: 3, active: true, required: A0 };
        }
        const next = advance(value, state.turn);
        return next === undefined ? undefined : { phase: 3, active: true, required: next };
      }
      if (phase === 4 || phase === 6) {
        const modulus = phase === 4 ? NB : NC;
        if (value > modulus) return undefined;             // the off-path sentinel
        return { phase: phase + 1, active: true, required: (value % modulus) + 1 };
      }
      // phases 3, 5, 7 check the value the previous read determined.
      if (value !== state.required) return undefined;
      return phase === 7 ? { done: true } : { phase: phase + 1, active: true };
    },
    accept: ({ done }) => done === true,
  }, geometry);
});

const OVERLAYS = [acc, posB, posC];
const interleave = (from, to) => OVERLAYS.flatMap(o => [o.at(from), o.at(to)]);

const pairRules = gridCells.flatMap(cell => {
  return [[RIGHT, LEFT], [DOWN, UP]].flatMap(([dXY, dYX]) => {
    const other = graph.step(cell, ...STEP[dXY]);
    if (other === null) return [];
    return [
      new NFA(structure(`${dXY},${dYX}`), 'edge-join',
        cell, other, pred.at(cell), pred.at(other)),
      new NFA(propagate(`${dXY},${dYX},${isCircle.has(other) ? 1 : 0}`), 'step-fwd',
        pred.at(other), other, ...interleave(cell, other)),
      new NFA(propagate(`${dYX},${dXY},${isCircle.has(cell) ? 1 : 0}`), 'step-back',
        pred.at(cell), cell, ...interleave(other, cell)),
    ];
  });
});

// --- The traversal starts at R1C1: its predecessor edge is the one leaving the
// grid, and its counters are seeded there. Both pin artefacts of this encoding
// (a direction and an origin for the numbering), not anything the rules leave
// open -- without them each solution appears once reversed and once per counter
// offset.
const seam = [
  new Given(pred.at('R1C1'), P_OF[VIRTUAL_EDGE['R1C1']]),
  new Given(acc.at('R1C1'), A0),
  new Given(posB.at('R1C1'), 1),
  new Given(posC.at('R1C1'), 1),
  new Given(pred.at('R8C8'), ...Object.values(P_OF)
    .filter(p => p !== P_OF[VIRTUAL_EDGE['R8C8']])),
];

// --- The circles. Grey ends are on the path by their shape domains above. One
// of the remaining groups is white (every circle on the path) and the other
// black (every circle off it); the drawing does not say which way round.
const onPath = (cell) => new Given(cell, ...shapeDomain(cell).filter(s => s !== OFF));
const offPath = (cell) => new Given(cell, OFF);
const colouring = new Or([
  new And([...GROUP_8.map(onPath), ...GROUP_2.map(offPath)]),
  new And([...GROUP_2.map(onPath), ...GROUP_8.map(offPath)]),
]);

return [
  boardShape,
  pred.toVar('predecessor edge'),
  acc.toVar('turns since last circle'),
  posB.toVar('position mod 8'),
  posC.toVar('position mod 9'),
  ...domains,
  ...cellRules,
  ...pairRules,
  ...seam,
  colouring,
];
