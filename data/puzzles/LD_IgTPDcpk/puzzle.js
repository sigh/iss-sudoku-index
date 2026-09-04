// Title: RAT RUN 36: Alternating Currant
// Author: Marty Sears
// Video: https://www.youtube.com/watch?v=LD_IgTPDcpk
// Source: https://sudokupad.app/jewe3tzhy9

// Rules encoded here:
//   SOMEDOKU        row N and column N each hold exactly N distinct digits,
//                   the rest of that row/column repeating a digit already
//                   used. No 3x3 boxes are drawn; the grid carries rows and
//                   columns only.
//   MAZE            Finkz (R9C9) and Phinx (R9C2) each walk a self-avoiding
//                   path to the shared cupcake at R4C3. A path visits no cell
//                   twice, the two paths share no cell but the cupcake,
//                   neither crosses itself or the other, and no step passes
//                   through a thick wall. A step is orthogonal, or diagonal
//                   across a 2x2 block free of walls and carrying no round
//                   wall-spot on the corner it cuts.
//   BLACKCURRANTS / REDCURRANTS / GRAPES   two digits joined by a
//                   blackcurrant have one double the other; by a redcurrant,
//                   one odd one even; by a grape, they differ by at least 5.
//   CAGES           four cages -- {R1C9,R2C9}, {R5C4,R6C4}, {R6C2,R6C3},
//                   {R8C5} -- hold no repeated digit and share one common
//                   total, to be deduced. Each carries an electricity mark on
//                   one of its own cells (R1C9, R6C4, R6C2, R8C5 in turn); if
//                   that cell's digit is 5 or higher, neither rat's path may
//                   visit any cell of that cage.
//   TEST CONSTRAINT both rats visit the same number of cells, and for every
//                   n, the cell n steps from the cupcake on Finkz' path and
//                   the cell n steps from the cupcake on Phinx' path sum to
//                   the cupcake's own digit.
//
// Nothing is omitted. Four short white/grey marks drawn off the grid along
// the R3-R7 and C3-C7 span on all four sides resolve to no cells (they run
// along an edge, not into the grid) and are frame decoration, not a clue.

// The alphabet is widened to 16 so the Var layers can carry path state and
// the two position counters; the 81 grid cells are pinned back to 1-9 below.
// The grid type is Raw: SOMEDOKU's rows and columns repeat digits, so no
// implicit row/column/box rule may stand, and every rule -- including the
// digit-count rule itself -- is stated explicitly.
const NV = 16;

const MOD_A = 15, MOD_B = 11;   // coprime: a spurious cycle would need 165 cells
const OFF = 1;                  // counter value for a cell no rat visits
const FIRST = 2;                // counter value of the cupcake cell
// Step values. A step is stored once, on the (a, b) pair below; FWD means the
// rat walked a->b, BWD means b->a, so the counters can tell direction.
const UNUSED = 1;
const A_FWD = 2, A_BWD = 3, B_FWD = 4, B_BWD = 5;
// Both paths together cover at most 81 cells and share only the cupcake, so
// each is at most (81 + 1) / 2 = 41 cells and starts at most 40 steps back
// from the cupcake.
const MAX_POS = 40;
const NONE = 10;                // sequence entry for a position past the start

const RAT_CELLS = ['R9C9', 'R9C2'];   // the two rat emoji
const CUPCAKE = 'R4C3';               // both cupcake emoji, drawn in one cell

