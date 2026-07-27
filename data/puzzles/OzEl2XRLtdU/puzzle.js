// Title: RAT RUN 27: Productivity
// Author: Marty Sears
// Video: https://www.youtube.com/watch?v=OzEl2XRLtdU
// Source: https://sudokupad.app/syu6xcezzm

// Normal sudoku. Finkz stands on R5C1 and Phinx on R2C3; each walks through the
// maze to a cupcake, and the two reach different cupcakes, of R2C4 and R9C8.
// Together the two walks visit no cell more than once, neither walk crosses
// itself or the other, and no step passes through a thick maze wall. A step is
// orthogonal, or diagonal when the 2x2 block it cuts across is free of walls and
// carries no round wall-spot on its shared corner.
// Two digits joined by a goldenberry are not consecutive.
// Each walk is cut into segments by the 3x3 box borders it crosses, and all the
// segments of one walk have the same product of digits; a one-cell segment's
// product is its digit. The two walks may have different products.
//
// Nothing is omitted.

// The alphabet is widened so the Var layers can carry the position counters; the
// 81 grid cells are pinned back to 1-9 below.
const NV = 11;
// Coprime moduli: a closed cycle of steps beside a walk would need a length
// divisible by both, i.e. 90, and the grid holds 81 cells.
const MOD_A = 10, MOD_B = 9;
const OFF = 1;                  // counter value for a cell no rat visits
const FIRST = 2;                // counter value of a walk's first cell
// Step values. A step is stored once, on the (a, b) pair built below; FWD means
// the rat walked a->b and BWD b->a, so the counters can tell direction.
const UNUSED = 1;
const A_FWD = 2, A_BWD = 3, B_FWD = 4, B_BWD = 5;

const RAT_A = 'R5C1', RAT_B = 'R2C3';     // the two rat emoji
const CUPCAKES = ['R2C4', 'R9C8'];        // the two cupcake emoji

// --- The drawn maze -------------------------------------------------------
// Corner (i, j) is the top-left corner of cell RiCj, so the lattice runs 1..10.
// WALLS holds the fourteen thick brown polylines exactly as drawn, including the
// two that trace the grid boundary; SPOTS holds the 38 round brown wall-spots,
// each on a lattice corner.
const WALLS = [
  [[4, 3], [5, 3], [5, 4], [7, 4]],
  [[3, 4], [4, 4]],
  [[7, 3], [7, 2], [6, 2]],
  [[8, 8], [10, 8], [10, 10], [1, 10], [1, 5], [4, 5]],
  [[10, 8], [10, 1], [1, 1], [1, 5]],
  [[3, 3], [2, 3], [2, 4]],
  [[2, 3], [2, 2]],
  [[8, 4], [9, 4]],
  [[8, 2], [8, 3]],
  [[5, 7], [6, 7]],
  [[5, 8], [7, 8], [7, 9], [8, 9]],
  [[4, 8], [2, 8]],
  [[3, 2], [4, 2]],
  [[5, 6], [6, 6]],
];
const SPOTS = [
  [2, 2], [2, 4], [2, 7], [2, 8], [3, 2], [3, 3], [3, 4], [3, 7], [4, 2],
  [4, 3], [4, 4], [4, 5], [4, 7], [4, 8], [5, 3], [5, 4], [5, 6], [5, 7],
  [5, 8], [6, 2], [6, 6], [6, 7], [7, 2], [7, 3], [7, 4], [7, 5], [7, 6],
  [7, 8], [7, 9], [8, 2], [8, 3], [8, 4], [8, 7], [8, 8], [8, 9], [9, 4],
  [9, 5], [9, 6],
];
// The drawn goldenberries, each on the edge between the two cells it joins.
const GOLDENBERRIES = [
  ['R1C1', 'R2C1'], ['R1C8', 'R2C8'], ['R3C2', 'R4C2'], ['R3C4', 'R4C4'],
  ['R4C2', 'R5C2'], ['R4C3', 'R4C4'], ['R7C2', 'R7C3'], ['R8C5', 'R8C6'],
];

const shape = new Shape('9x9', NV);
const graph = cellGraph(shape);
const gridCells = graph.cells();
const posA = graph.makeOverlay('VA');     // walk position mod MOD_A
const posB = graph.makeOverlay('VB');     // walk position mod MOD_B

