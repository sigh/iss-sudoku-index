// Title: On and Off
// Author: Kaktuslav
// Video: https://www.youtube.com/watch?v=sKNtEAIpyJM
// Source: https://sudokupad.app/geypyx7wpd

// Normal sudoku; the grid carries no given digits. The solver also draws one
// path through cell centres: it may not branch, cross itself, or enter a cell
// twice, and its segments alternate between vertical ones (two cells one above
// the other) and diagonal ones (two cells meeting at a corner). Any four
// consecutive cells along the path hold four different remainders mod 4. The
// seven squares lie on the path and the seven circles lie off it; a square
// holding N means digit N occurs exactly N times on the path, and a circle
// holding N means digit N occurs exactly N times off the path.
//
// Nothing is omitted.

// Alphabet widened to 13 so the Var layers can carry path state; the 81 grid
// cells are pinned back to 1-9 below.
const NV = 13;
// Position along the path is carried modulo two coprime numbers. A closed loop
// of steps would have to have a length divisible by lcm(12, 7) = 84, and the
// grid has only 81 cells, so no loop can exist beside the path; in/out degree
// alone would admit one. MOD_A is a multiple of 4 so that the same layer also
// gives each path cell its position modulo 4, which the remainder rule reads.
const MOD_A = 12, MOD_B = 7;
const OFF = 1;                          // counter value for a cell off the path
const START_POS = 2;                    // counter value of the path's first cell
const UNUSED = 1, FWD = 2, BWD = 3;     // step: unused, upper->lower, lower->upper
const E_OFF = 1, E_MID = 2, E_START = 3, E_END = 4;   // a cell's role on the path
const VERT = 1, DIAG = 2;               // the two segment kinds

// The fourteen drawn markers: 0.7-cell grey squares and 0.75-cell lighter grey
// circles, each centred on a cell.
const SQUARES = ['R1C1', 'R4C7', 'R5C3', 'R5C5', 'R7C2', 'R7C9', 'R8C4'];
const CIRCLES = ['R1C4', 'R1C9', 'R3C1', 'R3C5', 'R4C1', 'R7C1', 'R8C1'];

const shape = new Shape('9x9', NV);
const graph = cellGraph(shape);
const gridCells = graph.cells();
const role = graph.makeOverlay('VE');
const posA = graph.makeOverlay('VA');
const posB = graph.makeOverlay('VB');
const onPathDigit = graph.makeOverlay('VM');
const NOT_ON_PATH = 10;   // the VM value for a cell the path misses

const memo = new Map();
const cached = (key, build) => {
  if (!memo.has(key)) memo.set(key, build());
  return memo.get(key);
};

// --- Step variables -------------------------------------------------------
// Every legal segment moves one row down and zero or one column across, so
// three lattices of Vars cover every segment the path could use: one per
// column pair of vertically adjacent cells, and one per 2x2 block for each of
// its two diagonals. Each value records whether the path uses that segment and
// which way it travels, which is what the position counters need.
const vertSteps = new Var('V', 'vertical segments', '8x9');
const rightSteps = new Var('D', 'diagonal segments, top-left to bottom-right', '8x8');
const leftSteps = new Var('P', 'diagonal segments, top-right to bottom-left', '8x8');

const steps = [];
const stepsAt = new Map(gridCells.map(cell => [cell, []]));
const addStep = (id, upper, lower, kind) => {
  steps.push({ id, upper, lower, kind });
  stepsAt.get(upper).push({ id, kind, out: FWD, in: BWD });
  stepsAt.get(lower).push({ id, kind, out: BWD, in: FWD });
};
for (let r = 1; r <= 8; r++) {
  for (let c = 1; c <= 9; c++) {
    addStep(vertSteps.cell(r, c), makeCellId(r, c), makeCellId(r + 1, c), VERT);
  }
  for (let c = 1; c <= 8; c++) {
    addStep(rightSteps.cell(r, c), makeCellId(r, c), makeCellId(r + 1, c + 1), DIAG);
    addStep(leftSteps.cell(r, c), makeCellId(r, c + 1), makeCellId(r + 1, c), DIAG);
  }
}

