// Title: RAT RUN 37: Fruitful
// Author: Marty Sears
// Video: https://www.youtube.com/watch?v=jeeZC7luY0c
// Source: https://sudokupad.app/9qx3iprv0x

// Base rule (replaces normal sudoku): in each of the 9 (inner) rows and 9
// columns, exactly one digit 1-9 is missing (absent) and exactly one is
// repeated (appears twice); the other seven each appear exactly once. Every
// digit is the missing one for exactly one row and one column, and the
// repeated one for exactly one row and one column. An orange arrow cell
// beside each row/column holds that row/column's missing digit, and a blue
// arrow cell holds its repeated digit -- so the grid is framed by a ring of
// 36 extra digit cells (four corners of the frame are unused).
//
// Finkz and Phinx each walk a simple path (no repeated cell, no shared cell)
// from their own rat cell to a cupcake cell, both inside the inner 9x9; which
// rat reaches which cupcake is not stated. A step is orthogonal or diagonal;
// a diagonal step needs the 2x2 block it cuts to be free of thick walls and
// to carry no round wall-spot on the shared corner. No step may cross a
// thick maze wall.
//
// FORBIDDEN DOORS: a red X may not be crossed, and its two digits sum to 10.
// BLACKCURRANTS: one digit is double the other.
// REDCURRANTS: one digit is odd, the other even.
// GRAPES: the digits differ by at least 5.
// GOLDENBERRIES: the digits are not consecutive and not equal.
// Two berries sit on the frame ring itself (between missing-digit cells of
// consecutive rows), and are encoded the same way as any other berry.
//
// TEST CONSTRAINT: a rat's path is split into segments by every fruit-marked
// edge (of any of the four kinds above) it crosses. Every segment of the same
// rat's path sums to the same total -- a value the solver must find, and
// which can differ between the two rats.

const range = (lo, hi) => Array.from({ length: hi - lo + 1 }, (_, n) => lo + n);
const memo = new Map();
const cached = (key, build) => {
  if (!memo.has(key)) memo.set(key, build());
  return memo.get(key);
};

// --- Roles and step-value encodings ---------------------------------------
const EMPTY = 1, FINKZ = 2, PHINX = 3;
const NOSTEP = 1, FINKZ_FWD = 2, FINKZ_BWD = 3, PHINX_FWD = 4, PHINX_BWD = 5;
const ratOfStep = { [FINKZ_FWD]: FINKZ, [FINKZ_BWD]: FINKZ, [PHINX_FWD]: PHINX, [PHINX_BWD]: PHINX };
const isForwardStep = v => v === FINKZ_FWD || v === PHINX_FWD;

// --- Drawn geometry (all coordinates as drawn: an 11x11 board whose inner
// 9x9, R2C2..R10C10, holds the maze and its digits). Row/column numbers past
// 9 are not valid two-digit cell-id text (row/col are single base-17
// characters), so every literal below is a plain [row, col] pair, built into
// a real cell id by `rc` via `makeCellId`. ----------------------------------
const rc = ([row, col]) => makeCellId(row, col);
const rcPair = ([a, b]) => [rc(a), rc(b)];

const RAT_CELLS = [[9, 4], [5, 3]].map(rc);
const CUPCAKE_CELLS = [[8, 4], [7, 7]].map(rc);

