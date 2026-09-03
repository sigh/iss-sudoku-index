// Title: Picking Blackcurrants
// Author: Kaktuslav
// Video: https://www.youtube.com/watch?v=4kNz7KQmWrI
// Source: https://sudokupad.app/qx6r0v9p4f

// Normal sudoku, with no given digits.
// A directed path runs through the centres of some cells, starting in one blue
// circle (R8C2, R9C4) and ending in the other; which of the two is the start is
// not drawn. Each step is one cell north, one cell east, or one cell diagonally
// southwest, and no cell is visited twice.
// The path is an entropic line: every three consecutive path cells hold one low
// (1-3), one middle (4-6) and one high (7-9) digit.
// The path is also a region sum line: the 3x3 box borders cut it into segments,
// and every segment has the same sum.
// Every black dot must be crossed by the path, i.e. the path visits the dot's
// two cells one immediately after the other. Neither cell of a white dot may be
// visited by the path.
// A white dot joins consecutive digits; a black dot joins digits one of which is
// double the other; the one dot carrying an inequality sign points at the
// smaller digit.
// Nothing is omitted.

// --- Drawn clues ----------------------------------------------------------
// Every literal below is read off the source drawing: the two
// aqua circle underlays, the four white-filled edge dots, the two black-filled
// edge dots, and the ">" glyph sharing the R1C7/R1C8 dot's centre.
const CIRCLES = ['R8C2', 'R9C4'];
const WHITE_DOTS = [
  ['R2C2', 'R3C2'], ['R6C3', 'R7C3'], ['R7C5', 'R8C5'], ['R1C7', 'R1C8'],
];
const BLACK_DOTS = [['R2C7', 'R3C7'], ['R8C6', 'R9C6']];
// The ">" points east, so the digit it points at -- the smaller one -- is R1C8.
const INEQUALITY = ['R1C7', 'R1C8'];

// --- Encoding constants ---------------------------------------------------
// The alphabet is widened so the Var layers can carry the position counters and
// the running segment sum; the 81 grid cells are pinned back to 1-9 below.
const NV = 11;

// Step Vars: one per legal directed move, saying whether the path takes it.
const UNUSED = 1, USED = 2;

// Position counters. A closed cycle of steps beside the path would need a length
// divisible by both moduli, i.e. 90, and the grid holds only 81 cells. The three
// moves sum to zero, so such a cycle is otherwise admitted by the degree rules.
const MOD_A = 10, MOD_B = 9;
const OFF = 1;      // counter value for a cell the path does not visit
const FIRST = 2;    // counter value of the path's first cell

// Running segment sum, held across two layers as R = BASE*(hi-1) + (lo-1), so
// R covers 0..48 with both layers inside the widened alphabet. R = 0 marks a
// cell the path does not visit; a visited cell's running sum is at least 1.
const BASE = 7;
const MAX_SUM = BASE * BASE - 1;   // 48, and a segment sits inside one 3x3 box,
                                   // whose digits are distinct, so it never
                                   // exceeds 45.

// Which blue circle the path starts in.
const C1_START = 1, C2_START = 2;

const shape = new Shape('9x9', NV);
const graph = cellGraph(shape);
const gridCells = graph.cells();
const posA = graph.makeOverlay('VA');    // path position mod MOD_A
const posB = graph.makeOverlay('VB');    // path position mod MOD_B
const sumHi = graph.makeOverlay('VH');   // running segment sum, high base-7 word
const sumLo = graph.makeOverlay('VL');   // running segment sum, low base-7 word
const START_IS = 'VW';
const TARGET_HI = 'VT1', TARGET_LO = 'VT2';   // the shared segment sum

// --- Move geometry --------------------------------------------------------
// North, east, southwest, as (dRow, dCol) with row increasing downwards.
const MOVES = [[-1, 0], [0, 1], [1, -1]];
const steps = [];
const stepsAt = new Map(gridCells.map(cell => [cell, []]));
for (const cell of gridCells) {
  for (const [dRow, dCol] of MOVES) {
    const other = graph.step(cell, dRow, dCol);
    if (!other) continue;
    const id = 'VS' + (steps.length + 1);
    steps.push({ id, a: cell, b: other });
    stepsAt.get(cell).push({ id, role: 'out' });
    stepsAt.get(other).push({ id, role: 'in' });
  }
}
const stepBetween = (x, y) => steps.find(
  s => (s.a === x && s.b === y) || (s.a === y && s.b === x));

