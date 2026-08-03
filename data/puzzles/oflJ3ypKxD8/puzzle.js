// Title: A Round of 9
// Author: cornishjohn
// Video: https://www.youtube.com/watch?v=oflJ3ypKxD8
// Source: https://app.crackingthecryptic.com/sudoku/9dhQD6bdfN

// Normal sudoku rules apply. Find an orthogonally-connected path of length 37,
// not touching itself even diagonally, from R1C1 to R9C9. The path splits into
// 9 sections of length 3-5; each section's first cell holds its own section
// number (1-9, in path order, starting at R1C1), each section's last cell
// holds its own length. Yellow cells (given, exhaustive) are off the path and
// hold the count of their up-to-8 king-move neighbours that are on the path.
// Blue cells (given, not exhaustive -- other off-path cells exist unmarked)
// are off the path.
//
// Modelled with a widened 0-9 alphabet (10 values): real grid digits keep
// 1-9 (restricted below); 0 is the shared off-path sentinel for every
// auxiliary layer. Three cell-sized overlays hold path state:
//   VM: path membership (0 off, 1 on).
//   VS: section number (0 off-path, else 1-9).
//   VP: position within the current section (0 off-path, else 1-5).
// Direction along the path is not otherwise determined by VM alone (a cell's
// two on-path neighbours are symmetric under plain degree/connectivity), so a
// third layer fixes it explicitly, one Var per grid edge:
//   VD: 0 unused, 1 = "A precedes B", 2 = "B precedes A", where A is the
//       edge's own cell and B its right/down neighbour (the edge's fixed,
//       arbitrary orientation -- not the path direction).
// Without VD, the section-number/length relation between two on-path
// neighbours would have to accept either of them as predecessor, which lets
// the solver restart a "new" section number 1 partway along the path -- an
// unsound relaxation. VD pins exactly one predecessor per edge via in/out
// degree, closing that gap.

const shape = new Shape('9x9', '0-9');
const graph = cellGraph(shape);
const gridCells = graph.cells();

const START = 'R1C1';
const END = 'R9C9';

// Off-path, exhaustively marked (per the rules, "all possible yellow cells
// are given"); each also counts its on-path king-move neighbours.
const YELLOW = ['R1C9', 'R2C4', 'R3C1', 'R5C8', 'R6C3', 'R7C6', 'R8C5', 'R9C1', 'R9C3', 'R9C6'];
// Off-path, drawn but not exhaustive (per the rules); no count clue.
const BLUE = ['R2C3', 'R2C7', 'R4C4', 'R5C2'];

// Real sudoku digits stay 1-9; only the auxiliary overlays use 0.
const digitRange = graph.makeReplicate(new Given(gridCells[0], 1, 2, 3, 4, 5, 6, 7, 8, 9));

const mem = graph.makeOverlay('VM'); // path membership
const sec = graph.makeOverlay('VS'); // section number
const idx = graph.makeOverlay('VP'); // position within section

const OFF = 0, ON = 1;

// --- Path membership: fixed endpoints, fixed off-path cells. ---
const membershipGivens = [
  new Given(mem.at(START), ON),
  new Given(mem.at(END), ON),
  ...mem.at(YELLOW).map(c => new Given(c, OFF)),
  ...mem.at(BLUE).map(c => new Given(c, OFF)),
];

// --- Section numbering anchors. ---
// Section 1's first cell is R1C1 (given by the rules); its own digit (=1)
// follows from the per-cell start rule below, so it is not given directly.
// The path has exactly 9 sections, so R9C9 (the path's last cell) is section
// 9's last cell; its length (3-5) is fixed by the same rule that runs the
// section chain, but its own value is only pinned to the *range* here --
// the exact length is derived, matched against its own digit below.
const sectionGivens = [
  new Given(sec.at(START), 1),
  new Given(idx.at(START), 1),
  new Given(sec.at(END), 9),
  new Given(idx.at(END), 3, 4, 5),
];

// R9C9 has no successor, so the general chain rule below (which ties a
// section's length to its digit only when crossing into a *next* section)
// never fires for it. Its own length/digit equality is asserted directly.
const endLengthRule = new SameValues(2, idx.at(END), END);