// 36 internal thick-wall adjacencies (source lines, purple, thickness 12.16).
const WALLS = [
  [[10, 3], [9, 3]],
  [[10, 9], [9, 9]],
  [[2, 3], [2, 4]],
  [[2, 5], [3, 5]],
  [[2, 7], [2, 8]],
  [[3, 10], [3, 9]],
  [[3, 4], [3, 5]],
  [[3, 6], [3, 7]],
  [[3, 7], [3, 8]],
  [[3, 8], [3, 9]],
  [[4, 10], [4, 9]],
  [[4, 2], [4, 3]],
  [[4, 4], [4, 5]],
  [[4, 6], [4, 7]],
  [[4, 8], [4, 9]],
  [[5, 10], [5, 9]],
  [[5, 2], [5, 3]],
  [[5, 3], [6, 3]],
  [[5, 4], [6, 4]],
  [[5, 5], [6, 5]],
  [[5, 6], [5, 7]],
  [[5, 6], [6, 6]],
  [[5, 8], [5, 9]],
  [[6, 7], [6, 8]],
  [[6, 8], [6, 9]],
  [[7, 3], [7, 4]],
  [[7, 5], [8, 5]],
  [[7, 6], [7, 7]],
  [[8, 10], [9, 10]],
  [[8, 2], [9, 2]],
  [[8, 3], [8, 4]],
  [[8, 7], [8, 8]],
  [[8, 8], [8, 9]],
  [[9, 4], [9, 5]],
  [[9, 5], [9, 6]],
  [[9, 8], [9, 9]],
].map(rcPair);

// 6 forbidden doors (red X): impassable, and their two digits sum to 10.
const DOORS = [
  [[6, 9], [6, 10]],
  [[5, 7], [5, 8]],
  [[8, 6], [8, 7]],
  [[7, 7], [8, 7]],
  [[6, 5], [6, 6]],
  [[4, 5], [4, 6]],
].map(rcPair);

// 45 round wall-spots, each named by the top-left cell R(r)C(c) of the 2x2
// block whose shared corner it sits on; a spot blocks both diagonals of that
// block.
const SPOTS = [
  [2, 3], [2, 4], [2, 5], [2, 6], [2, 8], [2, 9], [3, 2], [3, 5], [3, 7],
  [4, 4], [4, 5], [4, 7], [5, 2], [5, 6], [5, 7], [5, 9], [6, 2], [6, 3],
  [6, 5], [6, 6], [6, 7], [6, 8], [6, 9], [7, 2], [7, 4], [7, 5], [7, 6],
  [7, 7], [7, 8], [7, 9], [8, 2], [8, 3], [8, 4], [8, 5], [8, 6], [8, 7],
  [8, 9], [9, 2], [9, 3], [9, 4], [9, 5], [9, 6], [9, 7], [9, 8], [9, 9],
];

// The 50 fruit-marked edges: 48 inside the inner 9x9, plus 2 on the frame
// ring itself (between the missing-digit cells of consecutive rows, raw
// R5C11-R6C11 and R6C11-R7C11) -- read the same way as any other berry,
// since the ring cells hold real digits too.
const BLACKCURRANT = [
  [[10, 8], [9, 8]],
  [[3, 5], [4, 5]],
  [[3, 8], [4, 8]],
  [[4, 8], [5, 8]],
  [[5, 2], [6, 2]],
  [[6, 3], [6, 4]],
  [[7, 6], [8, 6]],
  [[7, 8], [8, 8]],
  [[8, 8], [9, 8]],
  [[5, 11], [6, 11]],
].map(rcPair);
const REDCURRANT = [
  [[10, 5], [9, 5]],
  [[2, 3], [3, 3]],
  [[3, 5], [3, 6]],
  [[3, 7], [4, 7]],
  [[4, 5], [5, 5]],
  [[6, 2], [6, 3]],
  [[6, 2], [7, 2]],
  [[7, 2], [7, 3]],
  [[7, 4], [8, 4]],
  [[8, 10], [8, 9]],
  [[8, 4], [9, 4]],
  [[8, 5], [8, 6]],
  [[9, 2], [9, 3]],
  [[9, 3], [9, 4]],
].map(rcPair);
const GOLDENBERRY = [
  [[4, 6], [5, 6]],
  [[4, 7], [5, 7]],
  [[5, 7], [6, 7]],
  [[5, 8], [6, 8]],
  [[6, 6], [6, 7]],
  [[6, 8], [7, 8]],
  [[7, 10], [7, 9]],
  [[9, 10], [9, 9]],
  [[9, 7], [9, 8]],
].map(rcPair);
const GRAPE = [
  [[10, 10], [10, 9]],
  [[10, 2], [10, 3]],
  [[10, 4], [10, 5]],
  [[10, 6], [10, 7]],
  [[10, 6], [9, 6]],
  [[2, 10], [2, 9]],
  [[2, 2], [2, 3]],
  [[2, 4], [2, 5]],
  [[2, 6], [2, 7]],
  [[4, 2], [5, 2]],
  [[5, 4], [5, 5]],
  [[5, 9], [6, 9]],
  [[7, 3], [8, 3]],
  [[7, 5], [7, 6]],
  [[7, 8], [7, 9]],
  [[8, 3], [9, 3]],
  [[6, 11], [7, 11]],
].map(rcPair);

