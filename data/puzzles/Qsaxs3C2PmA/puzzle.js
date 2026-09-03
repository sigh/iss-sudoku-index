// Title: Prime Loop
// Author: Klausku
// Video: https://www.youtube.com/watch?v=Qsaxs3C2PmA
// Source: https://sudokupad.app/nD8BMGnhbJ

// Normal sudoku. Digits in a cage cannot repeat and sum to the total indicated.
// Draw a looping Region Sum Line: a single closed loop through cell centres that
// may step orthogonally or diagonally. Box borders divide the loop into segments
// that sum to the same total. The loop consists only of prime digits (2, 3, 5, 7)
// and visits every box. The loop never travels through cages.
//
// Nothing is omitted. The rules do not say the loop may not touch or cross
// itself, so the encoding permits both.

// The loop is drawn by the solver, so it lives on Var layers rather than in the
// grid. The alphabet is widened to 12 to carry that state; the 81 grid cells are
// pinned back to 1-9 below.
//   VA / VB: the loop cell's position, modulo 10 and modulo 9.
//   VT:      the running total of the loop segment up to and including the cell.
//   VS:      one cell per king-move adjacency, saying whether the loop uses that
//            step and in which direction.
//   VG:      the common segment total.
const NV = 12;
const MOD_A = 10, MOD_B = 9;         // coprime; lcm 90 exceeds the 81 grid cells
const OFF = 1;                       // sentinel: this cell is not on the loop
const SEAM = 2;                      // marker value of the loop's seam cell
const FIRST = 3;                     // position of the seam's successor
const UNUSED = 1, FWD = 2, BWD = 3;  // step values: unused, a->b, b->a
const TARGET = 'VG';   // a one-cell Var group is addressed by its bare prefix

const PRIMES = [2, 3, 5, 7];

// Cages transcribed from the nine cages drawn on the board; `sum` is null for the
// two drawn without a total, which then carry only the no-repeat half of the rule.
const CAGES = [
  { sum: 21, cells: ['R1C1', 'R2C1', 'R3C1', 'R4C1'] },
  { sum: null, cells: ['R1C7'] },
  { sum: 10, cells: ['R3C3', 'R4C3', 'R4C4'] },
  { sum: 9, cells: ['R3C5', 'R4C5'] },
  { sum: 15, cells: ['R3C6', 'R3C7'] },
  { sum: 4, cells: ['R5C5', 'R6C5'] },
  { sum: 7, cells: ['R5C8', 'R6C8'] },
  { sum: null, cells: ['R8C4', 'R8C5', 'R8C6'] },
  { sum: 20, cells: ['R8C8', 'R8C9', 'R9C7', 'R9C8', 'R9C9'] },
];

const shape = new Shape('9x9', NV);
const graph = cellGraph(shape);
const gridCells = graph.cells();
const posA = graph.makeOverlay('VA');
const posB = graph.makeOverlay('VB');
const total = graph.makeOverlay('VT');

const boxOf = new Map();
graph.boxes().forEach((cells, n) => cells.forEach(cell => boxOf.set(cell, n)));

// "The loop never travels through cages": a king step only ever passes through
// its own two cells, so this is exactly "no cage cell is on the loop".
const cageCells = new Set(CAGES.flatMap(cage => cage.cells));
const freeCells = gridCells.filter(cell => !cageCells.has(cell));

// --- Segment totals as codes ---------------------------------------------
// A segment lies inside one box, so its digits are distinct primes and every
// running total is a non-empty subset sum of {2,3,5,7} -- eleven values, up to
// 17, which will not fit a 12-value alphabet directly. VT stores each one as a
// code instead: OFF for a cell off the loop, then the sums in increasing order.
const SUBSET_SUMS = [...new Set(PRIMES.reduce(
  (sums, p) => sums.concat(sums.map(s => s + p)), [0]))]
  .filter(s => s > 0).sort((a, b) => a - b);
const sumCode = new Map(SUBSET_SUMS.map((s, n) => [s, n + 2]));
const codeSum = new Map(SUBSET_SUMS.map((s, n) => [n + 2, s]));

// --- Step variables -------------------------------------------------------
// One Var per king adjacency between two cells the loop may use. Each cell's
// incident steps are listed in reading order of the neighbour they lead to,
// which is what the seam's direction pin below compares against.
const STEP_DIRS = [[0, 1], [1, 0], [1, 1], [1, -1]];
const dirRank = (dR, dC) => (dR + 1) * 3 + (dC + 1);
const steps = [];
const stepsAt = new Map(freeCells.map(cell => [cell, []]));
for (const cell of freeCells) {
  for (const [dR, dC] of STEP_DIRS) {
    const other = graph.step(cell, dR, dC);
    if (!other || cageCells.has(other)) continue;
    const id = 'VS' + (steps.length + 1);
    steps.push({ id, a: cell, b: other });
    stepsAt.get(cell).push({ id, out: FWD, in: BWD, rank: dirRank(dR, dC) });
    stepsAt.get(other).push({ id, out: BWD, in: FWD, rank: dirRank(-dR, -dC) });
  }
}
for (const incident of stepsAt.values()) incident.sort((x, y) => x.rank - y.rank);

