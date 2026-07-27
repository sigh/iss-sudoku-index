// Title: RAT RUN 17: Trapdoors
// Author: Marty Sears
// Video: https://www.youtube.com/watch?v=ZWYz9_1Qwt4
// Source: https://sudokupad.app/h46kngm99n

// Finkz walks a path from R8C1 to R7C4, orthogonally or diagonally through an
// open 2x2 space, never through a thick maze wall or a round wall-spot
// corner, never revisiting a cell or crossing itself. TEST CONSTRAINT: every
// 3 consecutive path cells hold one low (1-3), one mid (4-6) and one high
// (7-9) digit. TRAPDOORS: each of the 3 two-cell trapdoors has a digit total
// different from the other two. BUTTONS: a coloured button's digit is the
// count of buttons of that colour holding that digit (0 or exactly that
// digit -- ISS's Given already limits digits to 1-9, so "0" is the only
// other legal count); before the path steps on a trapdoor cell, every button
// of the trapdoor's colour must already be visited earlier on the path.
//
// Nothing is omitted. Normal sudoku rules apply; the grid's boxes are the
// default 3x3 tiling (regions payload confirms this).

const NV = 16; // widened alphabet: carries path-state Vars; grid cells pinned to 1-9 below.
const range = (lo, hi) => Array.from({ length: hi - lo + 1 }, (_, n) => lo + n);

const MOD_A = 15, MOD_B = 11;      // coprime; lcm 165 > 81 cells
const OFF = 1;                     // counter value for a cell the path misses
const FIRST = 2;                   // counter value of the path's first cell
const UNUSED = 1, FWD = 2, BWD = 3; // step values: unused, a->b, b->a

const RAT_CELL = 'R8C1';
const CUPCAKE = 'R7C4';

// --- The drawn maze --------------------------------------------------------
// Corner (i, j) is the top-left corner of cell RiCj; the lattice runs 1..10.
// WALLS holds the 15 thick sandybrown polylines exactly as drawn (including
// the grid boundary, which is one of them); SPOTS holds the 35 round
// sandybrown wall-spots, each on a lattice corner.
const WALLS = [
  [[9, 5], [9, 4], [7, 4], [7, 5]],
  [[7, 6], [8, 6]],
  [[7, 2], [7, 4], [6, 4]],
  [[6, 6], [6, 9]],
  [[6, 3], [6, 1], [10, 1], [10, 10], [1, 10], [1, 1], [6, 1]],
  [[5, 10], [5, 9]],
  [[8, 7], [9, 7], [9, 9]],
  [[8, 3], [9, 3]],
  [[5, 8], [5, 6]],
  [[5, 2], [5, 3], [4, 3], [4, 5]],
  [[3, 5], [3, 2]],
  [[3, 8], [4, 8]],
  [[7, 8], [7, 9]],
  [[2, 7], [2, 8]],
  [[2, 6], [2, 4]],
];
const SPOTS = [
  [2, 4], [2, 6], [2, 7], [2, 8], [3, 2], [3, 5], [3, 8], [4, 3], [4, 5],
  [4, 6], [4, 8], [5, 2], [5, 3], [5, 4], [5, 5], [5, 6], [5, 8], [5, 9],
  [6, 3], [6, 4], [6, 5], [6, 6], [6, 9], [7, 2], [7, 5], [7, 6], [7, 8],
  [7, 9], [8, 3], [8, 6], [8, 7], [9, 3], [9, 5], [9, 7], [9, 9],
];

// Coloured buttons: large circles filling a cell, one colour per trapdoor
// (deepskyblue, red, yellow).
const BLUE_BUTTONS = [
  'R1C3', 'R1C5', 'R2C7', 'R3C2', 'R4C4', 'R6C3',
  'R4C8', 'R5C9', 'R9C6', 'R8C6', 'R2C9', 'R1C7',
];
const RED_BUTTONS = ['R9C1', 'R6C1', 'R7C2', 'R3C4', 'R3C9', 'R5C5'];
const YELLOW_BUTTONS = ['R1C1', 'R4C5', 'R3C6', 'R8C2'];