// --- Grid: an 11x11 board with no implicit row/column/box rules -- the base
// rule is not latin, and the frame ring is not part of any inner house. -----
const shape = new Shape('11x11', 16, 'Raw');
const graph = cellGraph(shape);
const geometry = graph.gridGeometry();

const innerCells = range(2, 10).flatMap(r => range(2, 10).map(c => makeCellId(r, c)));
const trackerCells = [
  ...range(2, 10).map(r => makeCellId(r, 1)),   // repeated digit, by row
  ...range(2, 10).map(r => makeCellId(r, 11)),  // missing digit, by row
  ...range(2, 10).map(c => makeCellId(1, c)),   // repeated digit, by column
  ...range(2, 10).map(c => makeCellId(11, c)),  // missing digit, by column
];
const cornerCells = [[1, 1], [1, 11], [11, 1], [11, 11]].map(rc); // unused, blank in the source

const repeatRowCell = r => makeCellId(r, 1);
const missingRowCell = r => makeCellId(r, 11);
const repeatColCell = c => makeCellId(1, c);
const missingColCell = c => makeCellId(11, c);

const digitDomains = [
  graph.makeReplicate(new Given(graph.cells()[0], ...range(1, 9))), // whole 11x11 board
  ...cornerCells.map(cell => new Given(cell, 1)), // unused corners, pinned within that domain
];

const edgeKey = (a, b) => (a < b ? `${a}|${b}` : `${b}|${a}`);
const blockedSet = new Set([...WALLS, ...DOORS].map(([a, b]) => edgeKey(a, b)));
const spotSet = new Set(SPOTS.map(([r, c]) => `${r}|${c}`));
const fruitSet = new Set(
  [...BLACKCURRANT, ...REDCURRANT, ...GOLDENBERRY, ...GRAPE].map(([a, b]) => edgeKey(a, b)));

// A 2x2 block, named by its top-left cell R(r)C(c), is free for diagonal
// travel when none of its four bounding adjacencies is blocked (wall or
// door) and its shared corner carries no wall-spot; both diagonals of the
// block share this one test. Only interior corners (r, c in 2..9) are ever
// tested, since the maze itself is confined to R2C2..R10C10.
const blockOpen = (r, c) => !spotSet.has(`${r}|${c}`) &&
  !blockedSet.has(edgeKey(makeCellId(r, c), makeCellId(r, c + 1))) &&
  !blockedSet.has(edgeKey(makeCellId(r + 1, c), makeCellId(r + 1, c + 1))) &&
  !blockedSet.has(edgeKey(makeCellId(r, c), makeCellId(r + 1, c))) &&
  !blockedSet.has(edgeKey(makeCellId(r, c + 1), makeCellId(r + 1, c + 1)));

// --- Step variables: one per legal adjacency (orthogonal or diagonal), all
// confined to the inner 9x9. ------------------------------------------------
const steps = []; // [a, b] pairs, each a legal step listed once
for (let r = 2; r <= 10; r++) {
  for (let c = 2; c <= 10; c++) {
    const cell = makeCellId(r, c);
    if (c < 10 && !blockedSet.has(edgeKey(cell, makeCellId(r, c + 1)))) {
      steps.push([cell, makeCellId(r, c + 1)]);
    }
    if (r < 10 && !blockedSet.has(edgeKey(cell, makeCellId(r + 1, c)))) {
      steps.push([cell, makeCellId(r + 1, c)]);
    }
  }
}
for (let r = 2; r <= 9; r++) {
  for (let c = 2; c <= 9; c++) {
    if (!blockOpen(r, c)) continue;
    steps.push([makeCellId(r, c), makeCellId(r + 1, c + 1)]);
    steps.push([makeCellId(r, c + 1), makeCellId(r + 1, c)]);
  }
}

