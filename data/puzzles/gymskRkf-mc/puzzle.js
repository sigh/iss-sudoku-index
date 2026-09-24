// Title: FEEDING FRIENDSy: A Slither of Cake
// Author: Lake
// Video: https://www.youtube.com/watch?v=gymskRkf-mc
// Source: https://sudokupad.app/g7j9xbggr4

// Normal sudoku, given R5C4 = 8.
//
// Snaake starts on R7C1 (the drawn snake head) and must reach the cake on
// R3C7 along a path that visits no cell more than once, never crosses itself,
// and never passes through a thick maze wall. A step is orthogonal, or
// diagonal when there is a 2x2 space to move through -- no wall on any of the
// four unit edges meeting at the corner the two cells share -- and no squared
// wall-spot sits on that corner.
//
// WORMHOLES: orange R7C5 <-> R9C3 and blue R2C8 <-> R7C9. Entering one carries
// Snaake to its partner, from where he continues; a wormhole cell is either
// unvisited or used as one jump in place of an ordinary move. The two cells of
// a pair need not share a digit.
//
// ONE-WAY DOORS: six arrows, each on an edge between two cells. Snaake may
// cross that edge directly only in the arrow's direction, and the arrow points
// at the smaller digit.
//
// WHITE PELLETS: nine white diamonds join consecutive digits, and every one
// must be eaten -- the orthogonal step across its edge is on the path. Not all
// possible white pellets are given, so no other pair is constrained.
//
// BLACK PELLETS: four black diamonds join digits in a 1:2 ratio; they need not
// be eaten, and not all possible ones are given.
//
// TRIALS AND TRAILS: box borders and wormhole jumps cut the path into
// segments; a segment's total is the sum of its digits. Every two segments
// visited one after the other have totals differing by the same amount D,
// which the solver finds. "Difference" is read unsigned, |T(k+1) - T(k)| = D.
//
// Nothing is omitted.

const range = (lo, hi) => Array.from({ length: hi - lo + 1 }, (_, n) => lo + n);
const memo = new Map();
const cached = (key, build) => {
  if (!memo.has(key)) memo.set(key, build());
  return memo.get(key);
};

// The alphabet is widened to 16 so the Var overlays can carry step codes, the
// path-position counters and the segment bookkeeping below; the 81 grid cells
// are pinned back to 1-9.
const NV = 16;
const shape = new Shape('9x9', NV);
const graph = cellGraph(shape);
const gridCells = graph.cells();

const START = 'R7C1';  // the drawn snake head
const CAKE = 'R3C7';   // the cake emoji

// --- The drawn maze --------------------------------------------------------
// WALLS is the fourteen dark thickness-12 polylines, transcribed as drawn:
// SudokuPad's [row, col], 0-indexed, integer = a lattice corner, so corner
// (i, j) is the intersection just above-left of 0-indexed cell (i, j). The
// grid boundary is part of the same strokes and is kept as drawn.
const WALLS = [
  [[3, 3], [6, 3], [6, 2], [9, 2], [9, 9], [0, 9], [0, 7], [1, 7]],
  [[9, 2], [9, 0], [0, 0], [0, 7]],
  [[4, 2], [5, 2]],
  [[2, 2], [2, 4]],
  [[1, 3], [1, 4]],
  [[2, 6], [2, 8]],
  [[2, 7], [3, 7]],
  [[3, 8], [5, 8]],
  [[4, 4], [5, 4]],
  [[4, 5], [5, 5]],
  [[3, 4], [3, 5]],
  [[6, 5], [7, 5]],
  [[8, 3], [8, 4]],
  [[8, 6], [8, 7]],
];
// SPOTS is the thirty-two dark 0.19 squares on interior lattice corners, in
// the same 0-indexed [row, col] coordinates.
const SPOTS = [
  [1, 1], [1, 2], [1, 3], [1, 4], [1, 7], [2, 1], [2, 2], [2, 4],
  [2, 6], [2, 8], [3, 3], [3, 4], [3, 5], [3, 7], [3, 8], [4, 2],
  [4, 4], [4, 5], [4, 7], [5, 2], [5, 4], [5, 5], [5, 8], [6, 1],
  [6, 2], [6, 3], [6, 5], [7, 5], [8, 3], [8, 4], [8, 6], [8, 7],
];
// The six dark chevrons, written [from, to]: `to` is the cell the chevron's
// apex (its middle waypoint) lies in, so `to` holds the smaller digit and is
// the only direction in which Snaake may cross that edge.
const ONE_WAY = [
  ['R1C2', 'R1C1'], ['R3C2', 'R3C1'], ['R8C3', 'R7C3'],
  ['R9C8', 'R9C9'], ['R6C5', 'R6C4'], ['R5C1', 'R4C1'],
];
// The nine white-filled and four black-filled 0.14 diamonds on cell edges.
const WHITE_PELLETS = [
  ['R5C1', 'R6C1'], ['R5C3', 'R6C3'], ['R8C2', 'R9C2'], ['R7C4', 'R8C4'],
  ['R6C6', 'R6C7'], ['R6C7', 'R7C7'], ['R1C9', 'R2C9'], ['R1C5', 'R1C6'],
  ['R3C4', 'R4C4'],
];
const BLACK_PELLETS = [
  ['R7C1', 'R7C2'], ['R5C2', 'R6C2'], ['R5C5', 'R6C5'], ['R7C8', 'R8C8'],
];
// The snake-emoji cells, paired by their orange / blue fill.
const WORMHOLES = [['R7C5', 'R9C3'], ['R2C8', 'R7C9']];

