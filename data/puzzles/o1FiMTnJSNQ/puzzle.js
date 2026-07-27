// Title: Year of the Snake
// Author: Adrian
// Video: https://www.youtube.com/watch?v=o1FiMTnJSNQ
// Source: https://sudokupad.app/qss44f03sx

// Normal sudoku. Ordinary killer cages sum to their total with distinct
// digits (native Cage). Golden cages multiply to their total with repeats
// allowed (custom running-product NFA -- no distinctness added). One main
// diagonal sums to 20 and the other to 25; the rules text never says which
// physical diagonal is which, so both pairings are encoded as an Or rather
// than picking one. A hidden 12-cell snake moves cell-to-cell by king move,
// cannot revisit a cell or cross its own path, cannot use any cage cell, and
// every run of 3 consecutive snake cells is simultaneously an Entropic run
// (one low 1-3, one mid 4-6, one high 7-9) and a Modular(3) run (one from
// each of {1,4,7}, {2,5,8}, {3,6,9}) -- ISS's own semantics for those two
// named line types, applied along the solver-discovered path instead of a
// drawn line.

// The alphabet is widened to 13 so the snake's path-state Var layers can
// carry a path position (2..13, encoding snake position 1..12) or the OFF
// sentinel (1); the 81 grid cells are pinned back to 1-9 below.
const NV = 13;
const OFF = 1;
const LEN = 12;
const POS = k => k + 1;             // snake position k (1..12) -> pos value
const UNUSED = 1, FWD = 2, BWD = 3; // step values: unused, a->b, b->a

const shape = new Shape('9x9', NV);
const graph = cellGraph(shape);
const gridCells = graph.cells();

const gridDomain = graph.makeReplicate(
  new Given(gridCells[0], 1, 2, 3, 4, 5, 6, 7, 8, 9));

// --- Ordinary killer cages ---------------------------------------------
// Transcribed from the puzzle's ordinary killer-cage clues.
const killerCages = [
  { cells: ['R1C2', 'R2C1', 'R2C2'], sum: 20 },
  { cells: ['R1C3', 'R1C4', 'R1C5', 'R1C6', 'R2C6'], sum: 25 },
  { cells: ['R1C9', 'R2C9', 'R3C9', 'R4C9'], sum: 25 },
  { cells: ['R6C5', 'R7C4', 'R7C5'], sum: 20 },
];
const killerConstraints = killerCages.map(c => new Cage(c.sum, ...c.cells));

// --- Golden cages --------------------------------------------------------
// Transcribed from the puzzle's golden-cage clues (each drawn with a
// non-numeric "x<total>" label and a gold outline, distinguishing them from
// the ordinary killer cages above). Repeats allowed, so only a
// running-product NFA (no distinctness).
const goldenCages = [
  { cells: ['R3C2', 'R3C3', 'R4C2', 'R4C3', 'R5C2', 'R5C3'], product: 2025 },
  { cells: ['R1C8', 'R2C8', 'R3C8'], product: 20 },
  { cells: ['R6C6', 'R6C7', 'R7C6', 'R7C7'], product: 25 },
];
const productNFA = target => NFA.encodeSpec({
  startState: 1,
  transition: (state, value) => {
    const next = state * value;
    return next > target ? undefined : next;
  },
  accept: state => state === target,
}, 9);
const goldenConstraints = goldenCages.map(c =>
  new NFA(productNFA(c.product), 'golden-cage', ...c.cells));

// --- Diagonals -------------------------------------------------------------
const diagA = graph.ray('R1C1', 1, 1);   // R1C1..R9C9
const diagB = graph.ray('R1C9', 1, -1);  // R1C9..R9C1
const diagonalConstraint = new Or([
  new And([new Sum(20, ...diagA), new Sum(25, ...diagB)]),
  new And([new Sum(25, ...diagA), new Sum(20, ...diagB)]),
]);

// --- Hidden snake ----------------------------------------------------------
// Cage cells the snake may never occupy: every ordinary killer cage cell and
// every golden cage cell ("cannot ... visit digits in any cages").
const cageCells = [...new Set([
  ...killerCages.flatMap(c => c.cells),
  ...goldenCages.flatMap(c => c.cells),
])];