// --- The drawn maze -------------------------------------------------------
// Every interior wall edge, read off the thick plum polylines as the cell
// pair it separates. The drawn outer border walls the whole boundary, so no
// cell pair against "outside" is needed: a step leaving the grid has no
// destination cell at all.
const WALL_EDGES = [
  ['R1C3', 'R2C3'], ['R1C6', 'R2C6'], ['R1C8', 'R2C8'], ['R2C2', 'R3C2'],
  ['R2C4', 'R3C4'], ['R2C5', 'R3C5'], ['R2C6', 'R3C6'], ['R2C8', 'R2C9'],
  ['R3C1', 'R4C1'], ['R3C3', 'R3C4'], ['R3C6', 'R4C6'], ['R4C2', 'R5C2'],
  ['R4C3', 'R4C4'], ['R4C5', 'R4C6'], ['R4C7', 'R4C8'], ['R5C1', 'R5C2'],
  ['R5C3', 'R6C3'], ['R5C5', 'R6C5'], ['R5C9', 'R6C9'], ['R6C1', 'R6C2'],
  ['R6C2', 'R7C2'], ['R6C3', 'R7C3'], ['R6C5', 'R7C5'], ['R6C6', 'R6C7'],
  ['R6C6', 'R7C6'], ['R6C7', 'R6C8'], ['R6C8', 'R7C8'], ['R7C3', 'R8C3'],
  ['R7C4', 'R8C4'], ['R7C7', 'R8C7'], ['R8C1', 'R8C2'], ['R8C2', 'R9C2'],
  ['R8C3', 'R9C3'], ['R8C4', 'R9C4'], ['R8C5', 'R8C6'], ['R8C6', 'R9C6'],
  ['R8C7', 'R9C7'], ['R8C8', 'R8C9'],
];
// Round wall-spots: corners named by the quad's top-left cell (the cell
// whose own down-right diagonal, plus its right and down neighbours' shared
// corner, meet there). A spot blocks both diagonals through its corner even
// where no wall edge touches it.
const SPOTS_LIST = [
  'R1C2', 'R1C3', 'R1C5', 'R1C6', 'R1C7', 'R1C8', 'R2C1', 'R2C2',
  'R2C3', 'R2C6', 'R2C8', 'R3C1', 'R3C5', 'R3C6', 'R3C7', 'R3C8',
  'R4C1', 'R4C2', 'R4C3', 'R4C4', 'R4C5', 'R4C6', 'R4C7', 'R5C2',
  'R5C3', 'R5C4', 'R5C5', 'R5C6', 'R5C7', 'R5C8', 'R6C1', 'R6C3',
  'R6C4', 'R6C6', 'R6C7', 'R6C8', 'R7C1', 'R7C2', 'R7C4', 'R7C5',
  'R7C6', 'R7C7', 'R7C8', 'R8C1', 'R8C4', 'R8C5', 'R8C7', 'R8C8',
];
// The drawn fruit, each on the edge between the two cells it joins. Marty
// names the edge marks after fruit with no legend, but the name is the
// legend: blackcurrant is the black dot, grape the green one, redcurrant the
// red one. Row 7 alternates black and red the length of the row -- the
// title's own pun.
const BLACKCURRANTS = [
  ['R7C1', 'R7C2'], ['R7C3', 'R7C4'], ['R7C5', 'R7C6'], ['R7C7', 'R7C8'],
  ['R8C9', 'R9C9'],
];
const REDCURRANTS = [
  ['R7C2', 'R7C3'], ['R7C4', 'R7C5'], ['R7C6', 'R7C7'], ['R7C8', 'R7C9'],
];
const GRAPES = [
  ['R2C2', 'R2C3'], ['R3C3', 'R4C3'], ['R4C7', 'R5C7'], ['R5C2', 'R5C3'],
  ['R7C5', 'R8C5'], ['R7C9', 'R8C9'], ['R9C2', 'R9C3'], ['R9C6', 'R9C7'],
];
// The four dashed cages and each one's own electricity-marked cell.
const CAGES = [
  { cells: ['R1C9', 'R2C9'], shock: 'R1C9' },
  { cells: ['R5C4', 'R6C4'], shock: 'R6C4' },
  { cells: ['R6C2', 'R6C3'], shock: 'R6C2' },
  { cells: ['R8C5'], shock: 'R8C5' },
];

const shape = new Shape('9x9', NV, 'Raw');
const graph = cellGraph(shape);
const gridCells = graph.cells();
const posA = graph.makeOverlay('VA');     // signed path position mod 15
const posB = graph.makeOverlay('VB');     // signed path position mod 11
const seqA = n => 'VF' + n;               // rat 1's digit n steps from the cupcake
const seqB = n => 'VG' + n;               // rat 2's digit n steps from the cupcake

const wallSet = new Set();
for (const [a, b] of WALL_EDGES) { wallSet.add(a + '|' + b); wallSet.add(b + '|' + a); }
const spotSet = new Set(SPOTS_LIST);