const boxOf = cell => {
  const { row, col } = parseCellId(cell);
  return Math.floor((row - 1) / 3) * 3 + Math.floor((col - 1) / 3);
};
const entropy = digit => Math.ceil(digit / 3);   // 1 = low, 2 = middle, 3 = high

const memo = new Map();
const cached = (key, build) => {
  if (!memo.has(key)) memo.set(key, build());
  return memo.get(key);
};

// --- Path shape -----------------------------------------------------------
// Per-cell machine: reads the cell's two counters, then every step it is an end
// of. A cell the path skips takes OFF in both counter layers and uses no step;
// any other cell is entered exactly once and left exactly once. The two circles
// are the exceptions, and read START_IS first to learn which of them is the
// start (entered zero times, left once) and which the end.
function cellSpec(roles, kind) {
  const readsStart = kind !== 'plain';
  const offset = readsStart ? 1 : 0;
  const total = offset + 2 + roles.length;
  return cached('cell|' + kind + '|' + roles.join(','), () => NFA.encodeSpec({
    startState: { k: 0 },
    transition: (s, value) => {
      if (readsStart && s.k === 0) {
        if (value !== C1_START && value !== C2_START) return undefined;
        return { k: 1, w: value };
      }
      if (s.k === offset) {
        if (value > MOD_A + 1) return undefined;
        return { ...s, k: s.k + 1, vis: value !== OFF };
      }
      if (s.k === offset + 1) {
        if (value > MOD_B + 1) return undefined;
        if ((value !== OFF) !== s.vis) return undefined;
        return { ...s, k: s.k + 1, nin: 0, nout: 0 };
      }
      const n = s.k - offset - 2;
      if (n >= roles.length) return undefined;
      if (value !== UNUSED && value !== USED) return undefined;
      const next = { ...s, k: s.k + 1 };
      if (value === USED) {
        if (roles[n] === 'in') next.nin = s.nin + 1; else next.nout = s.nout + 1;
        if (next.nin > 1 || next.nout > 1) return undefined;
      }
      return next;
    },
    accept: s => {
      if (s.k !== total) return false;
      if (kind === 'plain') {
        return s.vis ? (s.nin === 1 && s.nout === 1)
          : (s.nin === 0 && s.nout === 0);
      }
      if (!s.vis) return false;
      const isStart = (kind === 'circle1' && s.w === C1_START) ||
        (kind === 'circle2' && s.w === C2_START);
      return isStart ? (s.nin === 0 && s.nout === 1)
        : (s.nin === 1 && s.nout === 0);
    },
  }, NV));
}
const kindOf = cell => {
  const n = CIRCLES.indexOf(cell);
  return n < 0 ? 'plain' : 'circle' + (n + 1);
};
const pathShape = gridCells.map(cell => {
  const incident = stepsAt.get(cell);
  const roles = incident.map(s => s.role);
  const kind = kindOf(cell);
  const cells = [posA.at(cell), posB.at(cell), ...incident.map(s => s.id)];
  if (kind !== 'plain') cells.unshift(START_IS);
  return new NFA(cellSpec(roles, kind), 'path-cell', ...cells);
});

// Numbering a real path 1, 2, 3, ... from its first cell is always possible, so
// "the arriving cell's counter is the leaving cell's plus one, mod M" rejects no
// genuine path; what it buys is subtour elimination.
const nextPos = (v, mod) => FIRST + ((v - FIRST + 1) % mod);
const counterSpec = mod => cached('counter|' + mod, () => NFA.encodeSpec({
  startState: { k: 0 },
  transition: (s, value) => {
    if (s.done) return { done: true };
    if (s.k === 0) {
      if (value !== UNUSED && value !== USED) return undefined;
      return value === UNUSED ? { done: true } : { k: 1 };
    }
    if (value > mod + 1 || value === OFF) return undefined;
    if (s.k === 1) return { k: 2, a: value };
    return value === nextPos(s.a, mod) ? { done: true } : undefined;
  },
  accept: s => s.done === true,
}, NV));
const counters = steps.flatMap(s => [
  new NFA(counterSpec(MOD_A), 'path-order', s.id, posA.at(s.a), posA.at(s.b)),
  new NFA(counterSpec(MOD_B), 'path-order', s.id, posB.at(s.a), posB.at(s.b)),
]);

