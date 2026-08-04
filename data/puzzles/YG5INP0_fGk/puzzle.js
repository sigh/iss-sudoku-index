// Title: Glyphs #5
// Author: damasosos92
// Video: https://www.youtube.com/watch?v=YG5INP0_fGk
// Source: https://app.crackingthecryptic.com/sudoku/bjD8gPPjqG

// Normal sudoku rules apply. Draw a single line connecting 29 different cells
// in the grid that starts and ends with the two given digits (R2C1=1,
// R8C9=7). The line can reach a cell in the border of the grid only at the
// start or end of its path. The line cannot intersect itself and cannot
// branch. No 2x2 in the grid can be entirely covered by the line or entirely
// not-reached. Adjacent digits on the line must be consecutive. In cages
// (the 9 boxes; each box's printed total is transcribed below), the
// digits on the line sum to the cage total.
//
// The puzzle draws two short line stubs at the givens, R2C1-R2C2 and
// R7C8-R8C9 (cell-centre waypoints both). The second is a
// diagonal cell-to-cell run, so the line steps orthogonally or diagonally
// (king-move) rather than orthogonally only. Under king-move movement each
// given has two candidate non-border first/last steps (R2C1: R2C2 or R3C2;
// R8C9: R7C8 or R8C8), so these stubs are the art disambiguating a real
// choice, not decoration: they are encoded below as the path's fixed first
// and last edge.
//
// Nothing else is omitted. "Cannot intersect itself" is read as: no repeated
// cell (forced by the path shape) and no two path edges crossing at a grid
// corner (encoded below); it does not forbid two non-consecutive path cells
// being merely orthogonally adjacent, which is not a crossing.

// The alphabet is widened to 16 so the Var layers can carry path state; the
// 81 grid cells are pinned back to 1-9 below. Two position counters with
// coprime moduli (mod 15, mod 11; lcm 165 > 81 cells) forbid a closed loop
// of steps beside the main path: ISS has no single-path primitive, and
// in/out degree alone would admit one. This also pins the path's exact
// length: the end cell's counters are given the values position 29 forces,
// which -- since 165 exceeds the 81-cell grid -- has only one solution for
// the position, 29 itself.
const NV = 16;
const MOD_A = 15, MOD_B = 11;
const OFF = 1;                      // counter value for a cell the path misses
const UNUSED = 1, FWD = 2, BWD = 3; // step values: unused, a->b, b->a
const START_POS = 2;                // counter value at path position 1
const PATH_LEN = 29;
const posAtStep = (p, mod) => 2 + ((p - 1) % mod);

const START = 'R2C1', END = 'R8C9';

const shape = new Shape('9x9', NV);
const graph = cellGraph(shape);
const gridCells = graph.cells();
const posA = graph.makeOverlay('VA');
const posB = graph.makeOverlay('VB');

// --- Step variables: one per king-move adjacency --------------------------
// Each undirected edge gets one Var, recording whether the path uses it and
// in which direction (a->b or b->a); direction feeds the position counters.
const STEP_DIRS = [[0, 1], [1, 0], [1, 1], [1, -1]];
const steps = [];
const stepsAt = new Map(gridCells.map(cell => [cell, []]));
for (const cell of gridCells) {
  for (const [dR, dC] of STEP_DIRS) {
    const other = graph.step(cell, dR, dC);
    if (!other) continue;
    const id = 'VS' + (steps.length + 1);
    steps.push({ id, a: cell, b: other });
    stepsAt.get(cell).push({ id, out: FWD, in: BWD });
    stepsAt.get(other).push({ id, out: BWD, in: FWD });
  }
}
const stepIndex = new Map(steps.map(s => [s.a + '|' + s.b, s]));
const stepBetween = (p, q) => stepIndex.get(p + '|' + q) || stepIndex.get(q + '|' + p);
// The Given value that drives the path a->b through cell `from` to `to`.
const dirFromTo = (from, to) => {
  const s = stepBetween(from, to);
  return s.a === from ? FWD : BWD;
};

// Grid corners run 1..10; only 2..9 are bordered by four cells.
const innerCorner = (i, j) => i >= 2 && i <= 9 && j >= 2 && j <= 9;
const diagonalsThrough = (i, j) => innerCorner(i, j)
  ? [stepBetween(makeCellId(i - 1, j - 1), makeCellId(i, j)),
     stepBetween(makeCellId(i - 1, j), makeCellId(i, j - 1))]
  : [];