// --- Every grid edge, with a fixed (arbitrary) A/B orientation and its own
// direction Var. A is always the cell whose right or down neighbour is B. ---
const DIR_NONE = 0, DIR_AB = 1, DIR_BA = 2;
const edgeList = [];
for (const cell of gridCells) {
  const right = graph.step(cell, 0, 1);
  const down = graph.step(cell, 1, 0);
  if (right) edgeList.push({ a: cell, b: right });
  if (down) edgeList.push({ a: cell, b: down });
}
const dirVarGroup = new Var('D', 'path edge direction', edgeList.length);
const edgeKey = (a, b) => `${a}|${b}`;
const edgeByKey = new Map();
edgeList.forEach((e, i) => {
  e.dir = dirVarGroup.cell(i + 1);
  edgeByKey.set(edgeKey(e.a, e.b), e);
});

// Each cell's incident edges, tagged with whether this cell is the edge's A
// side (its right/down step) or B side (it is the neighbour's right/down
// step). Order is [right, down, left, up]; missing (off-grid) sides are
// skipped, so corner/edge cells simply carry fewer entries.
function incidentEdges(cell) {
  const result = [];
  const right = graph.step(cell, 0, 1);
  const down = graph.step(cell, 1, 0);
  const left = graph.step(cell, 0, -1);
  const up = graph.step(cell, -1, 0);
  if (right) result.push({ edge: edgeByKey.get(edgeKey(cell, right)), isA: true });
  if (down) result.push({ edge: edgeByKey.get(edgeKey(cell, down)), isA: true });
  if (left) result.push({ edge: edgeByKey.get(edgeKey(left, cell)), isA: false });
  if (up) result.push({ edge: edgeByKey.get(edgeKey(up, cell)), isA: false });
  return result;
}

// --- Tie each edge's direction to both endpoints' membership: NONE unless
// both are on the path, in which case some direction must be chosen. ---
const tieMachine = NFA.encodeSpec({
  startState: { phase: 'memA' },
  transition: (state, value) => {
    if (state.phase === 'memA') return { phase: 'memB', aOn: value === ON };
    if (state.phase === 'memB') return { phase: 'dir', bothOn: state.aOn && value === ON };
    // phase 'dir'
    return state.bothOn
      ? ((value === DIR_AB || value === DIR_BA) ? { phase: 'done' } : undefined)
      : (value === DIR_NONE ? { phase: 'done' } : undefined);
  },
  accept: ({ phase }) => phase === 'done',
}, shape);
const edgeDirTies = edgeList.map(e => new NFA(tieMachine, 'edge-dir-tie', mem.at(e.a), mem.at(e.b), e.dir));

// --- In/out degree per cell, counted over its incident edges' directions:
// R1C1 out=1,in=0; R9C9 out=0,in=1; other on-path cells out=1,in=1. Off-path
// cells are unconstrained (their incident edges are already forced NONE by
// the tie above). Connected + this degree profile forces a single simple
// path (no branch, no extra disjoint loop once paired with ConnectedValues
// below).
function degreeMachine(isAFlags, outTarget, inTarget) {
  return NFA.encodeSpec({
    startState: { phase: 'mem' },
    transition: (state, value) => {
      if (state.phase === 'mem') {
        return value === OFF ? { phase: 'off' } : { phase: 'edge', i: 0, out: 0, in: 0 };
      }
      if (state.phase === 'off') return { phase: 'off' };
      const isA = isAFlags[state.i];
      const isOut = isA ? value === DIR_AB : value === DIR_BA;
      const isIn = isA ? value === DIR_BA : value === DIR_AB;
      const out = state.out + (isOut ? 1 : 0);
      const inn = state.in + (isIn ? 1 : 0);
      if (out > outTarget || inn > inTarget) return undefined;
      const i = state.i + 1;
      return i === isAFlags.length ? { phase: 'done', out, in: inn } : { phase: 'edge', i, out, in: inn };
    },
    accept: (state) => state.phase === 'off' || (state.phase === 'done' && state.out === outTarget && state.in === inTarget),
  }, shape);
}
const degreeRules = gridCells.map(cell => {
  const incident = incidentEdges(cell);
  const outTarget = cell === START ? 1 : (cell === END ? 0 : 1);
  const inTarget = cell === START ? 0 : (cell === END ? 1 : 1);
  const machine = degreeMachine(incident.map(e => e.isA), outTarget, inTarget);
  return new NFA(machine, 'degree', mem.at(cell), ...incident.map(e => e.edge.dir));
});