// Split the polylines into unit lattice segments. wallH.has('i|j') means a
// wall spans corner row i from column j to j+1; wallV.has('i|j') means a wall
// spans corner column j from row i to i+1.
const wallH = new Set();
const wallV = new Set();
for (const line of WALLS) {
  for (let n = 1; n < line.length; n++) {
    const [r0, c0] = line[n - 1], [r1, c1] = line[n];
    if (r0 === r1) {
      for (let c = Math.min(c0, c1); c < Math.max(c0, c1); c++) wallH.add(`${r0}|${c}`);
    } else {
      for (let r = Math.min(r0, r1); r < Math.max(r0, r1); r++) wallV.add(`${r}|${c0}`);
    }
  }
}
const spotSet = new Set(SPOTS.map(([i, j]) => `${i}|${j}`));

const orthBlocked = (r, c, dr, dc) => dr === 0
  ? wallV.has(`${r}|${c + Math.max(dc, 0)}`)
  : wallH.has(`${r + Math.max(dr, 0)}|${c}`);
// A diagonal step cuts across the corner shared by its 2x2 block; it needs no
// wall on the four unit segments meeting there and no wall-spot on it.
const cornerBlocked = (i, j) => spotSet.has(`${i}|${j}`) ||
  wallV.has(`${i - 1}|${j}`) || wallV.has(`${i}|${j}`) ||
  wallH.has(`${i}|${j - 1}`) || wallH.has(`${i}|${j}`);

const boxOf = cell => {
  const { row, col } = parseCellId(cell);
  return Math.floor((row - 1) / 3) * 3 + Math.floor((col - 1) / 3);
};

// --- Step variables ----------------------------------------------------------
// One Var per legal move; a move the maze forbids gets no variable at all.
// FWD means the step's `a` end was left for its `b` end, BWD the reverse.
// `cut` marks a step that ends a segment: it crosses a box border, or it is a
// wormhole jump.
const UNUSED = 1, FWD = 2, BWD = 3;
const DIRS = [[0, 1], [1, 0], [1, 1], [1, -1]]; // each undirected edge once
const oneWayDir = new Map();
for (const [from, to] of ONE_WAY) {
  oneWayDir.set(`${from}|${to}`, FWD);
  oneWayDir.set(`${to}|${from}`, BWD);
}
const steps = [];
const stepByOrigin = new Map(); // 'r,c,dr,dc' -> step, for the no-crossing check
const stepByPair = new Map();   // 'a|b' -> step, for the pellets
const stepsAt = new Map(gridCells.map(cell => [cell, []]));
for (let r = 0; r < 9; r++) {
  for (let c = 0; c < 9; c++) {
    for (const [dr, dc] of DIRS) {
      const r2 = r + dr, c2 = c + dc;
      if (r2 < 0 || r2 > 8 || c2 < 0 || c2 > 8) continue;
      const legal = (dr === 0 || dc === 0)
        ? !orthBlocked(r, c, dr, dc)
        : !cornerBlocked(r + 1, c + Math.max(dc, 0));
      if (!legal) continue;
      const a = makeCellId(r + 1, c + 1), b = makeCellId(r2 + 1, c2 + 1);
      const id = 'VS' + (steps.length + 1);
      const step = { id, a, b, cut: boxOf(a) !== boxOf(b),
        allowed: oneWayDir.get(`${a}|${b}`) || null };
      steps.push(step);
      stepByOrigin.set(`${r},${c},${dr},${dc}`, step);
      stepByPair.set(`${a}|${b}`, step);
      stepByPair.set(`${b}|${a}`, step);
      stepsAt.get(a).push({ id, in: BWD, out: FWD });
      stepsAt.get(b).push({ id, in: FWD, out: BWD });
    }
  }
}
// Each wormhole pair is one more edge with the same three-value code.
const jumps = WORMHOLES.map(([a, b], n) => ({ id: 'VT' + (n + 1), a, b, cut: true }));
const jumpSide = new Map();
jumps.forEach(j => { jumpSide.set(j.a, { j, first: true }); jumpSide.set(j.b, { j, first: false }); });