// The 3 rectangular trapdoors (edge-shapes spanning 2 cells each), each
// paired with the button colour drawn to match its border colour.
const TRAPDOORS = [
  { cells: ['R7C5', 'R8C5'], buttons: BLUE_BUTTONS },
  { cells: ['R2C5', 'R2C6'], buttons: YELLOW_BUTTONS },
  { cells: ['R6C9', 'R7C9'], buttons: RED_BUTTONS },
];

const shape = new Shape('9x9', NV);
const graph = cellGraph(shape);
const gridCells = graph.cells();
const posA = graph.makeOverlay('VA'); // path position mod 15 (1 = off path)
const posB = graph.makeOverlay('VB'); // path position mod 11

// Split the polylines into unit lattice segments: 'H|i|j' runs from corner
// (i, j) to (i, j+1), 'V|i|j' from (i, j) to (i+1, j).
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

// A diagonal step passes through the one corner its two cells share. It needs
// a 2x2 space, whose only internal edges are the four wall slots meeting at
// that corner, and it may not pass through a wall-spot.
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

// --- Step variables ---------------------------------------------------------
// One Var per legal move; moves the maze forbids get no variable at all.
const STEP_DIRS = [[0, 1], [1, 0], [1, 1], [1, -1]];
const steps = [];
const stepsAt = new Map(gridCells.map(cell => [cell, []]));
for (const cell of gridCells) {
  for (const [dRow, dCol] of STEP_DIRS) {
    const other = graph.step(cell, dRow, dCol);
    if (!other || !stepAllowed(cell, dRow, dCol)) continue;
    const id = 'VS' + (steps.length + 1);
    steps.push({ id, a: cell, b: other });
    stepsAt.get(cell).push({ id, out: FWD, in: BWD });
    stepsAt.get(other).push({ id, out: BWD, in: FWD });
  }
}
const stepById = new Map(steps.map(s => [s.id, s]));
const stepIndex = new Map(steps.flatMap(s => [[s.a + '|' + s.b, s.id], [s.b + '|' + s.a, s.id]]));
const otherEndOf = (stepId, cell) => {
  const s = stepById.get(stepId);
  return s.a === cell ? s.b : s.a;
};

const memo = new Map();
const cached = (key, build) => {
  if (!memo.has(key)) memo.set(key, build());
  return memo.get(key);
};

// --- Path shape --------------------------------------------------------------
// Per-cell machine: reads the cell's two counters, then every step it is an
// end of. A cell off the path uses no step; a visited plain cell is entered
// once and left once; Finkz's own cell is only left; the cupcake is only
// entered.
function cellNFA(incident, role) {
  const sig = 'cell|' + role + '|' + incident.map(s => s.out).join(',');
  return cached(sig, () => NFA.encodeSpec({
    startState: { k: 0 },
    transition: (s, value) => {
      if (s.k === 0) return { k: 1, vis: value !== OFF };
      if (s.k === 1) {
        if ((value !== OFF) !== s.vis) return undefined;
        return { k: 2, vis: s.vis, in: 0, out: 0 };
      }
      const n = s.k - 2;
      if (n >= incident.length) return undefined;
      const step = incident[n];
      const next = { k: s.k + 1, vis: s.vis, in: s.in, out: s.out };
      if (value === step.in) next.in++;
      else if (value === step.out) next.out++;
      else if (value !== UNUSED) return undefined;
      if (next.in > 1 || next.out > 1) return undefined;
      return next;
    },
    accept: s => {
      if (s.k !== 2 + incident.length) return false;
      if (role === 'start') return s.vis && s.out === 1 && s.in === 0;
      if (role === 'end') return s.vis && s.in === 1 && s.out === 0;
      return s.vis ? (s.in === 1 && s.out === 1) : (s.in === 0 && s.out === 0);
    },
  }, NV));
}
const pathShape = gridCells.map(cell => {
  const incident = stepsAt.get(cell);
  const role = cell === RAT_CELL ? 'start' : cell === CUPCAKE ? 'end' : 'plain';
  return new NFA(cellNFA(incident, role), 'path-cell',
    posA.at(cell), posB.at(cell), ...incident.map(s => s.id));
});