// --- Machines -------------------------------------------------------------

// Per-cell path shape: reads the cell's role, its two position counters, then
// every step it is an endpoint of. `tIn`/`tOut` record the kind of the step the
// path arrives on and the kind it leaves on, so requiring them to differ at an
// interior cell is exactly the alternation rule: two consecutive segments meet
// at a cell, and one is vertical while the other is diagonal.
const cellSpec = incident => cached(
  'cell|' + incident.map(s => s.kind + ':' + s.in + '/' + s.out).join(','),
  () => NFA.encodeSpec({
    startState: { k: 0 },
    transition: (s, value) => {
      if (s.k === 0) {
        if (value < E_OFF || value > E_END) return undefined;
        return { k: 1, r: value };
      }
      if (s.k === 1 || s.k === 2) {
        const mod = s.k === 1 ? MOD_A : MOD_B;
        if (s.r === E_OFF) {
          if (value !== OFF) return undefined;
        } else if (s.r === E_START) {
          // Pinning the first cell to position 0 stops the whole numbering
          // sliding around the path.
          if (value !== START_POS) return undefined;
        } else if (value < START_POS || value > mod + 1) return undefined;
        return s.k === 1 ? { k: 2, r: s.r } : { k: 3, r: s.r, tIn: 0, tOut: 0 };
      }
      const i = s.k - 3;
      if (i >= incident.length) return undefined;
      const step = incident[i];
      let { tIn, tOut } = s;
      if (value === step.in) {
        if (s.r === E_OFF || tIn !== 0) return undefined;
        tIn = step.kind;
      } else if (value === step.out) {
        if (s.r === E_OFF || tOut !== 0) return undefined;
        tOut = step.kind;
      } else if (value !== UNUSED) return undefined;
      return { k: s.k + 1, r: s.r, tIn, tOut };
    },
    accept: s => {
      if (s.k !== 3 + incident.length) return false;
      if (s.r === E_OFF) return s.tIn === 0 && s.tOut === 0;
      if (s.r === E_START) return s.tIn === 0 && s.tOut !== 0;
      if (s.r === E_END) return s.tIn !== 0 && s.tOut === 0;
      return s.tIn !== 0 && s.tOut !== 0 && s.tIn !== s.tOut;
    },
  }, NV));

const nextPos = (v, mod) => START_POS + ((v - START_POS + 1) % mod);

// Position counter: a used step advances the counter by one along the
// direction of travel, so any closed loop of steps has a length divisible by
// the modulus.
const counterSpec = mod => cached('counter' + mod, () => NFA.encodeSpec({
  startState: { k: 0 },
  transition: (s, value) => {
    if (s.k === 0) {
      if (value < UNUSED || value > BWD) return undefined;
      return { k: 1, dir: value };
    }
    if (s.k === 1) {
      if (value !== OFF && (value < START_POS || value > mod + 1)) return undefined;
      return { k: 2, dir: s.dir, a: value };
    }
    if (s.k !== 2) return undefined;
    if (s.dir === UNUSED) return { done: true };
    if (s.a === OFF || value === OFF) return undefined;
    if (value !== OFF && (value < START_POS || value > mod + 1)) return undefined;
    if (s.dir === FWD) return value === nextPos(s.a, mod) ? { done: true } : undefined;
    return s.a === nextPos(value, mod) ? { done: true } : undefined;
  },
  accept: s => s.done === true,
}, NV));

// The two diagonals of one 2x2 block cross at the block's central corner, and
// that is the only way two segments can meet away from a cell centre, so the
// no-crossing clause is exactly "not both of these".
const noCrossKey = Pair.fnToKey((x, y) => x === UNUSED || y === UNUSED, NV);