const stepVar = new Var('E', 'maze steps', steps.length);
const stepCellOf = new Map(steps.map(([a, b], i) => [edgeKey(a, b), stepVar.cell(i + 1)]));
const stepCellOfEdge = (a, b) => stepCellOf.get(edgeKey(a, b));

// The two diagonals of a 2x2 block visually cross at its centre; the rules
// forbid a path crossing itself or the other path, so at most one of a
// block's two diagonal steps may be in use at once, by either rat.
const noCrossKey = cached('no-cross', () => Pair.fnToKey(
  (x, y) => x === NOSTEP || y === NOSTEP, geometry));
const noCross = [];
for (let r = 2; r <= 9; r++) {
  for (let c = 2; c <= 9; c++) {
    if (!blockOpen(r, c)) continue;
    const d1 = stepCellOfEdge(makeCellId(r, c), makeCellId(r + 1, c + 1));
    const d2 = stepCellOfEdge(makeCellId(r, c + 1), makeCellId(r + 1, c));
    noCross.push(new Pair(noCrossKey, 'no-crossing', d1, d2));
  }
}

// --- Walk structure (path + degrees), following the family's standard shape:
// a per-cell NFA reads the cell's own role, then every incident step, and
// checks the in/out counts a rat cell (only leaves), a cupcake (only
// arrives) or any other visited cell (both once) must show. -----------------
const path = graph.makeOverlay('VP', innerCells);

const stepOwnerKey = cached('step-owner', () => Pair.fnToKey(
  (cellValue, stepValue) => stepValue === NOSTEP || ratOfStep[stepValue] === cellValue, geometry));
const stepOwners = steps.flatMap(([a, b]) => {
  const stepCell = stepCellOfEdge(a, b);
  return [
    new Pair(stepOwnerKey, 'step-owner', path.at(a), stepCell),
    new Pair(stepOwnerKey, 'step-owner', path.at(b), stepCell),
  ];
});

const degreeMachines = new Map();
const degreeMachine = (starts, expected) => {
  const key = `${starts}|${expected.into}|${expected.outOf}`;
  if (!degreeMachines.has(key)) {
    degreeMachines.set(key, NFA.encodeSpec({
      startState: { phase: 'start' },
      transition: (state, value) => {
        if (state.phase === 'start') {
          return value === EMPTY
            ? { phase: 'empty' }
            : { phase: 'walk', startsLeft: starts, into: 0, outOf: 0 };
        }
        if (state.phase === 'empty') return value === NOSTEP ? state : undefined;
        const { startsLeft, into, outOf } = state;
        const next = { phase: 'walk', startsLeft: Math.max(startsLeft - 1, 0), into, outOf };
        if (value !== NOSTEP) {
          if (isForwardStep(value) === (startsLeft > 0)) next.outOf++; else next.into++;
        }
        if (next.into > expected.into || next.outOf > expected.outOf) return undefined;
        return next;
      },
      accept: state => state.phase === 'empty'
        || (state.into === expected.into && state.outOf === expected.outOf),
    }, geometry));
  }
  return degreeMachines.get(key);
};
const stepsAtCell = new Map(innerCells.map(cell => [cell, []]));
for (const [a, b] of steps) {
  const stepCell = stepCellOfEdge(a, b);
  stepsAtCell.get(a).push({ stepCell, isStart: true });
  stepsAtCell.get(b).push({ stepCell, isStart: false });
}
const incidentAt = cell => {
  const incident = stepsAtCell.get(cell);
  const starts = incident.filter(s => s.isStart);
  return { starts: starts.length, cells: [...starts, ...incident.filter(s => !s.isStart)] };
};
const degrees = innerCells.map(cell => {
  const { starts, cells } = incidentAt(cell);
  const expected = RAT_CELLS.includes(cell) ? { into: 0, outOf: 1 }
    : CUPCAKE_CELLS.includes(cell) ? { into: 1, outOf: 0 }
      : { into: 1, outOf: 1 };
  return new NFA(degreeMachine(starts, expected), 'steps-used',
    path.at(cell), ...cells.map(s => s.stepCell));
});