// --- No diagonal self-touch: forbid a 2x2 block whose only on-path cells are
// the two diagonal ones (an ordinary turn keeps 3 of the 4 cells on-path, so
// this never rejects a real corner -- only a "near miss" between two
// otherwise-unconnected stretches of path). Same construction as
// Interactive-Sudoku-Solver/data/scripts/nordschleife.js. ---
const noDiagonalTouchMachine = NFA.encodeSpec({
  startState: { block: [] },
  transition: ({ block }, value) => {
    if (block === null) return { block: null };
    const next = [...block, value === ON];
    if (next.length < 4) return { block: next };
    const [topLeft, topRight, bottomLeft, bottomRight] = next;
    const diagonalOnly =
      (topLeft && bottomRight && !topRight && !bottomLeft) ||
      (topRight && bottomLeft && !topLeft && !bottomRight);
    return diagonalOnly ? undefined : { block: null };
  },
  accept: ({ block }) => block === null,
}, shape);
const blockOrigins = gridCells.filter(cell => graph.block(cell, 2, 2));
const noDiagonalTouchTemplate = new NFA(noDiagonalTouchMachine, 'no-touch', ...mem.at(graph.block(gridCells[0], 2, 2)));
// Replicate's origin/targets must share the template's own cell group (the
// VM overlay here, not the main grid), so build it from the overlay.
const noDiagonalTouches = mem.makeReplicate(noDiagonalTouchTemplate, mem.at(blockOrigins));

// --- Per-cell domain + section-start rule. Off-path: sec = idx = 0. On-path:
// sec in 1-9, idx in 1-5, and -- the "each section starts with its own
// section number" rule -- if this is the first cell of its section
// (idx === 1) then its own digit equals the section number. ---
const cellRuleMachine = NFA.encodeSpec({
  startState: { phase: 'mem' },
  transition: (state, value) => {
    switch (state.phase) {
      case 'mem':
        return value === OFF ? { phase: 'offSec' } : { phase: 'onSec' };
      case 'offSec':
        return value === OFF ? { phase: 'offIdx' } : undefined;
      case 'offIdx':
        return value === OFF ? { phase: 'offDigit' } : undefined;
      case 'offDigit':
        return { phase: 'done' };
      case 'onSec':
        return (value >= 1 && value <= 9) ? { phase: 'onIdx', sec: value } : undefined;
      case 'onIdx':
        return (value >= 1 && value <= 5) ? { phase: 'onDigit', sec: state.sec, idx: value } : undefined;
      case 'onDigit':
        return (state.idx !== 1 || value === state.sec) ? { phase: 'done' } : undefined;
    }
  },
  accept: ({ phase }) => phase === 'done',
}, shape);
const cellRules = gridCells.map(cell => new NFA(cellRuleMachine, 'section-cell-rule',
  mem.at(cell), sec.at(cell), idx.at(cell), cell));

// --- Section chain along each directed path edge (A precedes B, or B
// precedes A, per that edge's VD value): the successor either continues the
// predecessor's section (same section number, position +1) or starts the
// next one (section number +1, position 1) -- which the "each section ends
// with its own length" rule requires the predecessor's own digit to match
// its own position (i.e. the section's length) when that happens. Reads
// (memA,secA,idxA,digitA,memB,secB,idxB,digitB,dir); membership is checked
// first so an edge touching an off-path cell is skipped entirely. secA/secB
// collapse to a 4-way category and digitA/digitB to an end-of-section match
// flag as soon as they are read, to keep the compiled state count small. ---
const edgeChainMachine = NFA.encodeSpec({
  startState: { phase: 'memA' },
  transition: (state, value) => {
    switch (state.phase) {
      case 'memA':
        return value === OFF ? { phase: 'skip', left: 8 } : { phase: 'secA' };
      case 'skip':
        return state.left > 1 ? { phase: 'skip', left: state.left - 1 } : { phase: 'done' };
      case 'secA':
        return { phase: 'idxA', secA: value };
      case 'idxA':
        return { phase: 'digitA', secA: state.secA, idxA: value };
      case 'digitA':
        return { phase: 'memB', secA: state.secA, idxA: state.idxA, endMatchA: value === state.idxA };
      case 'memB':
        return value === OFF
          ? { phase: 'skip', left: 4 }
          : { phase: 'secB', idxA: state.idxA, endMatchA: state.endMatchA, secA: state.secA };
      case 'secB': {
        const secCat = value === state.secA ? 'EQ' : value === state.secA + 1 ? 'B1' : state.secA === value + 1 ? 'A1' : 'OTHER';
        return { phase: 'idxB', idxA: state.idxA, endMatchA: state.endMatchA, secCat };
      }
      case 'idxB':
        return { phase: 'digitB', idxA: state.idxA, endMatchA: state.endMatchA, secCat: state.secCat, idxB: value };
      case 'digitB':
        return {
          phase: 'dir', idxA: state.idxA, idxB: state.idxB, endMatchA: state.endMatchA,
          secCat: state.secCat, endMatchB: value === state.idxB,
        };
      case 'dir': {
        const { idxA, idxB, endMatchA, endMatchB, secCat } = state;
        if (value === DIR_AB) {
          const sameSection = secCat === 'EQ' && idxB === idxA + 1;
          const newSection = secCat === 'B1' && idxB === 1 && idxA >= 3 && endMatchA;
          return (sameSection || newSection) ? { phase: 'done' } : undefined;
        }
        if (value === DIR_BA) {
          const sameSection = secCat === 'EQ' && idxA === idxB + 1;
          const newSection = secCat === 'A1' && idxA === 1 && idxB >= 3 && endMatchB;
          return (sameSection || newSection) ? { phase: 'done' } : undefined;
        }
        return undefined; // dir === NONE cannot occur here; the tie above forces AB/BA whenever both cells are on-path.
      }
    }
  },
  accept: ({ phase }) => phase === 'done',
}, shape);
const edgeChainRules = edgeList.map(e => new NFA(edgeChainMachine, 'section-chain',
  mem.at(e.a), sec.at(e.a), idx.at(e.a), e.a,
  mem.at(e.b), sec.at(e.b), idx.at(e.b), e.b,
  e.dir));