// Exactly one start and one end. The path is undirected, so travelling it the
// other way is the same drawn path with every step reversed; requiring the
// start to come before the end in reading order picks one of the two numberings
// and leaves the puzzle's own content untouched.
const orderSpec = NFA.encodeSpec({
  startState: { s: 0, e: 0 },
  transition: (st, value) => {
    if (value === E_START) return (st.s === 0 && st.e === 0) ? { s: 1, e: st.e } : undefined;
    if (value === E_END) return st.e === 0 ? { s: st.s, e: 1 } : undefined;
    return st;
  },
  accept: st => st.s === 1 && st.e === 1,
}, NV);

// Remainder class of a digit: 1 -> {1,5,9}, 2 -> {2,6}, 3 -> {3,7}, 4 -> {4,8}.
const clsOf = d => ((d - 1) % 4) + 1;

// Four consecutive path cells hold four different remainders, so the window
// starting one cell later drops the first remainder and must replace it with
// the same one: the remainder repeats with period 4 along the path and the
// first four are a permutation of the four classes. VC1..VC4 hold that
// permutation -- the class required at path positions 0, 1, 2, 3 mod 4 -- and
// this machine ties each cell's digit to the class its own position selects.
// (The rule is vacuous on a path shorter than four cells; this one is not, but
// the seven squares put at least seven cells on the path.)
const phaseSpec = cached('phase', () => NFA.encodeSpec({
  startState: { k: 0 },
  transition: (s, value) => {
    if (s.k === 0) {
      if (value > 9) return undefined;
      return { k: 1, cls: clsOf(value) };
    }
    if (s.k === 1) {
      if (value === OFF) return { k: 2, off: true };
      return { k: 2, off: false, cls: s.cls, ph: (value - START_POS) % 4 };
    }
    if (s.k > 5) return undefined;
    if (s.off) return { k: s.k + 1, off: true };
    if (s.k - 2 === s.ph && value !== s.cls) return undefined;
    return { k: s.k + 1, off: false, cls: s.cls, ph: s.ph };
  },
  accept: s => s.k === 6,
}, NV));

// The VM layer restates each cell as "the digit it puts on the path", or
// NOT_ON_PATH where the path misses it, so that counting a digit's appearances
// on the path is a plain count of one value over one layer.
const maskSpec = cached('mask', () => NFA.encodeSpec({
  startState: { k: 0 },
  transition: (s, value) => {
    if (s.k === 0) return { k: 1, off: value === E_OFF };
    if (s.k === 1) {
      if (value > 9) return undefined;
      return { k: 2, want: s.off ? NOT_ON_PATH : value };
    }
    return (s.k === 2 && value === s.want) ? { k: 3 } : undefined;
  },
  accept: s => s.k === 3,
}, NV));

// VW1..VW9 hold "how many of this digit are on the path", offset by one so the
// count 0 is representable. This machine reads that Var and then counts its own
// digit over the masked layer.
const tallySpec = digit => cached('tally' + digit, () => NFA.encodeSpec({
  startState: { k: 0 },
  transition: (s, value) => {
    if (s.k === 0) {
      if (value < 1 || value > 10) return undefined;
      return { t: value - 1, n: 0 };
    }
    const n = value === digit ? s.n + 1 : s.n;
    if (n > s.t) return undefined;      // clamp: a count past the target can only fail
    return { t: s.t, n };
  },
  accept: s => s.n === s.t,
}, NV));

// A marker's own digit N selects which tally it constrains: a square asks for
// N on the path (VW_N = N + 1), a circle asks for N off the path, which is
// 9 - N on it (VW_N = 10 - N), since each digit fills nine cells in all.
const lookupSpec = onPath => cached('lookup' + onPath, () => NFA.encodeSpec({
  startState: { k: 0 },
  transition: (s, value) => {
    if (s.k === 0) {
      if (value > 9) return undefined;
      return { k: 1, n: value };
    }
    if (s.k > 9) return undefined;
    if (s.k === s.n && value !== (onPath ? s.n + 1 : 10 - s.n)) return undefined;
    return { k: s.k + 1, n: s.n };
  },
  accept: s => s.k === 10,
}, NV));