// A diagonal step passes through the one corner its two cells share, named
// by the quad's top-left cell. The "2x2 space" it needs is that corner's
// four surrounding cells with no wall edge between any adjacent pair, and no
// round wall-spot drawn on the corner itself.
function cornerOpen(topLeft) {
  const right = graph.step(topLeft, 0, 1);
  const down = graph.step(topLeft, 1, 0);
  const diag = graph.step(topLeft, 1, 1);
  if (!right || !down || !diag) return false;
  if (spotSet.has(topLeft)) return false;
  const edges = [[topLeft, right], [topLeft, down], [right, diag], [down, diag]];
  return edges.every(([x, y]) => !wallSet.has(x + '|' + y));
}

// Is the (dRow, dCol) step out of `cell` a legal move?
const stepAllowed = (cell, dRow, dCol) => {
  if (dRow === 0 || dCol === 0) {
    const other = graph.step(cell, dRow, dCol);
    return other ? !wallSet.has(cell + '|' + other) : false;
  }
  const topLeft = dCol === 1 ? cell : graph.step(cell, 0, -1);
  return topLeft ? cornerOpen(topLeft) : false;
};

// --- Step variables -------------------------------------------------------
// One Var per legal king move; moves the maze forbids get no variable at all.
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

// --- Path shape -----------------------------------------------------------
// Per-cell machine: reads the cell's two counters, then every step it is an
// end of. A cell no rat visits takes the OFF counter and uses no step; a
// visited cell is entered once and left once by the same rat. The rats' own
// cells are only left, the cupcake is only entered, once by each rat.
const ROLE_OF = new Map([[RAT_CELLS[0], 'rat1'], [RAT_CELLS[1], 'rat2'],
[CUPCAKE, 'cupcake']]);
function cellNFA(incident, role) {
  const sig = 'cell|' + role + '|' + incident.map(s => s.out).join(',');
  return cached(sig, () => NFA.encodeSpec({
    startState: { k: 0 },
    transition: (s, value) => {
      if (s.k === 0) return { k: 1, vis: value !== OFF };
      if (s.k === 1) {
        if ((value !== OFF) !== s.vis) return undefined;
        return { k: 2, vis: s.vis, in1: 0, out1: 0, in2: 0, out2: 0 };
      }
      const n = s.k - 2;
      if (n >= incident.length) return undefined;
      const step = incident[n];
      const next = {
        k: s.k + 1, vis: s.vis,
        in1: s.in1, out1: s.out1, in2: s.in2, out2: s.out2,
      };
      if (value === step.in) next.in1++;
      else if (value === step.out) next.out1++;
      else if (value === step.in2) next.in2++;
      else if (value === step.out2) next.out2++;
      else if (value !== UNUSED) return undefined;
      if (next.in1 > 1 || next.out1 > 1 || next.in2 > 1 || next.out2 > 1) return undefined;
      return next;
    },
    accept: s => {
      if (s.k !== 2 + incident.length) return false;
      if (role === 'rat1') return s.vis && s.out1 === 1 && s.in1 === 0 && s.in2 === 0 && s.out2 === 0;
      if (role === 'rat2') return s.vis && s.out2 === 1 && s.in2 === 0 && s.in1 === 0 && s.out1 === 0;
      if (role === 'cupcake') return s.vis && s.in1 === 1 && s.in2 === 1 && s.out1 === 0 && s.out2 === 0;
      if (!s.vis) return s.in1 === 0 && s.out1 === 0 && s.in2 === 0 && s.out2 === 0;
      return (s.in1 === 1 && s.out1 === 1 && s.in2 === 0 && s.out2 === 0) ||
        (s.in2 === 1 && s.out2 === 1 && s.in1 === 0 && s.out1 === 0);
    },
  }, NV));
}
const pathShape = gridCells.map(cell => {
  const incident = stepsAt.get(cell);
  const role = ROLE_OF.get(cell) || 'plain';
  return new NFA(cellNFA(incident, role), 'path-cell',
    posA.at(cell), posB.at(cell), ...incident.map(s => s.id));
});