// Seam the numbering at the path's first cell, whichever circle that is:
// without it the whole numbering rotates freely through the residues.
const seamSpec = mod => cached('seam|' + mod, () => NFA.encodeSpec({
  startState: { k: 0 },
  transition: (s, value) => {
    if (s.k === 0) {
      if (value !== C1_START && value !== C2_START) return undefined;
      return { k: 1, w: value };
    }
    if (s.k > 2) return undefined;
    if (value > mod + 1) return undefined;
    // The counters are read in CIRCLES order, so k === 1 is the first circle.
    const isTheStart = (s.k === 1) === (s.w === C1_START);
    if (isTheStart && value !== FIRST) return undefined;
    return { ...s, k: s.k + 1 };
  },
  accept: s => s.k === 3,
}, NV));
const seams = [
  new NFA(seamSpec(MOD_A), 'path-seam',
    START_IS, posA.at(CIRCLES[0]), posA.at(CIRCLES[1])),
  new NFA(seamSpec(MOD_B), 'path-seam',
    START_IS, posB.at(CIRCLES[0]), posB.at(CIRCLES[1])),
];

// --- Entropic line --------------------------------------------------------
// Three consecutive cells hold one low, one middle and one high digit exactly
// when their three entropy classes are pairwise distinct. The neighbouring pairs
// are covered per step; the two cells either side of a middle cell are covered
// per (arriving step, departing step) pair.
const adjacentSpec = cached('entropic-adjacent', () => NFA.encodeSpec({
  startState: { k: 0 },
  transition: (s, value) => {
    if (s.done) return { done: true };
    if (s.k === 0) {
      if (value !== UNUSED && value !== USED) return undefined;
      return value === UNUSED ? { done: true } : { k: 1 };
    }
    if (value > 9) return undefined;
    if (s.k === 1) return { k: 2, cls: entropy(value) };
    return entropy(value) !== s.cls ? { done: true } : undefined;
  },
  accept: s => s.done === true,
}, NV));
const entropicAdjacent = steps.map(
  s => new NFA(adjacentSpec, 'entropic-step', s.id, s.a, s.b));

const skipSpec = cached('entropic-skip', () => NFA.encodeSpec({
  startState: { k: 0 },
  transition: (s, value) => {
    if (s.done) return { done: true };
    if (s.k < 2) {
      if (value !== UNUSED && value !== USED) return undefined;
      return value === UNUSED ? { done: true } : { k: s.k + 1 };
    }
    if (value > 9) return undefined;
    if (s.k === 2) return { k: 3, cls: entropy(value) };
    return entropy(value) !== s.cls ? { done: true } : undefined;
  },
  accept: s => s.done === true,
}, NV));
const entropicSkip = gridCells.flatMap(cell => {
  const incident = stepsAt.get(cell);
  const arriving = incident.filter(s => s.role === 'in');
  const leaving = incident.filter(s => s.role === 'out');
  return arriving.flatMap(inStep => leaving.map(outStep => {
    const before = steps.find(s => s.id === inStep.id).a;
    const after = steps.find(s => s.id === outStep.id).b;
    return new NFA(skipSpec, 'entropic-skip',
      inStep.id, outStep.id, before, after);
  }));
});

