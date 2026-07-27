// Title: RAT RUN 35: Locked Out
// Author: Marty Sears
// Video: https://www.youtube.com/watch?v=3f0DV9fBoyk
// Source: https://sudokupad.app/s64txn1v6l

// Normal sudoku. Two rats stand on R1C5 and R9C6 and each walks through the maze
// to a cupcake, of R2C5 and R4C1; they reach different cupcakes. A walk visits no
// cell twice, the two walks share no cell, neither crosses itself or the other,
// and no step passes through a thick maze wall. A step is orthogonal, or diagonal
// when the 2x2 area it cuts across is free of walls and its shared corner carries
// no round wall spot.
// Entering a teleport transports a rat instantly to the matching teleport.
// Matching teleports hold identical digits; teleports that do not match hold
// different digits.
// A blackcurrant sits between two digits, one of which is double the other.
// A redcurrant sits between an odd digit and an even digit.
// Test constraint: on a path segment whose two ends are teleports, no other cell
// of the segment holds either end's digit or a digit between them.
//
// Nothing is omitted. Which rat is Finkz and which is Phinx is never used: no rule
// names either marker and no clue distinguishes the two walks.

// The alphabet is widened so the Var layers can carry the position counters; the
// 81 grid cells are pinned back to 1-9 below.
const NV = 11;
// Coprime moduli: a closed cycle of steps beside the walks would need a length
// divisible by both, i.e. 90, and the grid holds 81 cells.
const MOD_A = 10, MOD_B = 9;
const OFF = 1;                  // counter value for a cell no rat visits
const FIRST = 2;                // counter value of a walk's first cell
// Step values. A step is stored once, on the (a, b) pair built below; FWD means
// the rat walked a->b and BWD b->a, so the counters can tell direction.
const UNUSED = 1;
const A_FWD = 2, A_BWD = 3, B_FWD = 4, B_BWD = 5;
// Segment-end value meaning "this end of the segment is not a teleport" -- a rat
// marker, a cupcake, or a cell no rat visits at all.
const NONE = 10;

const RAT_A = 'R1C5', RAT_B = 'R9C6';     // the two rat emoji
const CUPCAKES = ['R2C5', 'R4C1'];        // the two cupcake emoji

// The thick slate maze walls, as drawn: polylines on the corner lattice, where
// corner (i, j) is the bottom-right corner of RiCj, so the lattice runs 0..9. Two
// of them also trace the grid boundary, which separates no two grid cells.
const WALLS = [
  [[8, 1], [8, 3]],
  [[2, 2], [1, 2], [1, 1], [0, 1], [0, 9], [9, 9], [9, 0], [7, 0], [7, 3]],
  [[0, 1], [0, 0], [7, 0]],
  [[0, 5], [2, 5], [2, 3], [6, 3]],
  [[1, 5], [1, 3]],
  [[0, 7], [1, 7]],
  [[4, 9], [4, 6], [5, 6]],
  [[9, 6], [8, 6], [8, 4], [7, 4]],
  [[7, 1], [6, 1]],
  [[3, 0], [3, 3]],
  [[4, 0], [4, 2]],
  [[5, 3], [5, 4]],
  [[6, 2], [5, 2], [5, 1]],
  [[7, 5], [6, 5], [6, 4]],
  [[1, 8], [2, 8], [2, 6], [1, 6]],
  [[4, 4], [4, 5], [5, 5]],
  [[6, 7], [7, 7]],
  [[5, 7], [5, 8], [6, 8]],
  [[8, 7], [8, 8], [7, 8]],
];
// The 41 round slate wall spots, each on a corner of the same lattice.
const SPOTS = [
  [1, 1], [1, 2], [1, 3], [1, 6], [1, 7], [1, 8],
  [2, 1], [2, 2], [2, 3], [2, 5], [2, 6], [2, 8],
  [4, 2], [4, 4], [4, 5], [4, 6],
  [5, 1], [5, 2], [5, 4], [5, 5], [5, 6], [5, 7], [5, 8],
  [6, 1], [6, 2], [6, 3], [6, 4], [6, 5], [6, 7], [6, 8],
  [7, 3], [7, 4], [7, 5], [7, 7], [7, 8],
  [8, 1], [8, 3], [8, 4], [8, 6], [8, 7], [8, 8],
];
// The nine teleport pairs, read off the coloured tiles and their A-I labels.
const TELEPORTS = [
  ['R1C1', 'R7C3'],   // A, yellow
  ['R1C2', 'R8C9'],   // B, blue
  ['R1C4', 'R9C3'],   // C, green
  ['R2C4', 'R7C5'],   // D, sky
  ['R2C8', 'R4C4'],   // E, red
  ['R4C2', 'R6C7'],   // F, violet
  ['R4C6', 'R8C7'],   // G, cyan
  ['R6C9', 'R9C5'],   // H, orange
  ['R7C1', 'R8C4'],   // I, pink
];
// The drawn black and red edge dots, each named by the two cells its edge
// separates.
const BLACKCURRANTS = [
  ['R8C4', 'R9C4'], ['R9C3', 'R9C4'], ['R5C3', 'R6C3'],
];
const REDCURRANTS = [
  ['R6C5', 'R6C6'],
];