// --- Per-cell layers ---------------------------------------------------------
// OFF (1) marks an unvisited cell on every layer. A residue r is stored as r+2.
const OFF = 1, FIRST = 2;
const enc = r => r + 2;
const MOD_A = 15, MOD_B = 11;   // path position; lcm 165 > 81 cells
const SUM_A = 11, SUM_B = 13;   // segment sums; lcm 143 > 2 * 44 + 1
const posA = graph.makeOverlay('VA');
const posB = graph.makeOverlay('VB');
// VC/VE: running total of the current segment up to and including this cell.
const curA = graph.makeOverlay('VC');
const curB = graph.makeOverlay('VE');
// VP/VQ: total of the previous segment, or OFF (none yet) on the first one.
const prevA = graph.makeOverlay('VP');
const prevB = graph.makeOverlay('VQ');
// VD1/VD2: the common difference D as residues mod SUM_A / SUM_B.
const D_A = 'VD1', D_B = 'VD2';

// --- Per-cell path-shape machines -------------------------------------------
// Every machine reads its cell's incident step values and counts how many say
// "arriving" (step.in) versus "leaving" (step.out) at this cell.
const incidentSig = incident => incident.map(s => s.in + '/' + s.out).join(',');
function scanDegree(incident, wantIn, wantOut) {
  return {
    startState: { k: 0, in: 0, out: 0 },
    transition: (s, value) => {
      if (s.k >= incident.length) return undefined;
      const step = incident[s.k];
      let { in: nIn, out: nOut } = s;
      if (value === step.in) nIn++;
      else if (value === step.out) nOut++;
      else if (value !== UNUSED) return undefined;
      if (nIn > wantIn || nOut > wantOut) return undefined;
      return { k: s.k + 1, in: nIn, out: nOut };
    },
    accept: s => s.k === incident.length && s.in === wantIn && s.out === wantOut,
  };
}
// The start (0 in, 1 out) and the cake (1 in, 0 out) are always on the path.
function fixedCellConstraint(incident, wantIn, wantOut) {
  const key = cached(`fixed|${wantIn}|${wantOut}|${incidentSig(incident)}`,
    () => NFA.encodeSpec(scanDegree(incident, wantIn, wantOut), NV));
  return new NFA(key, 'path-cell', ...incident.map(s => s.id));
}
// A plain cell is off the path (0 in, 0 out) or an interior path cell (1/1).
// Its position counter is read first purely as the visited flag.
function plainCellConstraint(cell, incident) {
  const cells = [posA.at(cell), ...incident.map(s => s.id)];
  const key = cached('plain|' + incidentSig(incident), () => NFA.encodeSpec({
    startState: { k: 0 },
    transition: (s, value) => {
      if (s.k === 0) return { k: 1, visited: value !== OFF, in: 0, out: 0 };
      if (s.k - 1 >= incident.length) return undefined;
      const step = incident[s.k - 1];
      let { in: nIn, out: nOut } = s;
      if (value === step.in) nIn++;
      else if (value === step.out) nOut++;
      else if (value !== UNUSED) return undefined;
      const cap = s.visited ? 1 : 0;
      if (nIn > cap || nOut > cap) return undefined;
      return { k: s.k + 1, visited: s.visited, in: nIn, out: nOut };
    },
    accept: s => {
      const cap = s.visited ? 1 : 0;
      return s.k === 1 + incident.length && s.in === cap && s.out === cap;
    },
  }, NV));
  return new NFA(key, 'path-cell', ...cells);
}
// A wormhole cell's role is fixed by its jump Var, read first: unused means
// the cell is off the path; a used jump makes this side either the entry (one
// ordinary arriving step, no ordinary leaving step) or the exit (the reverse).
// No state lets an ordinary step both arrive and leave, so entering a wormhole
// always transports Snaake.
function wormholeCellConstraint(jumpId, incident, sideIsFirst) {
  const wanted = t => {
    if (t === UNUSED) return { wantIn: 0, wantOut: 0 };
    if (t !== FWD && t !== BWD) return null;
    const isEntry = (t === FWD) === sideIsFirst;
    return { wantIn: isEntry ? 1 : 0, wantOut: isEntry ? 0 : 1 };
  };
  const key = cached('worm|' + sideIsFirst + '|' + incidentSig(incident), () => NFA.encodeSpec({
    startState: { k: -1 },
    transition: (s, value) => {
      if (s.k === -1) {
        const w = wanted(value);
        return w ? { k: 0, in: 0, out: 0, ...w } : undefined;
      }
      if (s.k >= incident.length) return undefined;
      const step = incident[s.k];
      let { in: nIn, out: nOut } = s;
      if (value === step.in) nIn++;
      else if (value === step.out) nOut++;
      else if (value !== UNUSED) return undefined;
      if (nIn > s.wantIn || nOut > s.wantOut) return undefined;
      return { ...s, k: s.k + 1, in: nIn, out: nOut };
    },
    accept: s => s.k === incident.length && s.in === s.wantIn && s.out === s.wantOut,
  }, NV));
  return new NFA(key, 'path-cell', jumpId, ...incident.map(s => s.id));
}
const pathShape = gridCells.map(cell => {
  const incident = stepsAt.get(cell);
  if (cell === START) return fixedCellConstraint(incident, 0, 1);
  if (cell === CAKE) return fixedCellConstraint(incident, 1, 0);
  if (jumpSide.has(cell)) {
    const { j, first } = jumpSide.get(cell);
    return wormholeCellConstraint(j.id, incident, first);
  }
  return plainCellConstraint(cell, incident);
});
// The four layers that must be set on every visited cell are OFF together.
// The previous-total layers may be OFF on a visited cell (first segment), but
// must be OFF on an unvisited one.
const offGateKey = cached('off-gate', () => NFA.encodeSpec({
  startState: { k: 0 },
  transition: (s, value) => {
    if (s.k === 0) return { k: 1, off: value === OFF };
    if (s.k <= 3) return (value === OFF) === s.off ? { k: s.k + 1, off: s.off } : undefined;
    if (s.k <= 5) return (!s.off || value === OFF) ? { k: s.k + 1, off: s.off } : undefined;
    return undefined;
  },
  accept: s => s.k === 6,
}, NV));
const offGates = gridCells.map(cell => new NFA(offGateKey, 'path-off-gate',
  posA.at(cell), posB.at(cell), curA.at(cell), curB.at(cell), prevA.at(cell), prevB.at(cell)));