// One Var per grid cell for its snake path position; one Var per king-move
// adjacency for whether/which-way the snake steps along it.
const pos = graph.makeOverlay('VP');
const STEP_DIRS = [[0, 1], [1, 0], [1, 1], [1, -1]];
const steps = [];
const stepsAt = new Map(gridCells.map(cell => [cell, []]));
for (const cell of gridCells) {
  for (const [dR, dC] of STEP_DIRS) {
    const other = graph.step(cell, dR, dC);
    if (!other) continue;
    const id = 'VS' + (steps.length + 1);
    steps.push({ id, a: cell, b: other, dR, dC });
    stepsAt.get(cell).push({ id, out: FWD, in: BWD, other });
    stepsAt.get(other).push({ id, out: BWD, in: FWD, other: cell });
  }
}
const stepsVar = new Var('S', 'snake steps', steps.length);
// No separate domain restriction for the step Vars: the per-cell shape NFA
// below already rejects any value but UNUSED/FWD/BWD on every incident step,
// since both of a step's endpoint cells read it.

// Cage cells are never on the snake.
const cageExclusion = cageCells.map(cell => new Given(pos.at(cell), OFF));

// Exactly LEN cells carry a path position, one position each. This alone
// forces the snake to be exactly 12 cells and self-avoiding (no cell can
// hold two path positions, and no position is reused): every other cell is
// OFF.
const posValues =
  Array.from({ length: LEN }, (_, k) => POS(k + 1)).join('_');
const snakeLength =
  new ContainExact(posValues, ...pos.at(gridCells));

// Per-cell shape: reads this cell's own path-position value, then each of
// its incident steps. An OFF cell uses none of its incident steps. A cell at
// path position k uses exactly one outgoing step if k < LEN (it has a
// successor) and exactly one incoming step if k > 1 (it has a predecessor) --
// so the snake's two ends have degree 1 and every other snake cell has
// degree 2 (one in, one out). Cached by the sequence of incident (in, out)
// roles, since that -- not the specific cell ids -- is all the compiled NFA
// depends on.
const cellShapeMemo = new Map();
const cellShapeNFA = incident => {
  const sig = incident.map(s => s.in + '/' + s.out).join(',');
  if (!cellShapeMemo.has(sig)) {
    cellShapeMemo.set(sig, NFA.encodeSpec({
      startState: { k: 0 },
      transition: (s, value) => {
        if (s.k === 0) return { k: 1, on: value !== OFF, atK: value };
        const i = s.k - 1;
        if (i >= incident.length) return undefined;
        const step = incident[i];
        let nIn = s.in || 0, nOut = s.out || 0;
        if (value === step.in) nIn++;
        else if (value === step.out) nOut++;
        else if (value !== UNUSED) return undefined;
        if (nIn > 1 || nOut > 1) return undefined;
        return { k: s.k + 1, on: s.on, atK: s.atK, in: nIn, out: nOut };
      },
      accept: (s) => {
        if (s.k !== 1 + incident.length) return false;
        if (!s.on) return !s.in && !s.out;
        const wantOut = s.atK < POS(LEN) ? 1 : 0;
        const wantIn = s.atK > POS(1) ? 1 : 0;
        return (s.in || 0) === wantIn && (s.out || 0) === wantOut;
      },
    }, NV));
  }
  return cellShapeMemo.get(sig);
};
const cellShapes = gridCells.map(cell => {
  const incident = stepsAt.get(cell);
  return new NFA(cellShapeNFA(incident), 'snake-cell',
    pos.at(cell), ...incident.map(s => s.id));
});

// Ties a step's direction to the path positions of its two endpoints: an
// unused step says nothing; a used one advances the position by exactly 1 in
// its direction.
const stepPosLinkNFA = NFA.encodeSpec({
  startState: 0,
  transition: (s, value) => {
    if (s === 0) return { step: value };
    if (s.posA === undefined) return { step: s.step, posA: value };
    if (s.step === UNUSED) return { done: true };
    if (s.step === FWD) return value === s.posA + 1 ? { done: true } : undefined;
    return s.posA === value + 1 ? { done: true } : undefined;
  },
  accept: s => s && s.done === true,
}, NV);
const stepLinks = steps.map(s =>
  new NFA(stepPosLinkNFA, 'snake-order', s.id, pos.at(s.a), pos.at(s.b)));