// --- Custom machines --------------------------------------------------------
const nextPos = (v, mod) => 2 + ((v - 2 + 1) % mod);
const counterNFA = mod => NFA.encodeSpec({
  startState: { k: 0 },
  transition: (s, value) => {
    if (s.k === 0) return { k: 1, dir: value };
    if (s.k === 1) return { k: 2, dir: s.dir, a: value };
    if (s.k !== 2) return undefined;
    if (s.dir === UNUSED) return { done: true };
    if (s.a === OFF || value === OFF) return undefined;
    if (s.dir === FWD) return value === nextPos(s.a, mod) ? { done: true } : undefined;
    return s.a === nextPos(value, mod) ? { done: true } : undefined;
  },
  accept: s => s.done === true,
}, NV);

// Adjacent digits on the line are consecutive (differ by exactly 1).
const diffNFA = NFA.encodeSpec({
  startState: { k: 0 },
  transition: (s, value) => {
    if (s.k === 0) return { k: 1, used: value !== UNUSED };
    if (s.k === 1) return { k: 2, used: s.used, a: value };
    if (s.k !== 2) return undefined;
    if (!s.used) return { done: true };
    return Math.abs(s.a - value) === 1 ? { done: true } : undefined;
  },
  accept: s => s.done === true,
}, NV);

// Per-cell path shape: reads the cell's two counters, then every step it is
// an endpoint of. Off-path cells (both counters OFF) use no step. START
// leaves once and is never entered; END is entered once and never left;
// every other on-path cell is entered once and left once.
const cellNFACache = new Map();
function cellNFA(incident, kind) {
  const sig = kind + '|' + incident.map(s => s.in + '/' + s.out).join(',');
  if (cellNFACache.has(sig)) return cellNFACache.get(sig);
  const nfa = NFA.encodeSpec({
    startState: { k: 0 },
    transition: (s, value) => {
      if (s.k === 0) return { k: 1, vis: value !== OFF };
      if (s.k === 1) {
        if ((value !== OFF) !== s.vis) return undefined;
        return { k: 2, vis: s.vis, in: 0, out: 0 };
      }
      const idx = s.k - 2;
      if (idx >= incident.length) return undefined;
      const step = incident[idx];
      let { in: nIn, out: nOut } = s;
      if (value === step.in) nIn++;
      else if (value === step.out) nOut++;
      else if (value !== UNUSED) return undefined;
      if (nIn > 1 || nOut > 1) return undefined;
      return { k: s.k + 1, vis: s.vis, in: nIn, out: nOut };
    },
    accept: s => {
      if (s.k !== 2 + incident.length) return false;
      if (kind === 'start') return s.vis && s.in === 0 && s.out === 1;
      if (kind === 'end') return s.vis && s.in === 1 && s.out === 0;
      return s.vis ? (s.in === 1 && s.out === 1) : (s.in === 0 && s.out === 0);
    },
  }, NV);
  cellNFACache.set(sig, nfa);
  return nfa;
}

// No 2x2 entirely on or entirely off the path: among the 4 cells' counters,
// the count of OFF must be 1, 2 or 3 -- never 0 (all on) or 4 (all off).
const squareNFA = NFA.encodeSpec({
  startState: { n: 0, offs: 0 },
  transition: (s, value) => {
    if (s.n >= 4) return undefined;   // scan is always exactly 4 cells
    return { n: s.n + 1, offs: s.offs + (value === OFF ? 1 : 0) };
  },
  accept: s => s.n === 4 && s.offs > 0 && s.offs < 4,
}, NV);

// Two diagonal steps crossing at the same grid corner cannot both be used --
// the drawn line would cross itself.
const noCrossKey = Pair.fnToKey((x, y) => x === UNUSED || y === UNUSED, NV);

// A box's total: scan its 9 cells as (counter, digit) pairs, summing the
// digit only where the counter shows the cell is on the path.
const boxSumNFACache = new Map();
const boxSumNFA = target => {
  if (boxSumNFACache.has(target)) return boxSumNFACache.get(target);
  const nfa = NFA.encodeSpec({
    startState: { i: 0, sum: 0 },
    transition: (s, value) => {
      if (s.i >= 9) return undefined;   // scan is always exactly 9 pairs
      if (s.off === undefined) return { i: s.i, sum: s.sum, off: value === OFF };
      const sum = s.sum + (s.off ? 0 : value);
      if (sum > target) return undefined;   // sum can only grow: prune early
      return { i: s.i + 1, sum };
    },
    accept: s => s.i === 9 && s.off === undefined && s.sum === target,
  }, NV);
  boxSumNFACache.set(target, nfa);
  return nfa;
};