// Split the polylines into unit lattice segments: 'H|i|j' runs from corner
// (i, j) to (i, j+1) and so separates R(i-1)Cj from RiCj; 'V|i|j' runs from
// (i, j) to (i+1, j) and separates RiC(j-1) from RiCj.
const wallSegments = new Set();
for (const line of WALLS) {
  for (let n = 1; n < line.length; n++) {
    const [i0, j0] = line[n - 1], [i1, j1] = line[n];
    if (i0 === i1) {
      for (let j = Math.min(j0, j1); j < Math.max(j0, j1); j++) {
        wallSegments.add(`H|${i0}|${j}`);
      }
    } else {
      for (let i = Math.min(i0, i1); i < Math.max(i0, i1); i++) {
        wallSegments.add(`V|${i}|${j0}`);
      }
    }
  }
}
const spotSet = new Set(SPOTS.map(([i, j]) => `${i}|${j}`));

// A diagonal step passes through the one corner its two cells share. It needs a
// 2x2 space, whose only internal edges are the four wall slots meeting at that
// corner, and it may not pass through a wall-spot.
const cornerOpen = (i, j) => !spotSet.has(`${i}|${j}`) &&
  !wallSegments.has(`V|${i - 1}|${j}`) && !wallSegments.has(`V|${i}|${j}`) &&
  !wallSegments.has(`H|${i}|${j - 1}`) && !wallSegments.has(`H|${i}|${j}`);

// Is the (dRow, dCol) step out of `cell` a legal move?
const stepAllowed = (cell, dRow, dCol) => {
  const { row, col } = parseCellId(cell);
  if (dRow === 0) return !wallSegments.has(`V|${row}|${col + Math.max(dCol, 0)}`);
  if (dCol === 0) return !wallSegments.has(`H|${row + Math.max(dRow, 0)}|${col}`);
  return cornerOpen(row + Math.max(dRow, 0), col + Math.max(dCol, 0));
};

// --- Step variables -------------------------------------------------------
// One Var per legal king move, recording whether a walk uses it and in which
// direction; a move the maze forbids gets no variable at all, which is how the
// walls and wall-spots are enforced.
const STEP_DIRS = [[0, 1], [1, 0], [1, 1], [1, -1]];
const steps = [];
const stepsAt = new Map(gridCells.map(cell => [cell, []]));
for (const cell of gridCells) {
  for (const [dRow, dCol] of STEP_DIRS) {
    const other = graph.step(cell, dRow, dCol);
    if (!other || !stepAllowed(cell, dRow, dCol)) continue;
    const id = 'VS' + (steps.length + 1);
    steps.push({ id, a: cell, b: other });
    stepsAt.get(cell).push({ id, out: A_FWD, in: A_BWD, out2: B_FWD, in2: B_BWD });
    stepsAt.get(other).push({ id, out: A_BWD, in: A_FWD, out2: B_BWD, in2: B_FWD });
  }
}

const memo = new Map();
const cached = (key, build) => {
  if (!memo.has(key)) memo.set(key, build());
  return memo.get(key);
};

// --- Walk shape -----------------------------------------------------------
// Per-cell machine: reads the cell's two counters, then every step it is an end
// of. A cell no rat visits takes the OFF counter in both layers and uses no
// step; any other cell is entered once and left once by one and the same rat.
// A rat's own cell is only left, a cupcake only entered.
const ROLE_OF = new Map([[RAT_A, 'ratA'], [RAT_B, 'ratB'],
...CUPCAKES.map(cell => [cell, 'cupcake'])]);
function cellNFA(incident, role) {
  // The step values a cell sees depend on whether it is the step's a or b end,
  // so the machine is keyed on that pattern, not just on the step count.
  const sig = 'cell|' + role + '|' + incident.map(s => s.out).join(',');
  return cached(sig, () => NFA.encodeSpec({
    startState: { k: 0 },
    transition: (s, value) => {
      if (s.k === 0) return { k: 1, vis: value !== OFF };
      if (s.k === 1) {
        if ((value !== OFF) !== s.vis) return undefined;
        return { k: 2, vis: s.vis, inA: 0, outA: 0, inB: 0, outB: 0 };
      }
      const n = s.k - 2;
      if (n >= incident.length) return undefined;
      const step = incident[n];
      const next = {
        k: s.k + 1, vis: s.vis,
        inA: s.inA, outA: s.outA, inB: s.inB, outB: s.outB,
      };
      if (value === step.in) next.inA++;
      else if (value === step.out) next.outA++;
      else if (value === step.in2) next.inB++;
      else if (value === step.out2) next.outB++;
      else if (value !== UNUSED) return undefined;
      if (next.inA > 1 || next.outA > 1 || next.inB > 1 || next.outB > 1) {
        return undefined;
      }
      return next;
    },
    accept: s => {
      if (s.k !== 2 + incident.length) return false;
      if (role === 'ratA') {
        return s.vis && s.outA === 1 && s.inA === 0 && s.inB === 0 && s.outB === 0;
      }
      if (role === 'ratB') {
        return s.vis && s.outB === 1 && s.inB === 0 && s.inA === 0 && s.outA === 0;
      }
      if (role === 'cupcake') {
        return s.vis && s.outA === 0 && s.outB === 0 && s.inA + s.inB === 1;
      }
      if (!s.vis) return s.inA === 0 && s.outA === 0 && s.inB === 0 && s.outB === 0;
      return (s.inA === 1 && s.outA === 1 && s.inB === 0 && s.outB === 0) ||
        (s.inB === 1 && s.outB === 1 && s.inA === 0 && s.outA === 0);
    },
  }, NV));
}
// Each rat leaves its own cell once and enters nothing, so counting arrivals
// over the whole grid leaves exactly one cell per rat that is entered and never
// left; only the two cupcakes may be such a cell, and each of them takes exactly
// one arrival. That is what makes the two rats reach different cupcakes.
const walkShape = gridCells.map(cell => {
  const incident = stepsAt.get(cell);
  return new NFA(cellNFA(incident, ROLE_OF.get(cell) || 'plain'), 'walk-cell',
    posA.at(cell), posB.at(cell), ...incident.map(s => s.id));
});