// --- Subtour elimination: two coprime modular position counters -------------
// "The arriving cell's counter is the leaving cell's plus one" numbers a real
// path from the start; a closed loop of steps beside it would need a length
// divisible by lcm(15, 11) = 165, and there are only 81 cells.
const nextPos = (v, mod) => FIRST + ((v - FIRST + 1) % mod);
const counterNFA = mod => cached('counter|' + mod, () => NFA.encodeSpec({
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
}, NV));
const allEdges = [...steps, ...jumps];
const counters = allEdges.flatMap(s => [
  new NFA(counterNFA(MOD_A), 'path-order', s.id, posA.at(s.a), posA.at(s.b)),
  new NFA(counterNFA(MOD_B), 'path-order', s.id, posB.at(s.a), posB.at(s.b)),
]);

// Two diagonals of one 2x2 block cross each other, so at most one is used.
const noCrossKey = cached('no-cross', () => Pair.fnToKey((x, y) => x === UNUSED || y === UNUSED, NV));
const noCross = [];
for (let r = 0; r <= 7; r++) {
  for (let c = 0; c <= 7; c++) {
    const d1 = stepByOrigin.get(`${r},${c},1,1`);
    const d2 = stepByOrigin.get(`${r},${c + 1},1,-1`);
    if (d1 && d2) noCross.push(new Pair(noCrossKey, 'no-crossing', d1.id, d2.id));
  }
}