// Position counters for subtour elimination: numbering a real
// path 1, 2, 3, ... from Finkz's cell is always possible, so "the arriving
// cell's counter is the leaving cell's plus one" adds nothing; a closed cycle
// of steps beside the path would need a length divisible by 15 and by 11,
// i.e. 165, and there are only 81 cells.
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
const counters = steps.flatMap(s => [
  new NFA(counterNFA(MOD_A), 'path-order', s.id, posA.at(s.a), posA.at(s.b)),
  new NFA(counterNFA(MOD_B), 'path-order', s.id, posB.at(s.a), posB.at(s.b)),
]);

// The two diagonals of a 2x2 block cross each other, and the path may not
// cross itself.
const noCrossKey = Pair.fnToKey((x, y) => x === UNUSED || y === UNUSED, NV);
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

// --- TEST CONSTRAINT: entropic triples --------------------------------------
// For every interior path cell M with an in-step and an out-step, the three
// cells (in-neighbour, M, out-neighbour) must show one low (1-3), one mid
// (4-6) and one high (7-9) digit. One small NFA per ordered pair of distinct
// incident steps at M (only one such pair is ever "active": the in-step read
// as entering M and the out-step read as leaving M); it reads the two step
// Vars then the three cells' digits, clamped to the real 1-9 range since the
// widened NV=16 domain would otherwise multiply out dead branches.
const clampDigit = v => Math.min(v, 9);
const classOf = d => d <= 3 ? 1 : (d <= 6 ? 2 : 3);
const tripleSpec = (inTag, outTag) => cached('triple|' + inTag + '|' + outTag, () => NFA.encodeSpec({
  startState: { k: 0 },
  transition: (s, value) => {
    if (s.k === 0) return { k: 1, active: value === inTag };
    if (s.k === 1) return { k: 2, active: s.active && value === outTag };
    if (s.k === 2) return { k: 3, active: s.active, clsA: classOf(clampDigit(value)) };
    if (s.k === 3) return { k: 4, active: s.active, clsA: s.clsA, clsM: classOf(clampDigit(value)) };
    if (s.k !== 4) return undefined;
    if (!s.active) return { done: true };
    const clsB = classOf(clampDigit(value));
    return (s.clsA !== s.clsM && s.clsM !== clsB && s.clsA !== clsB) ? { done: true } : undefined;
  },
  accept: s => s.done === true,
}, NV));
const entropicTriples = [];
for (const cell of gridCells) {
  if (cell === RAT_CELL || cell === CUPCAKE) continue; // never both an in- and an out-step
  const incident = stepsAt.get(cell);
  for (const sIn of incident) {
    for (const sOut of incident) {
      if (sIn.id === sOut.id) continue;
      entropicTriples.push(new NFA(tripleSpec(sIn.in, sOut.out), 'entropic-triple',
        sIn.id, sOut.id, otherEndOf(sIn.id, cell), cell, otherEndOf(sOut.id, cell)));
    }
  }
}

// --- TRAPDOORS: distinct totals ---------------------------------------------
// Reads both cells of each of two trapdoors and rejects only when their totals
// match; the actual totals are never materialised as a Var.
const sumDistinctSpec = cached('sum-distinct', () => NFA.encodeSpec({
  startState: { k: 0 },
  transition: (s, value) => {
    const d = clampDigit(value);
    if (s.k === 0) return { k: 1, d1: d };
    if (s.k === 1) return { k: 2, sumA: s.d1 + d };
    if (s.k === 2) return { k: 3, sumA: s.sumA, d3: d };
    if (s.k !== 3) return undefined;
    return (s.sumA !== s.d3 + d) ? { done: true } : undefined;
  },
  accept: s => s.done === true,
}, NV));
const trapdoorSums = [];
for (let i = 0; i < TRAPDOORS.length; i++) {
  for (let j = i + 1; j < TRAPDOORS.length; j++) {
    trapdoorSums.push(new NFA(sumDistinctSpec, 'trapdoor-total',
      ...TRAPDOORS[i].cells, ...TRAPDOORS[j].cells));
  }
}