const shape = new Shape('9x9', NV);
const graph = cellGraph(shape);
const gridCells = graph.cells();
const posA = graph.makeOverlay('VA');     // walk position mod MOD_A
const posB = graph.makeOverlay('VB');     // walk position mod MOD_B
const segP = graph.makeOverlay('VP');     // digit of the teleport starting the
const segQ = graph.makeOverlay('VQ');     // segment, and the one ending it

// --- The maze -------------------------------------------------------------
// Split the wall polylines into unit lattice segments: 'H|i|j' runs from corner
// (i, j) to (i, j+1) and so separates RiC(j+1) from R(i+1)C(j+1); 'V|i|j' runs
// from (i, j) to (i+1, j) and separates R(i+1)Cj from R(i+1)C(j+1).
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
// corner, and it may not pass through a wall spot.
const cornerOpen = (i, j) => !spotSet.has(`${i}|${j}`) &&
  !wallSegments.has(`V|${i - 1}|${j}`) && !wallSegments.has(`V|${i}|${j}`) &&
  !wallSegments.has(`H|${i}|${j - 1}`) && !wallSegments.has(`H|${i}|${j}`);

const stepAllowed = (cell, dRow, dCol) => {
  const { row, col } = parseCellId(cell);
  if (dRow === 0) {
    return !wallSegments.has(`V|${row - 1}|${col + Math.min(dCol, 0)}`);
  }
  if (dCol === 0) {
    return !wallSegments.has(`H|${Math.min(row, row + dRow)}|${col - 1}`);
  }
  return cornerOpen(Math.min(row, row + dRow), Math.min(col, col + dCol));
};

// --- Step variables -------------------------------------------------------
// One Var per move the maze leaves open, recording whether a walk uses it and in
// which direction; a walled or spotted move gets no variable at all, which is how
// the maze is enforced. Each teleport pair adds one more such move, joining its
// two tiles wherever they sit.
const steps = [];
const stepsAt = new Map(gridCells.map(cell => [cell, []]));
const addStep = (a, b) => {
  const step = { id: 'VS' + (steps.length + 1), a, b };
  steps.push(step);
  stepsAt.get(a).push({ id: step.id, out: A_FWD, in: A_BWD, out2: B_FWD, in2: B_BWD });
  stepsAt.get(b).push({ id: step.id, out: A_BWD, in: A_FWD, out2: B_BWD, in2: B_FWD });
  return step;
};
for (const cell of gridCells) {
  for (const [dRow, dCol] of [[0, 1], [1, 0], [1, 1], [1, -1]]) {
    const other = graph.step(cell, dRow, dCol);
    if (!other || !stepAllowed(cell, dRow, dCol)) continue;
    addStep(cell, other);
  }
}
const footSteps = steps.slice();                       // the on-foot moves
const teleportSteps = TELEPORTS.map(([a, b]) => addStep(a, b));
const stepIndex = new Map(steps.map(s => [s.a + '|' + s.b, s]));
const stepBetween = (p, q) => stepIndex.get(p + '|' + q) || stepIndex.get(q + '|' + p);

const memo = new Map();
const cached = (key, build) => {
  if (!memo.has(key)) memo.set(key, build());
  return memo.get(key);
};

// --- Walk shape -----------------------------------------------------------
// Per-cell machine: reads the cell's two counters, then every step it is an end
// of. A cell no rat visits takes the OFF counter in both layers and uses no step;
// any other cell is entered once and left once by one and the same rat. A rat's
// own cell is only left, a cupcake only entered.
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
// Each rat leaves its own cell once and enters nothing, so counting arrivals over
// the whole grid leaves exactly one cell per rat that is entered and never left;
// only the two cupcakes may be such a cell, and each of them takes exactly one
// arrival. That is what makes the two rats reach different cupcakes.
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