// --- Segment totals ----------------------------------------------------------
// Along a used step X -> Y (read in travel direction):
//   same segment: cur(Y) = cur(X) + digit(Y), prev(Y) = prev(X);
//   cut step:     cur(Y) = digit(Y),          prev(Y) = cur(X),
// all mod the layer's modulus. A segment lies in one box, so its total is at
// most 45 and the residue pair mod 143 is its exact value.
// Cells read: (step, cur(a), cur(b), digit(a), digit(b)).
const curStepNFA = (mod, cut) => cached(`cur|${mod}|${cut}`, () => NFA.encodeSpec({
  startState: { k: 0 },
  transition: (s, value) => {
    switch (s.k) {
      case 0: return { k: 1, dir: value };
      case 1: return { k: 2, dir: s.dir, ca: value };
      case 2: {
        if (s.dir === UNUSED) return { k: 3, dir: UNUSED };
        if (s.ca === OFF || value === OFF) return undefined;
        const ca = s.ca - 2, cb = value - 2;
        // need: the residue the arriving cell's digit must have.
        const need = s.dir === FWD
          ? (cut ? cb : (cb - ca + mod) % mod)
          : (cut ? ca : (ca - cb + mod) % mod);
        return { k: 3, dir: s.dir, need };
      }
      case 3:
        if (s.dir === BWD && value % mod !== s.need) return undefined;
        return { k: 4, dir: s.dir, need: s.need };
      case 4:
        if (s.dir === FWD && value % mod !== s.need) return undefined;
        return { k: 5 };
    }
    return undefined;
  },
  accept: s => s.k === 5,
}, NV));
// Cells read: (step, prev(a), prev(b), cur(a), cur(b)).
const prevStepNFA = cut => cached(`prev|${cut}`, () => NFA.encodeSpec({
  startState: { k: 0 },
  transition: (s, value) => {
    switch (s.k) {
      case 0: return { k: 1, dir: value };
      case 1: return { k: 2, dir: s.dir, pa: value };
      case 2:
        if (s.dir === UNUSED) return { k: 3, dir: UNUSED };
        if (!cut) return s.pa === value ? { k: 3, dir: UNUSED } : undefined;
        // On a cut step the previous total of the arriving cell is the
        // running total of the leaving cell.
        return { k: 3, dir: s.dir, want: s.dir === FWD ? value : s.pa };
      case 3:
        if (s.dir === FWD && value !== s.want) return undefined;
        return { k: 4, dir: s.dir, want: s.want };
      case 4:
        if (s.dir === BWD && value !== s.want) return undefined;
        return { k: 5 };
    }
    return undefined;
  },
  accept: s => s.k === 5,
}, NV));
// At every segment end that has a previous segment, |cur - prev| = D. The
// machine reads (D, cur, prev) mod SUM_A, then the same mod SUM_B, tracking
// whether cur - prev = +D and cur - prev = -D in both. prev OFF means there is
// no previous segment yet, and nothing is checked. With an optional leading
// step Var, the check applies only when the step is used in `activeDir`,
// i.e. when this cell is the one the cut step leaves.
const diffSpec = (withStep, activeDir) => ({
  startState: withStep ? { k: 0 } : { k: 1, live: true },
  transition: (s, value) => {
    if (s.k === 0) return { k: 1, live: value === activeDir };
    if (s.k >= 7) return undefined;
    if (!s.live) return { k: s.k + 1, live: false };
    const mod = s.k <= 3 ? SUM_A : SUM_B;
    const phase = (s.k - 1) % 3;
    if (phase === 0) return { k: s.k + 1, live: true, none: s.none, plus: s.plus, minus: s.minus, d: value - 2 };
    if (phase === 1) {
      if (value === OFF) return undefined;
      return { ...s, k: s.k + 1, c: value - 2 };
    }
    // phase 2: the previous total.
    const none = value === OFF;
    if (s.k === 6 && none !== s.none) return undefined;
    if (none) return { k: s.k + 1, live: true, none: true, plus: true, minus: true };
    const p = value - 2;
    const plus = (s.k === 3 || s.plus) && (s.c - p - s.d + 2 * mod) % mod === 0;
    const minus = (s.k === 3 || s.minus) && (s.c - p + s.d + 2 * mod) % mod === 0;
    if (!plus && !minus) return undefined;
    return { k: s.k + 1, live: true, none: false, plus, minus };
  },
  accept: s => s.k === 7,
});
const diffCells = cell => [D_A, curA.at(cell), prevA.at(cell), D_B, curB.at(cell), prevB.at(cell)];
const segmentRules = [];
for (const s of allEdges) {
  const cut = !!s.cut;
  segmentRules.push(
    new NFA(curStepNFA(SUM_A, cut), 'segment-total', s.id, curA.at(s.a), curA.at(s.b), s.a, s.b),
    new NFA(curStepNFA(SUM_B, cut), 'segment-total', s.id, curB.at(s.a), curB.at(s.b), s.a, s.b),
    new NFA(prevStepNFA(cut), 'segment-previous', s.id, prevA.at(s.a), prevA.at(s.b), curA.at(s.a), curA.at(s.b)),
    new NFA(prevStepNFA(cut), 'segment-previous', s.id, prevB.at(s.a), prevB.at(s.b), curB.at(s.a), curB.at(s.b)));
  if (cut) {
    segmentRules.push(
      new NFA(cached('diff|FWD', () => NFA.encodeSpec(diffSpec(true, FWD), NV)),
        'segment-difference', s.id, ...diffCells(s.a)),
      new NFA(cached('diff|BWD', () => NFA.encodeSpec(diffSpec(true, BWD), NV)),
        'segment-difference', s.id, ...diffCells(s.b)));
  }
}
// The cake ends the last segment.
segmentRules.push(new NFA(cached('diff|end', () => NFA.encodeSpec(diffSpec(false), NV)),
  'segment-difference', ...diffCells(CAKE)));