// Position counters. Both layers hold a cell's distance from the cupcake,
// pinned to 0; rat 1 counts that distance up and rat 2 counts it down, so the
// residue pair also says which rat stands on the cell. A closed cycle beside
// a path would need a length divisible by 15 and by 11 -- i.e. by 165 -- and
// there are only 81 cells, which degree alone cannot rule out.
const nextPos = (v, mod) => FIRST + ((v - FIRST + 1) % mod);
const counterNFA = mod => cached('counter|' + mod, () => NFA.encodeSpec({
  startState: { k: 0 },
  transition: (s, value) => {
    if (s.k === 0) return { k: 1, dir: value };
    if (s.k === 1) return { k: 2, dir: s.dir, a: value };
    if (s.k !== 2) return undefined;
    if (s.dir === UNUSED) return { done: true };
    if (s.a === OFF || value === OFF) return undefined;
    const [from, to] = (s.dir === A_FWD || s.dir === B_FWD) ? [s.a, value] : [value, s.a];
    if (s.dir === A_FWD || s.dir === A_BWD) return from === nextPos(to, mod) ? { done: true } : undefined;
    return to === nextPos(from, mod) ? { done: true } : undefined;
  },
  accept: s => s.done === true,
}, NV));
const counters = steps.flatMap(s => [
  new NFA(counterNFA(MOD_A), 'path-order', s.id, posA.at(s.a), posA.at(s.b)),
  new NFA(counterNFA(MOD_B), 'path-order', s.id, posB.at(s.a), posB.at(s.b)),
]);

// The two diagonals of a 2x2 block cross each other, and no path may cross
// itself or the other path.
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

// --- The two read-out sequences -------------------------------------------
// VF<n> and VG<n> hold the digit each rat stands on n steps from the cupcake
// (n = 0 is the cupcake itself), or NONE past that rat's own cell. A cell
// whose residue pair names position n on a rat's path must carry that rat's
// entry.
const residues = (n, sign) => [
  FIRST + ((((sign * n) % MOD_A) + MOD_A) % MOD_A),
  FIRST + ((((sign * n) % MOD_B) + MOD_B) % MOD_B),
];
const seqNFA = n => cached('seq|' + n, () => {
  const [oneA, oneB] = residues(n, 1);      // rat 1's position n
  const [twoA, twoB] = residues(n, -1);     // rat 2's position n
  return NFA.encodeSpec({
    startState: { k: 0 },
    transition: (s, value) => {
      if (s.k === 0) return { k: 1, one: value === oneA, two: value === twoA };
      if (s.k === 1) {
        return { k: 2, one: s.one && value === oneB, two: s.two && value === twoB };
      }
      if (s.k === 2) return { k: 3, one: s.one, two: s.two, d: value };
      if (s.k === 3) {
        if (s.one && value !== s.d) return undefined;
        return { k: 4, two: s.two, d: s.d };
      }
      if (s.k !== 4) return undefined;
      if (s.two && value !== s.d) return undefined;
      return { done: true };
    },
    accept: s => s.done === true,
  }, NV);
});
const sequence = [];
for (let n = 1; n <= MAX_POS; n++) {
  for (const cell of gridCells) {
    sequence.push(new NFA(seqNFA(n), 'digit-at-position',
      posA.at(cell), posB.at(cell), cell, seqA(n), seqB(n)));
  }
}

// Rat 1's own cell is the far end of its path, so its residue pair gives the
// common length: a position beyond it is NONE in both sequences, and a
// position at or before it is a real pair of digits summing to the cupcake's
// own digit -- the "zipper", read outward from the middle.
const positionFromResidues = (rA, rB) => {
  for (let n = 0; n <= MAX_POS; n++) {
    const [a, b] = residues(n, 1);
    if (a === rA && b === rB) return n;
  }
  return null;
};
const tailNFA = n => cached('tail|' + n, () => NFA.encodeSpec({
  startState: { k: 0 },
  transition: (s, value) => {
    if (s.k === 0) return { k: 1, rA: value };
    if (s.k === 1) {
      const len = positionFromResidues(s.rA, value);
      if (len === null) return undefined;
      return { k: 2, used: n <= len };
    }
    if (s.k === 2) {
      if (!s.used) return value === NONE ? { k: 3, used: false } : undefined;
      return value === NONE ? undefined : { k: 3, used: true, f: value };
    }
    if (s.k === 3) {
      if (!s.used) return value === NONE ? { k: 4, used: false } : undefined;
      return value === NONE ? undefined : { k: 4, used: true, want: s.f + value };
    }
    if (s.k !== 4) return undefined;
    return (!s.used || s.want === value) ? { done: true } : undefined;
  },
  accept: s => s.done === true,
}, NV));
const tail = [];
for (let n = 1; n <= MAX_POS; n++) {
  tail.push(new NFA(tailNFA(n), 'zipper-sum',
    posA.at(RAT_CELLS[0]), posB.at(RAT_CELLS[0]), seqA(n), seqB(n), CUPCAKE));
}
// Both rats visit the same number of cells: rat 2 counts down where rat 1
// counts up, so its own cell carries the negated residue of rat 1's.
const mirrorKey = mod => cached('mirror|' + mod, () => Pair.fnToKey(
  (x, y) => x > OFF && y > OFF && x <= FIRST + mod - 1 && y <= FIRST + mod - 1 &&
    (x - FIRST + y - FIRST) % mod === 0, NV));