// --- Yellow cells: off the path (given above), digit = count of on-path
// king-move neighbours. Same construction as nordschleife.js's circleCounts.
const yellowCountMachine = NFA.encodeSpec({
  startState: { target: null, count: 0 },
  transition: ({ target, count }, value) => {
    if (target === null) return { target: value, count: 0 };
    const next = count + (value === ON ? 1 : 0);
    return next > target ? undefined : { target, count: next };
  },
  accept: ({ target, count }) => target !== null && count === target,
}, shape);
const yellowCounts = YELLOW.map(cell => new NFA(yellowCountMachine, 'yellow-count',
  cell, ...mem.at(graph.kingNeighbours(cell))));

// --- "All possible yellow cells are given" is an exhaustive negative,
// paired here with "not all blue cells are given" -- the two rules draw the
// contrast deliberately. Any cell not marked yellow must not itself look
// like a valid yellow cell: if it turns out to be off the path, its digit
// must not equal its own on-path king-move neighbour count. Reads
// (membership, digit, king neighbours' membership); on-path cells are
// unconstrained. ---
const notPossiblyYellowMachine = NFA.encodeSpec({
  startState: { phase: 'mem' },
  transition: (state, value) => {
    if (state.phase === 'mem') return value === ON ? { phase: 'on' } : { phase: 'off', digit: null, count: 0 };
    if (state.phase === 'on') return { phase: 'on' };
    if (state.digit === null) return { phase: 'off', digit: value, count: 0 };
    // Clamp: no real digit exceeds 9, so counts above 9 are all equally
    // "definitely not this digit" -- bounds the compiled state count.
    return { phase: 'off', digit: state.digit, count: Math.min(state.count + (value === ON ? 1 : 0), 9) };
  },
  accept: (state) => state.phase === 'on' || state.digit !== state.count,
}, shape);
const notPossiblyYellow = gridCells
  .filter(cell => !YELLOW.includes(cell))
  .map(cell => new NFA(notPossiblyYellowMachine, 'not-possibly-yellow',
    mem.at(cell), cell, ...mem.at(graph.kingNeighbours(cell))));

return [
  shape,
  digitRange,
  mem.toVar('path membership'),
  sec.toVar('section number'),
  idx.toVar('position in section'),
  dirVarGroup,
  ...membershipGivens,
  ...sectionGivens,
  endLengthRule,
  // Path length is exactly 37 (membership sums 1 per on-path cell, 0 off).
  new Sum(37, ...mem.at(gridCells)),
  // On-path cells form exactly one connected region (rules out a second,
  // disjoint on-path loop that the local degree rules alone would miss).
  new ConnectedValues('VM', ON),
  ...edgeDirTies,
  ...degreeRules,
  noDiagonalTouches,
  ...cellRules,
  ...edgeChainRules,
  ...yellowCounts,
  ...notPossiblyYellow,
];