// The two diagonals of a 2x2 area cross each other, and no walk may cross itself
// or the other walk. Orthogonal steps meet only at cells they share, which no
// cell being used twice already forbids, and a teleport is instantaneous rather
// than a drawn line, so neither needs anything further.
const noCrossKey = Pair.fnToKey((x, y) => x === UNUSED || y === UNUSED, NV);
const noCross = gridCells.flatMap(cell => {
  const right = graph.step(cell, 0, 1);
  const down = graph.step(cell, 1, 0);
  const diag = graph.step(cell, 1, 1);
  if (!right || !down || !diag) return [];
  const d1 = stepBetween(cell, diag);
  const d2 = stepBetween(right, down);
  return (d1 && d2) ? [new Pair(noCrossKey, 'no-crossing', d1.id, d2.id)] : [];
});

// --- Teleports ------------------------------------------------------------
// A rat that walks onto a teleport tile is transported at once, and a rat that
// arrives by the transport leaves on foot; either way a visited tile spends its
// single arrival or its single departure on the link. So the link is used exactly
// when the tile is visited, which the OFF counter value reports. Neither tile is
// a rat or a cupcake, so no visited tile is missing an arrival or a departure.
const teleportLinkKey = Pair.fnToKey(
  (position, step) => (position === OFF) === (step === UNUSED), NV);
const teleportLinks = teleportSteps.flatMap(s => [
  new Pair(teleportLinkKey, 'teleport-link', posA.at(s.a), s.id),
  new Pair(teleportLinkKey, 'teleport-link', posA.at(s.b), s.id),
]);
const teleportDigits = [
  ...TELEPORTS.map(([a, b]) => new SameValues(2, a, b)),
  // Each pair already shares a digit, so one tile per pair carries "teleports
  // that don't match always have different digits".
  new AllDifferent(...TELEPORTS.map(([a]) => a)),
];

// --- Test constraint ------------------------------------------------------
// The teleport jumps cut a walk into maximal on-foot runs. Two layers name the
// run a cell belongs to by its two ends: VP holds the digit of the teleport the
// run starts from and VQ the digit of the teleport it ends at, with NONE where
// that end is a rat marker or a cupcake instead. Both are constant along a run,
// so a used on-foot step carries them across unchanged.
const carryNFA = cached('segment-carry', () => NFA.encodeSpec({
  startState: { k: 0 },
  transition: (s, value) => {
    if (s.k === 0) return { k: 1, free: value === UNUSED };
    if (s.free) return s.k === 4 ? { done: true } : { k: s.k + 1, free: true };
    if (s.k === 1) return { k: 2, free: false, v: value };
    if (s.k === 2) return value === s.v ? { k: 3, free: false } : undefined;
    if (s.k === 3) return { k: 4, free: false, v: value };
    if (s.k === 4) return value === s.v ? { done: true } : undefined;
    return undefined;
  },
  accept: s => s.done === true,
}, NV));
const segmentCarry = footSteps.map(s => new NFA(carryNFA, 'segment-carry',
  s.id, segP.at(s.a), segP.at(s.b), segQ.at(s.a), segQ.at(s.b)));

// A used link ends one run at the tile it leaves and starts the next at the tile
// it reaches, so that tile's VQ resp. VP is the pair's own digit; the other layer
// of each tile is carried in from the run it belongs to. An unused link means
// neither tile is visited, and then both layers are NONE at both tiles. Reads the
// digit of the a-end only, since SameValues has already tied the pair together.
const linkNFA = cached('teleport-segment', () => NFA.encodeSpec({
  startState: { k: 0 },
  transition: (s, value) => {
    if (s.k === 0) {
      if (value === UNUSED) return { k: 1, kind: 'off' };
      const fwd = value === A_FWD || value === B_FWD;
      return { k: 1, kind: fwd ? 'fwd' : 'bwd' };
    }
    if (s.k === 1) {
      return s.kind === 'off' ? { k: 2, kind: 'off' }
        : { k: 2, kind: s.kind, d: value };
    }
    if (s.k > 5) return undefined;
    if (s.kind === 'off') {
      return value === NONE ? { k: s.k + 1, kind: 'off' } : undefined;
    }
    // k = 2..5 reads VP(a), VQ(a), VP(b), VQ(b) in turn.
    const pinned = s.kind === 'fwd' ? (s.k === 3 || s.k === 4)
      : (s.k === 2 || s.k === 5);
    if (pinned && value !== s.d) return undefined;
    return { k: s.k + 1, kind: s.kind, d: s.d };
  },
  accept: s => s.k === 6,
}, NV));
const teleportSegments = teleportSteps.map(s => new NFA(linkNFA, 'teleport-segment',
  s.id, s.a, segP.at(s.a), segQ.at(s.a), segP.at(s.b), segQ.at(s.b)));