// --- Constraints ----------------------------------------------------------

const layers = [
  role.toVar('cell role: off, interior, start, end'),
  posA.toVar('path position mod ' + MOD_A),
  posB.toVar('path position mod ' + MOD_B),
  onPathDigit.toVar('digit each cell puts on the path'),
  vertSteps, rightSteps, leftSteps,
  new Var('C', 'remainder class at each path phase', 4),
  new Var('W', 'on-path count of each digit, plus one', 9),
];

const domains = [
  graph.makeReplicate(new Given(gridCells[0], 1, 2, 3, 4, 5, 6, 7, 8, 9)),
  role.makeReplicate(new Given(role.at(gridCells[0]), E_OFF, E_MID, E_START, E_END)),
  onPathDigit.makeReplicate(new Given(onPathDigit.at(gridCells[0]),
    1, 2, 3, 4, 5, 6, 7, 8, 9, NOT_ON_PATH)),
  ...[1, 2, 3, 4].map(n => new Given('VC' + n, 1, 2, 3, 4)),
  ...Array.from({ length: 9 }, (_, i) =>
    new Given('VW' + (i + 1), 1, 2, 3, 4, 5, 6, 7, 8, 9, 10)),
];
// The counters are bounded by the per-cell machine, and the step Vars by the
// two per-cell machines each of them appears in.

// The four phases carry the four classes, one each.
const classPermutation = [new AllDifferent('VC1', 'VC2', 'VC3', 'VC4')];

const markers = [
  ...SQUARES.map(cell => new Given(role.at(cell), E_MID, E_START, E_END)),
  ...CIRCLES.map(cell => new Given(role.at(cell), E_OFF)),
];

const pathShape = gridCells.map(cell => {
  const incident = stepsAt.get(cell);
  return new NFA(cellSpec(incident), 'path-cell',
    role.at(cell), posA.at(cell), posB.at(cell), ...incident.map(s => s.id));
});

const pathOrder = steps.flatMap(s => [
  new NFA(counterSpec(MOD_A), 'path-order', s.id, posA.at(s.upper), posA.at(s.lower)),
  new NFA(counterSpec(MOD_B), 'path-order', s.id, posB.at(s.upper), posB.at(s.lower)),
]);

const singlePath = [new NFA(orderSpec, 'path-ends', ...role.at(gridCells))];

const noCrossing = [];
for (let r = 1; r <= 8; r++) {
  for (let c = 1; c <= 8; c++) {
    // The two diagonals of the 2x2 block whose top-left cell is RrCc.
    noCrossing.push(new Pair(noCrossKey, 'no-crossing',
      rightSteps.cell(r, c), leftSteps.cell(r, c)));
  }
}

const remainders = gridCells.map(cell => new NFA(phaseSpec, 'path-remainders',
  cell, posA.at(cell), 'VC1', 'VC2', 'VC3', 'VC4'));

const masked = gridCells.map(cell => new NFA(maskSpec, 'on-path-digit',
  role.at(cell), cell, onPathDigit.at(cell)));

const maskCells = onPathDigit.at(gridCells);
const tallies = Array.from({ length: 9 }, (_, i) =>
  new NFA(tallySpec(i + 1), 'digit-tally', 'VW' + (i + 1), ...maskCells));

const wCells = Array.from({ length: 9 }, (_, i) => 'VW' + (i + 1));
const markerCounts = [
  ...SQUARES.map(cell => new NFA(lookupSpec(true), 'square-count', cell, ...wCells)),
  ...CIRCLES.map(cell => new NFA(lookupSpec(false), 'circle-count', cell, ...wCells)),
];

return [
  shape,
  ...layers,
  ...domains,
  ...classPermutation,
  ...markers,
  ...pathShape,
  ...pathOrder,
  ...singlePath,
  ...noCrossing,
  ...remainders,
  ...masked,
  ...tallies,
  ...markerCounts,
];