// The start cell opens the first segment: its running total is its own digit.
const startTotal = [[curA, SUM_A], [curB, SUM_B]].map(([layer, mod]) =>
  new Pair(cached('start|' + mod, () => Pair.fnToKey((d, c) => d <= 9 && c === enc(d % mod), NV)),
    'segment-total', START, layer.at(START)));
// D is a difference of two totals in 1..45, so 0 <= D <= 44; the residue pair
// names one such D.
const dRange = new Pair(cached('d-range', () => Pair.fnToKey((x, y) =>
  range(0, 44).some(d => enc(d % SUM_A) === x && enc(d % SUM_B) === y), NV)),
  'segment-difference', D_A, D_B);

// --- Digit clues ---------------------------------------------------------------
const given = new Given('R5C4', 8);
const whitePellets = WHITE_PELLETS.map(([a, b]) => new WhiteDot(a, b));
const blackPellets = BLACK_PELLETS.map(([a, b]) => new BlackDot(a, b));
// GreaterThan(x, y) puts the larger digit first, so the apex cell goes second.
const oneWayDigits = ONE_WAY.map(([from, to]) => new GreaterThan(from, to));

// --- Variables and domains -------------------------------------------------------
const layers = [
  posA.toVar('path position mod ' + MOD_A),
  posB.toVar('path position mod ' + MOD_B),
  curA.toVar('segment running total mod ' + SUM_A),
  curB.toVar('segment running total mod ' + SUM_B),
  prevA.toVar('previous segment total mod ' + SUM_A),
  prevB.toVar('previous segment total mod ' + SUM_B),
  new Var('D', 'segment difference residues', 2),
  new Var('S', 'maze steps', steps.length),
  new Var('T', 'wormhole jumps', jumps.length),
];
const domains = [
  graph.makeReplicate(new Given(gridCells[0], ...range(1, 9))),
  // VA needs no domain: the sentinel plus MOD_A residues is the whole alphabet.
  posB.makeReplicate(new Given(posB.cells()[0], ...range(1, MOD_B + 1))),
  curA.makeReplicate(new Given(curA.cells()[0], ...range(1, SUM_A + 1))),
  curB.makeReplicate(new Given(curB.cells()[0], ...range(1, SUM_B + 1))),
  prevA.makeReplicate(new Given(prevA.cells()[0], ...range(1, SUM_A + 1))),
  prevB.makeReplicate(new Given(prevB.cells()[0], ...range(1, SUM_B + 1))),
  // The start is the first path cell and has no previous segment.
  new Given(posA.at(START), FIRST),
  new Given(posB.at(START), FIRST),
  new Given(prevA.at(START), OFF),
  new Given(prevB.at(START), OFF),
  // A one-way door's edge may only be crossed towards the arrow's apex.
  ...steps.filter(s => s.allowed).map(s => new Given(s.id, UNUSED, s.allowed)),
  // Every white pellet is eaten: the step across its edge is used.
  ...WHITE_PELLETS.map(([a, b]) => new Given(stepByPair.get(`${a}|${b}`).id, FWD, BWD)),
];

return [
  shape,
  ...layers,
  ...domains,
  given,
  ...pathShape,
  ...offGates,
  ...counters,
  ...noCross,
  ...segmentRules,
  ...startTotal,
  dRange,
  ...whitePellets,
  ...blackPellets,
  ...oneWayDigits,
];