// --- Cycle elimination: two coprime position-counters, mod 9 and mod 10
// (90 >= 81 cells), rule out a stray closed loop beside a real walk. --------
const POS_OFF = 1, POS_FIRST = 2;
const posModuli = [9, 10];
const posLayers = ['VA', 'VB'].map(prefix => graph.makeOverlay(prefix, innerCells));

const posAdvanceMachine = m => cached('pos-adv|' + m, () => NFA.encodeSpec({
  startState: { phase: 'step' },
  transition: (state, value) => {
    if (state.phase === 'step') {
      return value === NOSTEP
        ? { phase: 'skip', left: 2 }
        : { phase: 'first', forward: isForwardStep(value) };
    }
    if (state.phase === 'skip') {
      return state.left > 1 ? { phase: 'skip', left: 1 } : { phase: 'done' };
    }
    if (state.phase === 'first') return { phase: 'second', forward: state.forward, a: value };
    const [from, to] = state.forward ? [state.a, value] : [value, state.a];
    return to === (from % m) + 1 ? { phase: 'done' } : undefined;
  },
  accept: state => state.phase === 'done',
}, geometry));

const idlePosKey = cached('idle-pos', () => Pair.fnToKey(
  (cellValue, posValue) => cellValue !== EMPTY || posValue === POS_OFF, geometry));

const posLayerConstraints = posModuli.flatMap((m, i) => {
  const layer = posLayers[i];
  const machine = posAdvanceMachine(m);
  return [
    layer.toVar('position mod ' + m),
    layer.makeReplicate(new Given(layer.cells()[0], POS_OFF, ...range(POS_FIRST, POS_FIRST + m - 1))),
    ...RAT_CELLS.map(cell => new Given(layer.at(cell), POS_FIRST)),
    ...innerCells.map(cell => new Pair(idlePosKey, 'idle-position', path.at(cell), layer.at(cell))),
    ...steps.map(([a, b]) => new NFA(machine, 'path-order',
      stepCellOfEdge(a, b), layer.at(a), layer.at(b))),
  ];
});

// --- Segment sums: a rat's path splits into segments at every fruit edge it
// crosses; every segment of the same rat's path must total the same value,
// found by the solver. The running total is carried as three residues modulo
// pairwise-coprime 15, 11 and 4 (product 660, past any reachable segment
// total -- the whole grid's digits can sum to at most 9 * 53 = 477 under the
// row rule below, and a segment is a subset of one rat's cells), so equal
// residues on all three moduli means equal totals, without ever materialising
// a sum above the 16-value cap. -------------------------------------------
const SUM_FIRST = 2; // a layer's stored value v represents residue v - SUM_FIRST
const SUM_OFF = 1;
const sumModuli = [15, 11, 4];
const sumLayers = ['VF', 'VG', 'VH'].map(prefix => graph.makeOverlay(prefix, innerCells));
const targetFinkz = new Var('TF', 'segment total, Finkz', sumModuli.length);
const targetPhinx = new Var('TP', 'segment total, Phinx', sumModuli.length);

const encodeRes = (m, res) => SUM_FIRST + (((res % m) + m) % m);

// Each machine below resolves every branch the moment it has read enough to
// do so, and drops any symbol a branch turns out not to need, so that the
// live state count never multiplies all five (or four) symbols' full ranges
// together -- NFA compilation enumerates every possible value at each read,
// so an unresolved state carrying two ~16-valued residues alongside a digit
// would otherwise blow past the 4096-state compile cap.