// Which end of the snake is position 1 vs position LEN is an unconstrained
// labelling choice (the rules never distinguish a head from a tail), so every
// physical snake would otherwise admit two full solutions related only by
// reversing every position. Break that solver-auxiliary symmetry -- not a
// puzzle rule -- canonically: scanning the grid in row-major order, require
// position 1's cell to be seen before position LEN's cell.
const headBeforeTailNFA = NFA.encodeSpec({
  startState: { seenHead: false },
  transition: (s, value) => {
    if (value === POS(1)) return { seenHead: true };
    if (value === POS(LEN)) return s.seenHead ? s : undefined;
    return s;
  },
  accept: () => true,
}, NV);
const headBeforeTail =
  new NFA(headBeforeTailNFA, 'snake-canonical-order', ...pos.at(gridCells));

// No crossing: at every interior grid vertex the two diagonal steps crossing
// there cannot both be in use.
const stepIndex = new Map(steps.map(s => [s.a + '|' + s.b, s]));
const stepBetween = (p, q) => stepIndex.get(p + '|' + q) || stepIndex.get(q + '|' + p);
const innerCorner = (i, j) => i >= 2 && i <= 9 && j >= 2 && j <= 9;
const diagonalsThrough = (i, j) => innerCorner(i, j)
  ? [stepBetween(makeCellId(i - 1, j - 1), makeCellId(i, j)),
     stepBetween(makeCellId(i - 1, j), makeCellId(i, j - 1))]
  : [];
const noCrossKey = Pair.fnToKey((x, y) => x === UNUSED || y === UNUSED, NV);
const noCross = [];
for (let i = 2; i <= 9; i++) {
  for (let j = 2; j <= 9; j++) {
    const [d1, d2] = diagonalsThrough(i, j);
    noCross.push(new Pair(noCrossKey, 'snake-no-cross', d1.id, d2.id));
  }
}

// Modular + entropic: for every cell B and every unordered pair of its
// incident steps {step to A, step to C}, if both steps are in use then --
// because a snake cell has at most one in-step and one out-step -- A and C
// must be B's path predecessor and successor, i.e. (A, B, C) is a run of 3
// consecutive snake cells. Check the Entropic + Modular(3) condition on that
// triple; a window with an unused step is vacuously fine.
const lowMidHigh = d => Math.floor((d - 1) / 3);   // 0/1/2 = entropic group
const modGroup = d => d % 3;                        // 0/1/2 = modular group
const windowNFA = NFA.encodeSpec({
  startState: { k: 0 },
  transition: (s, value) => {
    if (s.k === 0) return { k: 1, used1: value !== UNUSED };
    if (s.k === 1) return { k: 2, active: s.used1 && value !== UNUSED };
    if (s.k === 2) return { k: 3, active: s.active, a: value };
    if (s.k === 3) return { k: 4, active: s.active, a: s.a, b: value };
    if (!s.active) return { done: true };
    const es = [s.a, s.b, value].map(lowMidHigh).sort();
    const ms = [s.a, s.b, value].map(modGroup).sort();
    const ok = es[0] === 0 && es[1] === 1 && es[2] === 2 &&
      ms[0] === 0 && ms[1] === 1 && ms[2] === 2;
    return ok ? { done: true } : undefined;
  },
  accept: s => s.done === true,
}, NV);
const windows = [];
for (const cell of gridCells) {
  const incident = stepsAt.get(cell);
  for (let i = 0; i < incident.length; i++) {
    for (let j = i + 1; j < incident.length; j++) {
      const s1 = incident[i], s2 = incident[j];
      windows.push(new NFA(windowNFA, 'snake-window',
        s1.id, s2.id, s1.other, cell, s2.other));
    }
  }
}

return [
  shape,
  gridDomain,
  ...killerConstraints,
  ...goldenConstraints,
  diagonalConstraint,
  pos.toVar('snake position'),
  stepsVar,
  ...cageExclusion,
  snakeLength,
  ...cellShapes,
  ...stepLinks,
  headBeforeTail,
  ...noCross,
  ...windows,
];