// The rule's own scope: a run with a teleport at each end, and only the cells
// between those two ends. A teleport tile is never such an in-between cell -- a
// rat walking onto one is transported away, so the run stops there, and a rat
// delivered onto one starts the next run there -- so only the other 63 cells need
// the machine, and NONE on either layer switches it off. It also holds the two
// layers at NONE on a cell no rat visits, which the link machine above does for
// the teleport tiles.
const rangeNFA = cached('segment-range', () => NFA.encodeSpec({
  startState: { k: 0 },
  transition: (s, value) => {
    if (s.k === 0) return { k: 1, off: value === OFF };
    if (s.k === 1) return s.off ? { k: 2, off: true } : { k: 2, off: false, d: value };
    if (s.k === 2) {
      if (s.off) return value === NONE ? { k: 3, off: true } : undefined;
      return { k: 3, off: false, d: s.d, p: value };
    }
    if (s.k !== 3) return undefined;
    if (s.off) return value === NONE ? { done: true } : undefined;
    if (s.p === NONE || value === NONE) return { done: true };
    const lo = Math.min(s.p, value), hi = Math.max(s.p, value);
    return (s.d < lo || s.d > hi) ? { done: true } : undefined;
  },
  accept: s => s.done === true,
}, NV));
const teleportCells = new Set(TELEPORTS.flat());
const segmentRange = gridCells.filter(cell => !teleportCells.has(cell)).map(
  cell => new NFA(rangeNFA, 'segment-range',
    posA.at(cell), cell, segP.at(cell), segQ.at(cell)));

// --- Currants -------------------------------------------------------------
const blackcurrants = BLACKCURRANTS.map(([x, y]) => new BlackDot(x, y));
const oppositeParityKey = Pair.fnToKey((x, y) => (x + y) % 2 === 1, NV);
const redcurrants = REDCURRANTS.map(
  ([x, y]) => new Pair(oppositeParityKey, 'redcurrant', x, y));

// --- Variables and domains ------------------------------------------------
const range = (lo, hi) => Array.from({ length: hi - lo + 1 }, (_, n) => lo + n);
const layers = [
  posA.toVar('walk position mod ' + MOD_A),
  posB.toVar('walk position mod ' + MOD_B),
  segP.toVar('segment start teleport digit'),
  segQ.toVar('segment end teleport digit'),
  new Var('S', 'walk steps', steps.length),
];
const domains = [
  graph.makeReplicate(new Given(gridCells[0], ...range(1, 9))),
  // VA needs no domain of its own: the OFF sentinel plus MOD_A residues is
  // exactly the widened alphabet.
  posB.makeReplicate(new Given(posB.at(gridCells[0]), ...range(1, MOD_B + 1))),
  // VP and VQ hold a teleport digit or the NONE sentinel.
  segP.makeReplicate(new Given(segP.at(gridCells[0]), ...range(1, 9), NONE)),
  segQ.makeReplicate(new Given(segQ.at(gridCells[0]), ...range(1, 9), NONE)),
  // The step Vars need no domain of their own: the walk-cell machines accept no
  // value on them but unused / in / out, for either rat.
  // Each rat's own cell is the first cell of its walk; without this the whole
  // numbering of a walk could rotate freely through the residues.
  ...[RAT_A, RAT_B].flatMap(cell => [
    new Given(posA.at(cell), FIRST), new Given(posB.at(cell), FIRST)]),
  // A run leaving a rat marker has no teleport at its start, and one arriving at
  // a cupcake has none at its end.
  new Given(segP.at(RAT_A), NONE),
  new Given(segP.at(RAT_B), NONE),
  ...CUPCAKES.map(cell => new Given(segQ.at(cell), NONE)),
];

return [
  shape,
  ...layers,
  ...domains,
  ...walkShape,
  ...counters,
  ...noCross,
  ...teleportLinks,
  ...teleportDigits,
  ...segmentCarry,
  ...teleportSegments,
  ...segmentRange,
  ...blackcurrants,
  ...redcurrants,
];