// --- Border restriction -----------------------------------------------------
// "reach a cell in the border ... only at the start or end": every border
// cell except the two givens is forced off the path.
const isBorder = cell => {
  const { row, col } = parseCellId(cell);
  return row === 1 || row === 9 || col === 1 || col === 9;
};
const bannedBorder = gridCells.filter(c => isBorder(c) && c !== START && c !== END);
const borderOff = bannedBorder.flatMap(cell =>
  [new Given(posA.at(cell), OFF), new Given(posB.at(cell), OFF)]);

// --- Path shape, order, geometry --------------------------------------------
const pathShape = gridCells.map(cell => {
  const incident = stepsAt.get(cell);
  const kind = cell === START ? 'start' : cell === END ? 'end' : 'regular';
  return new NFA(cellNFA(incident, kind), 'path-cell',
    posA.at(cell), posB.at(cell), ...incident.map(s => s.id));
});

const counters = steps.flatMap(s => [
  new NFA(counterNFA(MOD_A), 'path-order', s.id, posA.at(s.a), posA.at(s.b)),
  new NFA(counterNFA(MOD_B), 'path-order', s.id, posB.at(s.a), posB.at(s.b)),
]);

// Every 2x2 block runs the same machine over the same relative offsets (all
// on the posA layer), so one template replicated over each block's top-left
// cell suffices instead of 64 separately-built copies.
const squareTopLefts = [];
for (let r = 1; r <= 8; r++) {
  for (let c = 1; c <= 8; c++) squareTopLefts.push(makeCellId(r, c));
}
const squareTemplateCells = posA.at(
  [makeCellId(1, 1), makeCellId(1, 2), makeCellId(2, 1), makeCellId(2, 2)]);
const squares = [posA.makeReplicate(
  new NFA(squareNFA, 'no-mono-2x2', ...squareTemplateCells),
  posA.at(squareTopLefts),
)];

const noCross = [];
for (let i = 2; i <= 9; i++) {
  for (let j = 2; j <= 9; j++) {
    const [d1, d2] = diagonalsThrough(i, j);
    noCross.push(new Pair(noCrossKey, 'no-crossing', d1.id, d2.id));
  }
}

const differences = steps.map(s =>
  new NFA(diffNFA, 'path-difference', s.id, s.a, s.b));

// Box totals: the puzzle's drawn cages coincide exactly with the 9 default
// boxes; totals transcribed in reading order (top-left to bottom-right box).
const BOX_TOTALS = [10, 12, 21, 21, 18, 22, 18, 9, 20];
const boxSums = graph.boxes().map((cells, n) => {
  const seq = cells.flatMap(c => [posA.at(c), c]);
  return new NFA(boxSumNFA(BOX_TOTALS[n]), 'box-total', ...seq);
});

// --- Layers, domains, endpoints ----------------------------------------------
const layers = [
  posA.toVar('path position mod ' + MOD_A),
  posB.toVar('path position mod ' + MOD_B),
  new Var('S', 'path steps', steps.length),
];
const domains = [
  graph.makeReplicate(new Given(gridCells[0], 1, 2, 3, 4, 5, 6, 7, 8, 9)),
  posA.makeReplicate(new Given(posA.at(gridCells[0]),
    ...Array.from({ length: MOD_A + 1 }, (_, n) => n + 1))),
  posB.makeReplicate(new Given(posB.at(gridCells[0]),
    ...Array.from({ length: MOD_B + 1 }, (_, n) => n + 1))),
];
// Step Vars need no domain constraint of their own: the per-cell path
// machine above accepts only unused / in / out on them.

const endpoints = [
  new Given(START, 1), new Given(END, 7),
  new Given(posA.at(START), START_POS), new Given(posB.at(START), START_POS),
  new Given(posA.at(END), posAtStep(PATH_LEN, MOD_A)),
  new Given(posB.at(END), posAtStep(PATH_LEN, MOD_B)),
];

// The two drawn line stubs (see header) fix the path's first and last edge.
const drawnEdges = [
  new Given(stepBetween(START, 'R2C2').id, dirFromTo(START, 'R2C2')),
  new Given(stepBetween('R7C8', END).id, dirFromTo('R7C8', END)),
];

return [
  shape,
  ...layers,
  ...domains,
  ...borderOff,
  ...endpoints,
  ...drawnEdges,
  ...pathShape,
  ...counters,
  ...squares,
  ...noCross,
  ...differences,
  ...boxSums,
];