// --- Region sum line ------------------------------------------------------
// The running sum accumulates along the path and restarts at every box border.
// Reading a step and then the two layers of the cell being left, the digit being
// entered and the two layers of the cell being entered: inside a box the sum
// grows by the arriving digit, and across a border the sum being left behind
// must equal the shared target and the sum restarts at the arriving digit.
const readSum = (hi, lo) => BASE * (hi - 1) + (lo - 1);
const sameBoxSpec = cached('region-sum-inside', () => NFA.encodeSpec({
  startState: { k: 0 },
  transition: (s, value) => {
    if (s.done) return { done: true };
    if (s.k === 0) {
      if (value !== UNUSED && value !== USED) return undefined;
      return value === UNUSED ? { done: true } : { k: 1 };
    }
    if (s.k === 1) return value > BASE ? undefined : { k: 2, hi: value };
    if (s.k === 2) {
      if (value > BASE) return undefined;
      const running = readSum(s.hi, value);
      return running >= 1 ? { k: 3, running } : undefined;
    }
    if (s.k === 3) {
      if (value > 9) return undefined;
      const total = s.running + value;
      return total <= MAX_SUM ? { k: 4, total } : undefined;
    }
    if (s.k === 4) {
      return value === Math.floor(s.total / BASE) + 1
        ? { k: 5, rem: s.total % BASE } : undefined;
    }
    return value === s.rem + 1 ? { done: true } : undefined;
  },
  accept: s => s.done === true,
}, NV));
const crossBoxSpec = cached('region-sum-border', () => NFA.encodeSpec({
  startState: { k: 0 },
  transition: (s, value) => {
    if (s.done) return { done: true };
    if (s.k === 0) {
      if (value !== UNUSED && value !== USED) return undefined;
      return value === UNUSED ? { done: true } : { k: 1 };
    }
    if (s.k === 1) return value > BASE ? undefined : { k: 2, hi: value };
    if (s.k === 2) {
      if (value > BASE) return undefined;
      const running = readSum(s.hi, value);
      return running >= 1 ? { k: 3, running } : undefined;
    }
    // The segment being left must already hold the shared target.
    if (s.k === 3) {
      return value === Math.floor(s.running / BASE) + 1
        ? { k: 4, rem: s.running % BASE } : undefined;
    }
    if (s.k === 4) return value === s.rem + 1 ? { k: 5 } : undefined;
    // The new segment starts at the arriving digit.
    if (s.k === 5) return value > 9 ? undefined : { k: 6, digit: value };
    if (s.k === 6) {
      return value === Math.floor(s.digit / BASE) + 1
        ? { k: 7, rem: s.digit % BASE } : undefined;
    }
    return value === s.rem + 1 ? { done: true } : undefined;
  },
  accept: s => s.done === true,
}, NV));
const regionSumSteps = steps.map(s => (boxOf(s.a) === boxOf(s.b)
  ? new NFA(sameBoxSpec, 'region-sum-inside', s.id,
    sumHi.at(s.a), sumLo.at(s.a), s.b, sumHi.at(s.b), sumLo.at(s.b))
  : new NFA(crossBoxSpec, 'region-sum-border', s.id,
    sumHi.at(s.a), sumLo.at(s.a), TARGET_HI, TARGET_LO,
    s.b, sumHi.at(s.b), sumLo.at(s.b))));

// A cell the path skips carries running sum 0, and every visited cell carries a
// positive one; that is what makes 0 usable as the layer's off-path sentinel.
const idleSumSpec = cached('region-sum-idle', () => NFA.encodeSpec({
  startState: { k: 0 },
  transition: (s, value) => {
    if (s.k === 0) {
      if (value > MOD_A + 1) return undefined;
      return { k: 1, off: value === OFF };
    }
    if (s.k > 2 || value > BASE) return undefined;
    if (s.k === 1) return { k: 2, off: s.off, hi: value };
    return (readSum(s.hi, value) === 0) === s.off ? { k: 3 } : undefined;
  },
  accept: s => s.k === 3,
}, NV));
const idleSums = gridCells.map(cell => new NFA(idleSumSpec, 'region-sum-idle',
  posA.at(cell), sumHi.at(cell), sumLo.at(cell)));

// The path's first cell has no arriving step, so its running sum is seeded here;
// its last cell has no departing step, so its segment is closed here.
const firstCellSpec = start => cached('region-sum-first|' + start,
  () => NFA.encodeSpec({
    startState: { k: 0 },
    transition: (s, value) => {
      if (s.done) return { done: true };
      if (s.k === 0) {
        if (value !== C1_START && value !== C2_START) return undefined;
        return value === start ? { k: 1 } : { done: true };
      }
      if (s.k === 1) return value > 9 ? undefined : { k: 2, digit: value };
      if (s.k === 2) return value > BASE ? undefined : { k: 3, digit: s.digit, hi: value };
      return (value <= BASE && readSum(s.hi, value) === s.digit)
        ? { done: true } : undefined;
    },
    accept: s => s.done === true,
  }, NV));