// Reads a step, then (sumX(a), digit(a), sumX(b), digit(b)); verifies the
// destination's residue continues the source's (plus its own digit) or, on a
// fruited edge, restarts fresh at its own digit. Forward travel needs sa as
// its source and only checks sb once db arrives; backward has everything it
// needs (sa to verify, da and sb to compute the expectation) before db, so it
// resolves at the sb read and just consumes db as a dummy final symbol.
const sumAdvanceMachine = (m, fruited) => cached(`sum-adv|${m}|${fruited}`, () => NFA.encodeSpec({
  startState: { k: 0 },
  transition: (s, value) => {
    if (s.k === 0) {
      if (value === NOSTEP) return { skip: 4 };
      if (value > PHINX_BWD) return undefined;
      return { k: 1, forward: isForwardStep(value) };
    }
    if (s.skip !== undefined) return s.skip > 1 ? { skip: s.skip - 1 } : { done: true };
    if (s.k === 1) { // sa
      if (value !== SUM_OFF && value > SUM_FIRST + m - 1) return undefined;
      return { k: 2, forward: s.forward, sa: value };
    }
    if (s.k === 2) { // da
      if (value > 9) return undefined;
      if (s.forward) return { k: 3, forward: true, source: s.sa }; // da unused when forward
      return { k: 3, forward: false, toVerify: s.sa, da: value };
    }
    if (s.k === 3) { // sb
      if (value !== SUM_OFF && value > SUM_FIRST + m - 1) return undefined;
      if (s.forward) return { k: 4, forward: true, source: s.source, toVerify: value };
      const expected = fruited ? encodeRes(m, s.da) : encodeRes(m, (value - SUM_FIRST) + s.da);
      return { k: 4, resolved: s.toVerify === expected };
    }
    if (s.k !== 4) return undefined;
    if (value > 9) return undefined; // db
    if (s.resolved !== undefined) return s.resolved ? { done: true } : undefined;
    const expected = fruited ? encodeRes(m, value) : encodeRes(m, (s.source - SUM_FIRST) + value);
    return s.toVerify === expected ? { done: true } : undefined;
  },
  accept: s => s.done === true,
}, geometry));

// On a fruited edge, additionally closes the segment that just ended: the
// source cell's residue (the cell before the crossing) must equal the
// crossing rat's target. Only one of sa/sb (the source) and one of tf/tp
// (that rat's target) is ever needed, so both collapse to a single `source`
// / `target` value as soon as the direction and rat are known.
const sumClosureMachine = m => cached(`sum-close|${m}`, () => NFA.encodeSpec({
  startState: { k: 0 },
  transition: (s, value) => {
    if (s.k === 0) {
      if (value === NOSTEP) return { skip: 4 }; // 4 more reads follow: sa, sb, tf, tp
      if (value > PHINX_BWD) return undefined;
      return { k: 1, forward: isForwardStep(value), rat: ratOfStep[value] };
    }
    if (s.skip !== undefined) return s.skip > 1 ? { skip: s.skip - 1 } : { done: true };
    if (s.k === 1) { // sa
      if (value !== SUM_OFF && value > SUM_FIRST + m - 1) return undefined;
      return s.forward ? { k: 2, rat: s.rat, source: value } : { k: 2, rat: s.rat };
    }
    if (s.k === 2) { // sb
      if (s.source !== undefined) return { k: 3, rat: s.rat, source: s.source }; // forward: sb unused
      if (value !== SUM_OFF && value > SUM_FIRST + m - 1) return undefined;
      return { k: 3, rat: s.rat, source: value };
    }
    if (s.k === 3) { // tf
      if (s.rat === FINKZ) return { k: 4, resolved: s.source === value };
      return { k: 4, source: s.source }; // Phinx: tf unused
    }
    if (s.k !== 4) return undefined;
    if (s.resolved !== undefined) return s.resolved ? { done: true } : undefined;
    return s.source === value ? { done: true } : undefined; // value is tp
  },
  accept: s => s.done === true,
}, geometry));