// --- TRAPDOORS: locked until every same-colour button is visited earlier ---
// posA/posB (mod 15, mod 11) uniquely recover a path cell's real 1-based
// position via CRT since 15*11=165 exceeds the 81-cell grid; crtUnwrap
// precomputes that lookup once, at script-authoring time.
const crtUnwrap = (aVal, bVal) => {
  const ra = aVal - FIRST, rb = bVal - FIRST;
  for (let x = 0; x < MOD_A * MOD_B; x++) {
    if (x % MOD_A === ra && x % MOD_B === rb) return x;
  }
  return null;
};
const clampB = v => Math.min(v, FIRST + MOD_B - 1); // posB's real range tops out at 12
// Reads (trapdoor cell's posA, posB) then (button's posA, posB). If the
// trapdoor cell is off-path the machine collapses to one vacuous state
// regardless of the remaining reads, so it never multiplies the button's
// posA branch by the trapdoor's -- state stays low. Off-path or a
// later-visited button both reject.
const trapdoorOrderSpec = cached('trapdoor-order', () => NFA.encodeSpec({
  startState: { k: 0 },
  transition: (s, value) => {
    if (s.k === 0) {
      if (value === OFF) return { k: 1, vac: true };
      return { k: 1, vac: false, aT: value };
    }
    if (s.k === 1) {
      if (s.vac) return { k: 2, vac: true };
      return { k: 2, vac: false, aT: s.aT, bT: clampB(value) };
    }
    if (s.k === 2) {
      if (s.vac) return { k: 3, vac: true };
      return { k: 3, vac: false, aT: s.aT, bT: s.bT, aB: value };
    }
    if (s.k !== 3) return undefined;
    if (s.vac) return { done: true };
    if (s.aB === OFF) return undefined; // button never visited
    const posT = crtUnwrap(s.aT, s.bT);
    const posBtn = crtUnwrap(s.aB, clampB(value));
    return posBtn < posT ? { done: true } : undefined;
  },
  accept: s => s.done === true,
}, NV));
const trapdoorLocks = TRAPDOORS.flatMap(({ cells, buttons }) =>
  cells.flatMap(t => buttons.map(b => new NFA(trapdoorOrderSpec, 'trapdoor-lock',
    posA.at(t), posB.at(t), posA.at(b), posB.at(b)))));

// --- BUTTONS: self-counting colour groups -----------------------------------
// A colour group's digit-d button count is either 0 (no button of that
// colour holds d) or exactly d -- ISS's Given already limits every digit to
// 1-9, so those are the only two counts a button's own digit could ever read
// out. One NFA per (colour group, digit) scans the group's own cells.
const selfCountSpec = digit => cached('selfcount|' + digit, () => NFA.encodeSpec({
  startState: { count: 0 },
  transition: ({ count }, value) =>
    (clampDigit(value) === digit)
      ? (count === digit ? undefined : { count: count + 1 })
      : { count },
  accept: ({ count }) => count === 0 || count === digit,
}, NV));
const BUTTON_GROUPS = [BLUE_BUTTONS, RED_BUTTONS, YELLOW_BUTTONS];
const buttonSelfCounts = BUTTON_GROUPS.flatMap(group =>
  range(1, 9).map(d => new NFA(selfCountSpec(d), 'button-selfcount', ...group)));

// --- Variables and domains --------------------------------------------------
const layers = [
  posA.toVar('path position mod ' + MOD_A),
  posB.toVar('path position mod ' + MOD_B),
  new Var('S', 'path steps', steps.length),
];
const domains = [
  graph.makeReplicate(new Given(gridCells[0], ...range(1, 9))),
  posA.makeReplicate(new Given(posA.at(gridCells[0]), ...range(1, MOD_A + 1))),
  posB.makeReplicate(new Given(posB.at(gridCells[0]), ...range(1, MOD_B + 1))),
  // Finkz's own cell is the first cell of the path.
  new Given(posA.at(RAT_CELL), FIRST), new Given(posB.at(RAT_CELL), FIRST),
];

return [
  shape,
  ...layers,
  ...domains,
  ...pathShape,
  ...counters,
  ...noCross,
  ...entropicTriples,
  ...trapdoorSums,
  ...trapdoorLocks,
  ...buttonSelfCounts,
];