const lastCellSpec = start => cached('region-sum-last|' + start,
  () => NFA.encodeSpec({
    startState: { k: 0 },
    transition: (s, value) => {
      if (s.done) return { done: true };
      if (s.k === 0) {
        if (value !== C1_START && value !== C2_START) return undefined;
        return value === start ? { done: true } : { k: 1 };
      }
      if (s.k === 1) return value > BASE ? undefined : { k: 2, hi: value };
      if (s.k === 2) {
        if (value > BASE) return undefined;
        return { k: 3, running: readSum(s.hi, value) };
      }
      if (s.k === 3) {
        return value === Math.floor(s.running / BASE) + 1
          ? { k: 4, rem: s.running % BASE } : undefined;
      }
      return value === s.rem + 1 ? { done: true } : undefined;
    },
    accept: s => s.done === true,
  }, NV));
const pathEnds = CIRCLES.flatMap((cell, n) => {
  const start = n === 0 ? C1_START : C2_START;
  return [
    new NFA(firstCellSpec(start), 'region-sum-first',
      START_IS, cell, sumHi.at(cell), sumLo.at(cell)),
    new NFA(lastCellSpec(start), 'region-sum-last',
      START_IS, sumHi.at(cell), sumLo.at(cell), TARGET_HI, TARGET_LO),
  ];
});

// --- Dots -----------------------------------------------------------------
// Both black dots sit on a horizontal border, and north is the only legal move
// between two vertically adjacent cells, so "crossed by the path" pins one
// particular directed step in each case.
const blackDotCrossings = BLACK_DOTS.map(
  ([x, y]) => new Given(stepBetween(x, y).id, USED));
const whiteDotCellsOff = WHITE_DOTS.flat().map(
  cell => new Given(posA.at(cell), OFF));
const dotDigits = [
  ...WHITE_DOTS.map(([x, y]) => new WhiteDot(x, y)),
  ...BLACK_DOTS.map(([x, y]) => new BlackDot(x, y)),
  new GreaterThan(...INEQUALITY),
];

// --- Variables and domains ------------------------------------------------
const range = (lo, hi) => Array.from({ length: hi - lo + 1 }, (_, n) => lo + n);
const layers = [
  posA.toVar('path position mod ' + MOD_A),
  posB.toVar('path position mod ' + MOD_B),
  sumHi.toVar('segment sum so far, base ' + BASE + ' high word'),
  sumLo.toVar('segment sum so far, base ' + BASE + ' low word'),
  new Var('S', 'path steps', steps.length),
  new Var('T', 'the shared segment sum', 2),
  new Var('W', 'which blue circle the path starts in', 1),
];
const domains = [
  graph.makeReplicate(new Given(gridCells[0], ...range(1, 9))),
  // VA needs no domain of its own: the OFF sentinel plus MOD_A residues is
  // exactly the widened alphabet.
  posB.makeReplicate(new Given(posB.at(gridCells[0]), ...range(1, MOD_B + 1))),
  sumHi.makeReplicate(new Given(sumHi.at(gridCells[0]), ...range(1, BASE))),
  sumLo.makeReplicate(new Given(sumLo.at(gridCells[0]), ...range(1, BASE))),
  new Given(TARGET_HI, ...range(1, BASE)),
  new Given(TARGET_LO, ...range(1, BASE)),
  new Given(START_IS, C1_START, C2_START),
  // The step Vars need no domain of their own: the path-cell machines accept
  // only UNUSED or USED on them.
];

return [
  shape,
  ...layers,
  ...domains,
  ...pathShape,
  ...counters,
  ...seams,
  ...entropicAdjacent,
  ...entropicSkip,
  ...regionSumSteps,
  ...idleSums,
  ...pathEnds,
  ...blackDotCrossings,
  ...whiteDotCellsOff,
  ...dotDigits,
];