// The final segment of each rat's walk closes at its cupcake, with no
// further edge to trigger it.
const cupcakeCloseMachine = m => cached(`cupcake-close|${m}`, () => NFA.encodeSpec({
  startState: { k: 0 },
  transition: (s, value) => {
    if (s.k === 0) {
      if (value !== FINKZ && value !== PHINX) return undefined;
      return { k: 1, rat: value };
    }
    if (s.k === 1) { // sum
      if (value !== SUM_OFF && value > 16) return undefined;
      return { k: 2, rat: s.rat, sum: value };
    }
    if (s.k === 2) { // tf
      if (s.rat === FINKZ) return { k: 3, resolved: s.sum === value };
      return { k: 3, sum: s.sum }; // Phinx: tf unused
    }
    if (s.k !== 3) return undefined;
    if (s.resolved !== undefined) return s.resolved ? { done: true } : undefined;
    return s.sum === value ? { done: true } : undefined; // value is tp
  },
  accept: s => s.done === true,
}, geometry));

const idleSumKey = cached('idle-sum', () => Pair.fnToKey(
  (cellValue, sumValue) => cellValue !== EMPTY || sumValue === SUM_OFF, geometry));
const startSumKey = m => cached('start-sum|' + m, () => Pair.fnToKey(
  (digit, sumValue) => sumValue === encodeRes(m, digit), geometry));

const sumLayerConstraints = sumModuli.flatMap((m, i) => {
  const layer = sumLayers[i];
  return [
    layer.toVar('segment residue mod ' + m),
    layer.makeReplicate(new Given(layer.cells()[0], SUM_OFF, ...range(SUM_FIRST, SUM_FIRST + m - 1))),
    new Given(targetFinkz.cell(i + 1), ...range(SUM_FIRST, SUM_FIRST + m - 1)),
    new Given(targetPhinx.cell(i + 1), ...range(SUM_FIRST, SUM_FIRST + m - 1)),
    ...innerCells.map(cell => new Pair(idleSumKey, 'idle-segment-sum', path.at(cell), layer.at(cell))),
    ...RAT_CELLS.map(cell => new Pair(startSumKey(m), 'segment-start', cell, layer.at(cell))),
    ...steps.flatMap(([a, b]) => {
      const fruited = fruitSet.has(edgeKey(a, b));
      const advance = new NFA(sumAdvanceMachine(m, fruited), 'segment-sum',
        stepCellOfEdge(a, b), layer.at(a), a, layer.at(b), b);
      if (!fruited) return [advance];
      const closure = new NFA(sumClosureMachine(m), 'segment-close',
        stepCellOfEdge(a, b), layer.at(a), layer.at(b), targetFinkz.cell(i + 1), targetPhinx.cell(i + 1));
      return [advance, closure];
    }),
    ...CUPCAKE_CELLS.map(cell => new NFA(cupcakeCloseMachine(m), 'segment-close-cupcake',
      path.at(cell), layer.at(cell), targetFinkz.cell(i + 1), targetPhinx.cell(i + 1))),
  ];
});

// --- Fruit relations (static: hold between the two grid digits regardless of
// whether either rat's path crosses that edge). -----------------------------
const relKey = (name, fn) => cached('rel|' + name, () => Pair.fnToKey(fn, geometry));
const redKey = relKey('redcurrant', (a, b) => (a + b) % 2 === 1);
const goldKey = relKey('goldenberry', (a, b) => Math.abs(a - b) !== 1 && a !== b);
const grapeKey = relKey('grape', (a, b) => Math.abs(a - b) >= 5);
const fruitClues = [
  ...BLACKCURRANT.map(([a, b]) => new BlackDot(a, b)), // one digit double the other
  ...REDCURRANT.map(([a, b]) => new Pair(redKey, 'redcurrant', a, b)),
  ...GOLDENBERRY.map(([a, b]) => new Pair(goldKey, 'goldenberry', a, b)),
  ...GRAPE.map(([a, b]) => new Pair(grapeKey, 'grape', a, b)),
];