// Position counters. Numbering a real walk 1, 2, 3, ... from the rat's cell is
// always possible, so "the arriving cell's counter is the leaving cell's plus
// one" rejects no genuine walk; what it buys is that a closed cycle of steps
// beside the walks would need a length divisible by MOD_A and by MOD_B. The
// degree rules above admit such a cycle and nothing else rules it out.
const nextPos = (v, mod) => FIRST + ((v - FIRST + 1) % mod);
const counterNFA = mod => cached('counter|' + mod, () => NFA.encodeSpec({
  startState: { k: 0 },
  transition: (s, value) => {
    if (s.k === 0) return { k: 1, dir: value };
    if (s.k === 1) return { k: 2, dir: s.dir, a: value };
    if (s.k !== 2) return undefined;
    if (s.dir === UNUSED) return { done: true };
    if (s.a === OFF || value === OFF) return undefined;
    if (s.dir === A_FWD || s.dir === B_FWD) {
      return value === nextPos(s.a, mod) ? { done: true } : undefined;
    }
    return s.a === nextPos(value, mod) ? { done: true } : undefined;
  },
  accept: s => s.done === true,
}, NV));
const counters = steps.flatMap(s => [
  new NFA(counterNFA(MOD_A), 'walk-order', s.id, posA.at(s.a), posA.at(s.b)),
  new NFA(counterNFA(MOD_B), 'walk-order', s.id, posB.at(s.a), posB.at(s.b)),
]);

// The two diagonals of a 2x2 block cross each other, and no walk may cross
// itself or the other walk. Every other pair of steps meets only at a cell they
// share, which no cell being used twice already forbids.
const noCrossKey = Pair.fnToKey((x, y) => x === UNUSED || y === UNUSED, NV);
const stepIndex = new Map(steps.map(s => [s.a + '|' + s.b, s.id]));
const noCross = [];
for (const cell of gridCells) {
  const right = graph.step(cell, 0, 1);
  const down = graph.step(cell, 1, 0);
  const diag = graph.step(cell, 1, 1);
  if (!right || !down || !diag) continue;
  const d1 = stepIndex.get(cell + '|' + diag);
  const d2 = stepIndex.get(right + '|' + down);
  if (d1 && d2) noCross.push(new Pair(noCrossKey, 'no-crossing', d1, d2));
}

// --- Test constraint: equal segment products ------------------------------
// A segment's cells all lie in one box, so its digits are all different and its
// product is a product of distinct digits from 1-9. Such a product is tracked as
// its prime exponents, one Var layer per prime: the exponent of 2 is at most
// v2(2) + v2(4) + v2(6) + v2(8) = 7, that of 3 at most v3(3) + v3(6) + v3(9) = 4,
// and 5 and 7 can each divide it at most once. A layer value is exponent + 1, so
// the value 1 means "not divisible".
const PRIMES = [
  { p: 2, id: 'VE', maxExp: 7, name: 'exponent of 2' },
  { p: 3, id: 'VF', maxExp: 4, name: 'exponent of 3' },
  { p: 5, id: 'VG', maxExp: 1, name: 'exponent of 5' },
  { p: 7, id: 'VH', maxExp: 1, name: 'exponent of 7' },
];
const exponent = (p, digit) => {
  let e = 0;
  for (let d = digit; d % p === 0; d /= p) e++;
  return e;
};
// A layer cell holds the running product of the digits from the start of the
// cell's segment up to and including the cell itself. Each rat also gets one
// target exponent per prime: the product every one of its segments must reach.
const RATS = [
  { fwd: A_FWD, bwd: A_BWD, target: n => 'VT' + n },
  { fwd: B_FWD, bwd: B_BWD, target: n => 'VU' + n },
];
PRIMES.forEach((prime, n) => {
  prime.layer = graph.makeOverlay(prime.id);
  prime.targets = RATS.map(rat => rat.target(n + 1));
});