const memo = new Map();
const cached = (key, build) => {
  if (!memo.has(key)) memo.set(key, build());
  return memo.get(key);
};

// --- Loop shape -----------------------------------------------------------
// Per cell: the three layers agree on whether the cell is on the loop, and a
// loop cell is entered by exactly one step and left by exactly one.
//
// The seam (the one cell holding SEAM, fixed below to be the first loop cell in
// reading order) additionally has its outgoing step earlier in the neighbour
// order than its incoming one. That is not a puzzle rule: a loop can be numbered
// in two directions, and without the pin every grid solution would be reached
// twice over.
function cellNFA(incident) {
  return cached('cell|' + incident.map(s => s.out).join(''), () => NFA.encodeSpec({
    startState: { k: 0 },
    transition: (s, value) => {
      if (s.k === 0) return { k: 1, vis: value !== OFF, seam: value === SEAM };
      if (s.k === 1) {                                  // VB agrees with VA
        if ((value !== OFF) !== s.vis) return undefined;
        if ((value === SEAM) !== s.seam) return undefined;
        return { k: 2, vis: s.vis, seam: s.seam };
      }
      if (s.k === 2) {                                  // VT agrees with VA
        if ((value !== OFF) !== s.vis) return undefined;
        return { k: 3, vis: s.vis, seam: s.seam, ins: 0, outs: 0, ordered: false };
      }
      const step = incident[s.k - 3];
      if (step === undefined) return undefined;
      let { ins, outs, ordered } = s;
      if (value === step.out) {
        if (outs) return undefined;
        if (!ins) ordered = true;
        outs = 1;
      } else if (value === step.in) {
        if (ins) return undefined;
        ins = 1;
      } else if (value !== UNUSED) return undefined;
      return { k: s.k + 1, vis: s.vis, seam: s.seam, ins, outs, ordered };
    },
    accept: s => s.k === 3 + incident.length && (s.vis
      ? (s.ins === 1 && s.outs === 1 && (!s.seam || s.ordered))
      : (s.ins === 0 && s.outs === 0)),
  }, NV));
}

// The seam: exactly one cell carries SEAM, and it is the first loop cell in
// reading order. Reads the whole VA layer in grid order.
const seamNFA = NFA.encodeSpec({
  startState: { seen: false },
  transition: (s, value) => {
    if (value === OFF) return { seen: s.seen };
    if (value === SEAM) return s.seen ? undefined : { seen: true };
    return s.seen ? { seen: true } : undefined;
  },
  accept: s => s.seen === true,
}, NV);

// Position counters. A used step advances the counter by one along the direction
// of travel, except into the seam, whose marker value stands outside the counting
// cycle so that a long loop never lands a second cell on it. Any cycle of steps
// that misses the seam must therefore have a length divisible by both moduli,
// i.e. by 90 -- more cells than the grid has -- so the steps cannot form a second
// loop alongside the real one.
const nextPos = (v, mod) =>
  v === SEAM ? FIRST : FIRST + ((v - FIRST + 1) % mod);
const counterNFA = mod => cached('count' + mod, () => NFA.encodeSpec({
  startState: { k: 0 },
  transition: (s, value) => {
    if (s.k === 0) return { k: 1, dir: value };
    if (s.k === 1) return { k: 2, dir: s.dir, pa: value };
    if (s.k !== 2) return undefined;
    if (s.dir === UNUSED) return { k: 3, done: true };
    if (s.pa === OFF || value === OFF) return undefined;
    if (s.dir === FWD) {
      return (value === SEAM || value === nextPos(s.pa, mod))
        ? { k: 3, done: true } : undefined;
    }
    return (s.pa === SEAM || s.pa === nextPos(value, mod))
      ? { k: 3, done: true } : undefined;
  },
  accept: s => s.done === true,
}, NV));

// --- Region sums ----------------------------------------------------------
// Within a box the loop's running total accumulates; crossing a box border ends
// one segment and starts the next. Both machines read
// [step, VT(a), digit(a), VT(b), digit(b)], plus the shared target for a border
// step, and are vacuous when the step is unused.
const sameBoxNFA = cached('same', () => NFA.encodeSpec({
  startState: { k: 0 },
  transition: (s, value) => {
    if (s.done) return { done: true };            // absorb the remaining cells
    if (s.k === 0) {
      if (value === UNUSED) return { done: true };
      return (value === FWD || value === BWD) ? { k: 1, dir: value } : undefined;
    }
    if (s.k === 1) {
      return value === OFF ? undefined : { k: 2, dir: s.dir, ta: value };
    }
    if (s.k === 2) {                                    // digit(a)
      if (s.dir === FWD) return { k: 3, dir: FWD, ta: s.ta };
      // b -> a, so a extends b's total by its own digit.
      const need = sumCode.get(codeSum.get(s.ta) - value);
      return need === undefined ? undefined : { k: 3, dir: BWD, need };
    }
    if (s.k === 3) {                                    // VT(b)
      if (s.dir === BWD) return value === s.need ? { done: true } : undefined;
      return value === OFF ? undefined : { k: 4, dir: FWD, ta: s.ta, tb: value };
    }
    // digit(b), only reached going a -> b
    return s.tb === sumCode.get(codeSum.get(s.ta) + value)
      ? { done: true } : undefined;
  },
  accept: s => s.done === true,
}, NV));