const sameLength = [
  new Pair(mirrorKey(MOD_A), 'same-length',
    posA.at(RAT_CELLS[0]), posA.at(RAT_CELLS[1])),
  new Pair(mirrorKey(MOD_B), 'same-length',
    posB.at(RAT_CELLS[0]), posB.at(RAT_CELLS[1])),
];

// --- SOMEDOKU ---------------------------------------------------------------
// VN holds the constants 1..9, used as CountDistinct controls: row N and
// column N must show exactly N distinct digits.
const range = (lo, hi) => Array.from({ length: hi - lo + 1 }, (_, n) => lo + n);
const LABELS = range(1, 9);
const counts = new Var('N', 'Counts 1-9', 9);
const countConstants = LABELS.map(n => new Given(counts.cell(n), n));
const someduku = LABELS.flatMap(n => [
  new CountDistinct(counts.cell(n), ...graph.row(n)),
  new CountDistinct(counts.cell(n), ...graph.column(n)),
]);

// --- Cages -------------------------------------------------------------
// No repeats within a cage, and every cage's total is the same unknown value
// -- including the single-cell cage, whose "total" is just its own digit.
const cageDistinct = CAGES.filter(c => c.cells.length > 1)
  .map(c => new AllDifferent(...c.cells));
const cageEqualTotal = new EqualSum(...CAGES.map(c => c.cells));
// If a cage's own electricity cell holds 5 or higher, neither rat's path may
// visit any cell of that cage -- posA off is enough, since the per-cell path
// machine already ties posB's off-ness to it.
const cageShock = CAGES.map(c => new Or([
  new Given(c.shock, 1, 2, 3, 4),
  new And([
    new Given(c.shock, 5, 6, 7, 8, 9),
    ...c.cells.map(cell => new Given(posA.at(cell), OFF)),
  ]),
]));

// --- Variables and domains ------------------------------------------------
const layers = [
  posA.toVar('distance from the cupcake, mod ' + MOD_A),
  posB.toVar('distance from the cupcake, mod ' + MOD_B),
  new Var('S', 'path steps', steps.length),
  new Var('F', 'rat 1 digit by position', MAX_POS),
  new Var('G', 'rat 2 digit by position', MAX_POS),
  counts,
];
const domains = [
  graph.makeReplicate(new Given(gridCells[0], ...range(1, 9))),
  // VA needs no domain of its own: the sentinel plus MOD_A residues is exactly
  // the 16-value alphabet.
  posB.makeReplicate(new Given(posB.at(gridCells[0]), ...range(1, MOD_B + 1))),
  // The step Vars need no domain of their own: the path-cell machines accept
  // no value on them but unused / in / out, for either rat.
  ...range(1, MAX_POS).flatMap(n => [
    new Given(seqA(n), ...range(1, 9), NONE),
    new Given(seqB(n), ...range(1, 9), NONE)]),
  new Given(posA.at(CUPCAKE), FIRST),
  new Given(posB.at(CUPCAKE), FIRST),
];

return [
  shape,
  ...layers,
  ...domains,
  ...countConstants,
  ...someduku,
  ...BLACKCURRANTS.map(([x, y]) => new BlackDot(x, y)),
  // One odd and one even is a complete residue system mod 2.
  ...REDCURRANTS.map(([x, y]) => new Modular(2, x, y)),
  ...GRAPES.map(([x, y]) => new Whisper(5, x, y)),
  ...cageDistinct,
  cageEqualTotal,
  ...cageShock,
  ...pathShape,
  ...counters,
  ...noCross,
  ...sequence,
  ...tail,
  ...sameLength,
];