// Within a box the running product grows by the arriving cell's digit. Reads the
// step, the two cells' digits, then their two layer values; a step no rat uses
// says nothing. `req` is the value the second layer must take, and 0 stands for
// "no requirement", which no layer value can be.
const sameBoxNFA = prime => cached('same-box|' + prime.p, () => NFA.encodeSpec({
  startState: { k: 0 },
  transition: (s, value) => {
    if (s.k === 0) return { k: 1, dir: value, e: 0 };
    // Grid cells are pinned to 1-9; the wider alphabet has no exponent. Only one
    // of the two digits is needed: the one the walk arrives at.
    if (s.k === 1) {
      if (value > 9) return undefined;
      const back = s.dir === A_BWD || s.dir === B_BWD;
      return { k: 2, dir: s.dir, e: back ? exponent(prime.p, value) : 0 };
    }
    if (s.k === 2) {
      if (value > 9) return undefined;
      const fwd = s.dir === A_FWD || s.dir === B_FWD;
      return { k: 3, dir: s.dir, e: fwd ? exponent(prime.p, value) : s.e };
    }
    if (s.k === 3) {
      if (s.dir === UNUSED) return { k: 4, req: 0 };
      const req = (s.dir === A_FWD || s.dir === B_FWD) ? value + s.e : value - s.e;
      return (req < 1 || req > NV) ? undefined : { k: 4, req };
    }
    if (s.k !== 4) return undefined;
    return (s.req === 0 || s.req === value) ? { done: true } : undefined;
  },
  accept: s => s.done === true,
}, NV));

// Across a box border one segment ends and the next begins, so the departing
// cell's running product must be its rat's target and the arriving cell's must
// be just its own digit. One machine per rat, each reading only its own target
// and ignoring steps the other rat takes.
const crossBoxNFA = (prime, rat) =>
  cached(`cross-box|${prime.p}|${rat.fwd}`, () => NFA.encodeSpec({
    startState: { k: 0 },
    transition: (s, value) => {
      if (s.k === 0) {
        const mine = value === rat.fwd || value === rat.bwd;
        return { k: 1, dir: mine ? value : 0, e: 0 };
      }
      if (s.k === 1) {
        if (value > 9) return undefined;
        return {
          k: 2, dir: s.dir,
          e: s.dir === rat.bwd ? 1 + exponent(prime.p, value) : 0,
        };
      }
      if (s.k === 2) {
        if (value > 9) return undefined;
        return {
          k: 3, dir: s.dir,
          e: s.dir === rat.fwd ? 1 + exponent(prime.p, value) : s.e,
        };
      }
      // The target, read before the layers so that both requirements are known
      // by the time the layers arrive.
      if (s.k === 3) {
        if (s.dir === 0) return { k: 4, reqA: 0, reqB: 0 };
        return s.dir === rat.fwd
          ? { k: 4, reqA: value, reqB: s.e }
          : { k: 4, reqA: s.e, reqB: value };
      }
      if (s.k === 4) {
        return (s.reqA === 0 || s.reqA === value)
          ? { k: 5, reqB: s.reqB } : undefined;
      }
      if (s.k !== 5) return undefined;
      return (s.reqB === 0 || s.reqB === value) ? { done: true } : undefined;
    },
    accept: s => s.done === true,
  }, NV));

const boxOf = new Map();
graph.boxes().forEach((box, n) => box.forEach(cell => boxOf.set(cell, n)));
const productSteps = steps.flatMap(s => PRIMES.flatMap(prime => {
  const layerA = prime.layer.at(s.a), layerB = prime.layer.at(s.b);
  if (boxOf.get(s.a) === boxOf.get(s.b)) {
    return [new NFA(sameBoxNFA(prime), 'segment-product',
      s.id, s.a, s.b, layerA, layerB)];
  }
  return RATS.map((rat, n) => new NFA(crossBoxNFA(prime, rat),
    'segment-break', s.id, s.a, s.b, prime.targets[n], layerA, layerB));
}));