// Forbidden doors: already excluded from `steps` above (impassable); their
// digits also sum to 10.
const doorClues = DOORS.map(([a, b]) => new X(a, b));

// --- Base rule: one missing, one repeated digit per row and per column, each
// digit missing from exactly one row/column and repeated in exactly one. The
// missing/repeated digits themselves are not free auxiliaries: they are the
// frame-ring cells (repeatRowCell/missingRowCell/repeatColCell/missingColCell)
// the source itself draws beside each row and column. --------------------
const innerRows = range(2, 10).map(r => range(2, 10).map(c => makeCellId(r, c)));
const innerCols = range(2, 10).map(c => range(2, 10).map(r => makeCellId(r, c)));
const otherDigits = m => range(1, 9).filter(d => d !== m).join('_');

const ctrlCells = new Var('CT', 'distinct-digit-count control', innerRows.length + innerCols.length);

// Exactly 8 distinct digits among a house's 9 cells forces the remaining
// distribution: one digit absent (0 copies), one repeated (2 copies), the
// other seven present once each -- 8 * 1 + 1 extra cell is the only way to
// reach 9 cells from 8 distinct values. `ContainAtLeast` for the 8 digits
// other than a candidate `m` then holds only when `m` is the absent one (any
// other candidate would leave one of those 8 unfilled, since distinct count
// is capped at 8); likewise `ContainAtLeast` for two copies of a candidate
// `r` holds only when `r` is the one actually doubled. Each `Or` branch pins
// the matching frame cell via a nested `Given`, so the true missing/repeated
// digit becomes that cell's forced value.
const houseRule = (house, missingCell, repeatCell, ctrlCell) => [
  new Given(ctrlCell, 8),
  new CountDistinct(ctrlCell, ...house),
  new Or(range(1, 9).map(m => new And([
    new Given(missingCell, m),
    new ContainAtLeast(otherDigits(m), ...house),
  ]))),
  new Or(range(1, 9).map(r => new And([
    new Given(repeatCell, r),
    new ContainAtLeast(`${r}_${r}`, ...house),
  ]))),
];

const rowRules = innerRows.flatMap((house, i) =>
  houseRule(house, missingRowCell(i + 2), repeatRowCell(i + 2), ctrlCells.cell(i + 1)));
const colRules = innerCols.flatMap((house, i) =>
  houseRule(house, missingColCell(i + 2), repeatColCell(i + 2), ctrlCells.cell(innerRows.length + i + 1)));

// Every digit is the missing one for exactly one row and one column, and the
// repeated one for exactly one row and one column.
const bijections = [
  new AllDifferent(...range(2, 10).map(missingRowCell)),
  new AllDifferent(...range(2, 10).map(repeatRowCell)),
  new AllDifferent(...range(2, 10).map(missingColCell)),
  new AllDifferent(...range(2, 10).map(repeatColCell)),
];

// --- Path endpoints -----------------------------------------------------
const pathDomain = path.makeReplicate(new Given(path.cells()[0], EMPTY, FINKZ, PHINX));
const ratCupcakeGivens = [
  ...RAT_CELLS.map(cell => new Given(path.at(cell), FINKZ, PHINX)),
  ...CUPCAKE_CELLS.map(cell => new Given(path.at(cell), FINKZ, PHINX)),
];

return [
  shape,
  ...digitDomains,
  path.toVar('rat on cell'),
  pathDomain,
  ...ratCupcakeGivens,
  new AllDifferent(...path.at(RAT_CELLS)),
  new AllDifferent(...path.at(CUPCAKE_CELLS)),
  stepVar,
  ...stepOwners,
  ...degrees,
  ...noCross,
  ...posLayerConstraints,
  targetFinkz,
  targetPhinx,
  ...sumLayerConstraints,
  ...fruitClues,
  ...doorClues,
  ctrlCells,
  ...rowRules,
  ...colRules,
  ...bijections,
];