const borderNFA = cached('border', () => NFA.encodeSpec({
  startState: { k: 0 },
  transition: (s, value) => {
    if (s.done) return { done: true };            // absorb the remaining cells
    if (s.k === 0) {
      if (value === UNUSED) return { done: true };
      return (value === FWD || value === BWD) ? { k: 1, dir: value } : undefined;
    }
    if (s.k === 1) {
      return value === OFF ? undefined : { k: 2, dir: s.dir, ta: value };
    }
    if (s.k === 2) {                                    // digit(a)
      // Going b -> a, a opens its segment, so its total is just its own digit;
      // going a -> b, a closes its segment, so its total is the shared target.
      if (s.dir === BWD) {
        return s.ta === sumCode.get(value) ? { k: 3, dir: BWD } : undefined;
      }
      return { k: 3, dir: FWD, want: s.ta };
    }
    if (s.k === 3) {                                    // VT(b)
      if (value === OFF) return undefined;
      return s.dir === FWD ? { k: 4, dir: FWD, want: s.want, tb: value }
                           : { k: 4, dir: BWD, want: value };
    }
    if (s.k === 4) {                                    // digit(b)
      if (s.dir === BWD) return { k: 5, want: s.want };
      return s.tb === sumCode.get(value) ? { k: 5, want: s.want } : undefined;
    }
    return value === s.want ? { done: true } : undefined;
  },
  accept: s => s.done === true,
}, NV));

// --- Layers, domains and the drawn clues ----------------------------------
const layers = [
  posA.toVar('loop position mod ' + MOD_A),
  posB.toVar('loop position mod ' + MOD_B),
  total.toVar('loop segment running total'),
  new Var('S', 'loop steps', steps.length),
  new Var('G', 'segment total', 1),
];

// VA spans the whole 1..12 alphabet (OFF, SEAM, and 10 positions) and VT spans it
// too (OFF plus the 11 segment totals), so only VB and the grid need narrowing.
const domains = [
  graph.makeReplicate(new Given(gridCells[0], 1, 2, 3, 4, 5, 6, 7, 8, 9)),
  posB.makeReplicate(new Given(posB.at(gridCells[0]),
    ...Array.from({ length: MOD_B + 2 }, (_, n) => n + 1))),
  new Given(TARGET, ...SUBSET_SUMS.map(s => sumCode.get(s))),
];

const cages = CAGES.flatMap(cage => cage.sum !== null
  ? [new Cage(cage.sum, ...cage.cells)]
  : (cage.cells.length > 1 ? [new AllDifferent(...cage.cells)] : []));

const offLoop = [...cageCells].flatMap(cell => [
  new Given(posA.at(cell), OFF),
  new Given(posB.at(cell), OFF),
  new Given(total.at(cell), OFF),
]);

const loopShape = freeCells.map(cell => new NFA(
  cellNFA(stepsAt.get(cell)), 'loop-cell',
  posA.at(cell), posB.at(cell), total.at(cell),
  ...stepsAt.get(cell).map(s => s.id)));

const seam = [new NFA(seamNFA, 'loop-seam', ...posA.cells())];

const counters = steps.flatMap(s => [
  new NFA(counterNFA(MOD_A), 'loop-order', s.id, posA.at(s.a), posA.at(s.b)),
  new NFA(counterNFA(MOD_B), 'loop-order', s.id, posB.at(s.a), posB.at(s.b)),
]);

const regionSums = steps.map(s => new NFA(
  boxOf.get(s.a) === boxOf.get(s.b) ? sameBoxNFA : borderNFA, 'region-sum',
  ...(boxOf.get(s.a) === boxOf.get(s.b)
    ? [s.id, total.at(s.a), s.a, total.at(s.b), s.b]
    : [s.id, total.at(s.a), s.a, total.at(s.b), s.b, TARGET])));

// A loop cell holds a prime digit.
const primeKey = Pair.fnToKey((p, d) => p === OFF || PRIMES.includes(d), NV);
const primes = freeCells.map(cell => new Pair(primeKey, 'prime', posA.at(cell), cell));

// The loop visits every box: some cell of each box is on the loop.
const visitsBox = cached('visits', () => NFA.encodeSpec({
  startState: { seen: false },
  transition: (s, value) => ({ seen: s.seen || value !== OFF }),
  accept: s => s.seen === true,
}, NV));
const everyBox = graph.boxes().map(cells => new NFA(
  visitsBox, 'loop-visits-box', ...posA.at(cells)));

return [
  shape,
  ...layers,
  ...domains,
  ...cages,
  ...offLoop,
  ...loopShape,
  ...seam,
  ...counters,
  ...regionSums,
  ...primes,
  ...everyBox,
];