// A rat's own cell opens its walk's first segment, so its running product is its
// own digit.
const segmentStart = PRIMES.flatMap(prime => {
  const key = Pair.fnToKey(
    (digit, l) => digit > 9 || l === 1 + exponent(prime.p, digit), NV);
  return [RAT_A, RAT_B].map(
    cell => new Pair(key, 'segment-start', cell, prime.layer.at(cell)));
});

// A cupcake closes its walk's last segment, so its running product is the target
// of the rat that arrives there. Again one machine per rat: it reads the
// cupcake's incident steps to see whether this rat arrived, then the rat's
// target and the cupcake's running product.
const cupcakeNFA = (incident, rat) =>
  cached(`cupcake|${rat.fwd}|` + incident.map(s => s.out).join(','),
    () => NFA.encodeSpec({
      startState: { k: 0, hit: false },
      transition: (s, value) => {
        const n = incident.length;
        if (s.k < n) {
          const step = incident[s.k];
          const arrive = rat.fwd === A_FWD ? step.in : step.in2;
          if (value === arrive) {
            if (s.hit) return undefined;
            return { k: s.k + 1, hit: true };
          }
          return { k: s.k + 1, hit: s.hit };
        }
        if (s.k === n) return { k: n + 1, req: s.hit ? value : 0 };
        if (s.k !== n + 1) return undefined;
        return (s.req === 0 || s.req === value) ? { done: true } : undefined;
      },
      accept: s => s.done === true,
    }, NV));
const cupcakeEnds = CUPCAKES.flatMap(cell => {
  const incident = stepsAt.get(cell);
  return PRIMES.flatMap(prime => RATS.map((rat, n) =>
    new NFA(cupcakeNFA(incident, rat), 'segment-end',
      ...incident.map(s => s.id), prime.targets[n], prime.layer.at(cell))));
});

// A cell no rat visits lies on no segment, so its layers are pinned to 1 rather
// than left free to take any value.
const idleProduct = cached('idle-product', () => NFA.encodeSpec({
  startState: { k: 0 },
  transition: (s, value) => {
    if (s.k === 0) return { k: 1, off: value === OFF };
    if (s.k > PRIMES.length) return undefined;
    if (s.off && value !== 1) return undefined;
    return { k: s.k + 1, off: s.off };
  },
  accept: s => s.k === PRIMES.length + 1,
}, NV));
const idleCells = gridCells.map(cell => new NFA(idleProduct, 'idle-product',
  posA.at(cell), ...PRIMES.map(prime => prime.layer.at(cell))));

// --- Goldenberries --------------------------------------------------------
const notConsecutive = Pair.fnToKey((x, y) => Math.abs(x - y) !== 1, NV);
const goldenberries = GOLDENBERRIES.map(
  ([x, y]) => new Pair(notConsecutive, 'goldenberry', x, y));

// --- Variables and domains ------------------------------------------------
const range = (lo, hi) => Array.from({ length: hi - lo + 1 }, (_, n) => lo + n);
const layers = [
  posA.toVar('walk position mod ' + MOD_A),
  posB.toVar('walk position mod ' + MOD_B),
  new Var('S', 'walk steps', steps.length),
  ...PRIMES.map(prime => prime.layer.toVar('running segment product, ' + prime.name)),
  new Var('T', 'segment product of the R5C1 rat, prime exponents', PRIMES.length),
  new Var('U', 'segment product of the R2C3 rat, prime exponents', PRIMES.length),
];
const domains = [
  graph.makeReplicate(new Given(gridCells[0], ...range(1, 9))),
  // VA needs no domain of its own: the OFF sentinel plus MOD_A residues is
  // exactly the widened alphabet.
  posB.makeReplicate(new Given(posB.at(gridCells[0]), ...range(1, MOD_B + 1))),
  ...PRIMES.flatMap(prime => [
    prime.layer.makeReplicate(
      new Given(prime.layer.at(gridCells[0]), ...range(1, prime.maxExp + 1))),
    ...prime.targets.map(id => new Given(id, ...range(1, prime.maxExp + 1))),
  ]),
  // The step Vars need no domain of their own: the walk-cell machines accept no
  // value on them but unused / in / out, for either rat.
  // Each rat's own cell is the first cell of its walk; without this the whole
  // numbering of a walk could rotate freely through the residues.
  ...[RAT_A, RAT_B].flatMap(cell => [
    new Given(posA.at(cell), FIRST), new Given(posB.at(cell), FIRST)]),
];

return [
  shape,
  ...layers,
  ...domains,
  ...walkShape,
  ...counters,
  ...noCross,
  ...productSteps,
  ...segmentStart,
  ...cupcakeEnds,
  ...idleCells,
  ...goldenberries,
];
