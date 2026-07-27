// Title: RAT RUN 11: Limited Addition
// Author: Marty Sears
// Video: https://www.youtube.com/watch?v=6idgArttQcs
// Source: https://sudokupad.app/yuarri3g7w

// Normal sudoku. Finkz walks a self-avoiding path from R8C4 to the cupcake at
// R9C8, orthogonally or diagonally through a 2x2 gap free of walls and of a
// round wall-spot on its corner, never through a thick maze wall. Entering
// either cell of a coloured teleport pair instantly moves Finkz to the other
// cell of that pair, from where she continues; matching teleports hold the
// same digit, and teleports of different colours always differ. A redcurrant
// sits between an even digit and an odd digit. Every cell the path visits
// equals the digit at the top of its column plus the digit at the left end of
// its row.
//
// Nothing is omitted.

// The alphabet is widened to 16 so the Var layers can carry path state; the 81
// grid cells are pinned back to 1-9 below.
const NV = 16;

// Two coprime moduli whose lcm (165) exceeds the 81-cell grid: the position
// counters they carry are what rule out a closed loop of steps beside the
// path, since in/out degree alone allows one.
const MOD_A = 15, MOD_B = 11;
const OFF = 1;                 // counter value for a cell the path misses
const FIRST = 2;                // counter value of the path's first cell
const UNUSED = 1, FWD = 2, BWD = 3; // step values: unused, a->b, b->a

const RAT_CELL = 'R8C4';
const CUPCAKE = 'R9C8';

// The five coloured teleport pairs (rounded-rect letter markers A-E).
const TELEPORTS = [
  ['R3C3', 'R4C8'], // A
  ['R3C6', 'R5C8'], // B
  ['R5C4', 'R8C6'], // C
  ['R6C1', 'R9C5'], // D
  ['R6C8', 'R9C1'], // E
];

// The four red-circle redcurrants, each naming the two cells its edge sits
// between.
const REDCURRANTS = [
  ['R2C2', 'R2C3'],
  ['R5C5', 'R5C6'],
  ['R4C6', 'R5C6'],
  ['R7C1', 'R7C2'],
];

// --- The drawn maze --------------------------------------------------------
// Corner (i, j) is the top-left corner of cell R(i+1)C(j+1), so the lattice
// runs 0..9, matching the payload's own coordinates. WALLS holds the three
// internal thick-purple polylines exactly as drawn (the fourth, the outer
// grid border, blocks no cell-to-cell move and is left out). SPOTS holds the
// twelve round wall-spots, each on a lattice corner.
const WALLS = [
  [[8, 4], [7, 4], [7, 2], [2, 2], [2, 7]],
  [[3, 6], [3, 7], [5, 7]],
  [[8, 2], [8, 3]],
];
const SPOTS = [
  [2, 2], [2, 7], [3, 6], [3, 7], [3, 8], [5, 7],
  [7, 2], [7, 4], [8, 2], [8, 3], [8, 4], [8, 6],
];

const shape = new Shape('9x9', NV);
const graph = cellGraph(shape);
const gridCells = graph.cells();
const posA = graph.makeOverlay('VA');   // position mod 15
const posB = graph.makeOverlay('VB');   // position mod 11

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

// Is the (dRow, dCol) step out of `cell` a legal move? Cell R(row)C(col) has
// top-left corner (row-1, col-1) in the payload's 0-indexed lattice.
const stepAllowed = (cell, dRow, dCol) => {
  const { row, col } = parseCellId(cell);
  const r = row - 1, c = col - 1;
  if (dRow === 0) return !wallSegments.has(`V|${r}|${c + Math.max(dCol, 0)}`);
  if (dCol === 0) return !wallSegments.has(`H|${r + Math.max(dRow, 0)}|${c}`);
  return cornerOpen(r + Math.max(dRow, 0), c + Math.max(dCol, 0));
};

// --- Step variables ---------------------------------------------------------
// One Var per legal move: king moves the maze allows, plus one wormhole edge
// per teleport pair. A teleport step ignores the maze entirely -- entering
// either cell relocates Finkz to the other -- so it carries no wall check.
const STEP_DIRS = [[0, 1], [1, 0], [1, 1], [1, -1]];
const steps = [];
const stepsAt = new Map(gridCells.map(cell => [cell, []]));
for (const cell of gridCells) {
  for (const [dRow, dCol] of STEP_DIRS) {
    const other = graph.step(cell, dRow, dCol);
    if (!other || !stepAllowed(cell, dRow, dCol)) continue;
    const id = 'VS' + (steps.length + 1);
    steps.push({ id, a: cell, b: other });
    stepsAt.get(cell).push({ id, out: FWD, in: BWD, isTeleport: false });
    stepsAt.get(other).push({ id, out: BWD, in: FWD, isTeleport: false });
  }
}
for (const [a, b] of TELEPORTS) {
  const id = 'VS' + (steps.length + 1);
  steps.push({ id, a, b });
  stepsAt.get(a).push({ id, out: FWD, in: BWD, isTeleport: true });
  stepsAt.get(b).push({ id, out: BWD, in: FWD, isTeleport: true });
}
const stepIndex = new Map(steps.map(s => [s.a + '|' + s.b, s.id]));

const memo = new Map();
const cached = (key, build) => {
  if (!memo.has(key)) memo.set(key, build());
  return memo.get(key);
};

// --- Path shape --------------------------------------------------------------
// Per-cell machine: reads the cell's two counters, then every step it is an
// end of. A cell the path misses (counter OFF) uses no step; a visited cell
// is entered once and left once. The rat cell is only left, the cupcake only
// entered. A teleport cell's incident list carries exactly one wormhole step;
// "entering a teleport instantly transports" means a visited teleport cell
// must use that specific step as its in or its out -- walking straight
// through on two ordinary maze steps is not the drawn rule.
function cellNFA(incident, role) {
  const hasTeleport = incident.some(s => s.isTeleport);
  const sig = 'cell|' + role + '|' + incident.map(s => s.out + (s.isTeleport ? 'T' : '')).join(',');
  return cached(sig, () => NFA.encodeSpec({
    startState: { k: 0 },
    transition: (s, value) => {
      if (s.k === 0) return { k: 1, vis: value !== OFF };
      if (s.k === 1) {
        if ((value !== OFF) !== s.vis) return undefined;
        return { k: 2, vis: s.vis, in: 0, out: 0, teleUsed: false };
      }
      const n = s.k - 2;
      if (n >= incident.length) return undefined;
      const step = incident[n];
      const next = { k: s.k + 1, vis: s.vis, in: s.in, out: s.out, teleUsed: s.teleUsed };
      if (value === step.in) { next.in++; if (step.isTeleport) next.teleUsed = true; }
      else if (value === step.out) { next.out++; if (step.isTeleport) next.teleUsed = true; }
      else if (value !== UNUSED) return undefined;
      if (next.in > 1 || next.out > 1) return undefined;
      return next;
    },
    accept: s => {
      if (s.k !== 2 + incident.length) return false;
      if (role === 'rat') return s.vis && s.out === 1 && s.in === 0;
      if (role === 'cupcake') return s.vis && s.in === 1 && s.out === 0;
      if (!s.vis) return s.in === 0 && s.out === 0;
      return s.in === 1 && s.out === 1 && (!hasTeleport || s.teleUsed);
    },
  }, NV));
}
const roleOf = cell => cell === RAT_CELL ? 'rat' : cell === CUPCAKE ? 'cupcake' : 'plain';
const pathShape = gridCells.map(cell => {
  const incident = stepsAt.get(cell);
  return new NFA(cellNFA(incident, roleOf(cell)), 'path-cell',
    posA.at(cell), posB.at(cell), ...incident.map(s => s.id));
});

// Position counters: numbering a real path 1, 2, 3, ... from the rat's cell
// is always possible, so what the counters buy is that a closed cycle of
// steps beside the path would need a length
// divisible by both 15 and 11, i.e. by 165 -- more than the 81 cells -- while
// in/out degree alone cannot rule such a cycle out. A teleport step advances
// the counters exactly like a maze step: the two cells it joins are
// consecutive positions on the path.
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

// --- Teleport digits ---------------------------------------------------------
// Matching teleports hold one shared digit (one SameValues per pair); the
// AllDifferent over one cell per pair is what makes teleports of different
// colours always differ, since each pair-mate copies its representative.
const teleportPairs = TELEPORTS.map(([a, b]) => new SameValues(2, a, b));
const teleportDistinct = new AllDifferent(...TELEPORTS.map(([a]) => a));

// --- Redcurrants -------------------------------------------------------------
// One digit even, the other odd, regardless of whether the path crosses it.
const parityKey = Pair.fnToKey((a, b) => (a % 2) !== (b % 2), NV);
const redcurrants = REDCURRANTS.map(([a, b]) => new Pair(parityKey, 'redcurrant', a, b));

// --- TEST CONSTRAINT ----------------------------------------------------------
// Any visited cell equals the digit at the top of its column (R1 of that
// column) plus the digit at the left end of its row (C1 of that row); a cell
// in row 1 or column 1 makes one of those two references itself, which forces
// that reference's digit to be double its own value or zero -- impossible --
// so the arithmetic alone keeps the path out of row 1 and column 1, with no
// extra clause needed.
const testNFA = cached('test-constraint', () => NFA.encodeSpec({
  startState: { k: 0 },
  transition: (s, value) => {
    if (s.k === 0) return { k: 1, vis: value !== OFF };
    if (s.k === 1) return { k: 2, vis: s.vis, digit: value };
    if (s.k === 2) return { k: 3, vis: s.vis, digit: s.digit, top: value };
    if (s.k !== 3) return undefined;
    if (!s.vis) return { done: true };
    return s.top + value === s.digit ? { done: true } : undefined;
  },
  accept: s => s.done === true,
}, NV));
const testClues = gridCells.map(cell => {
  const { row, col } = parseCellId(cell);
  const topCell = makeCellId(1, col);
  const leftCell = makeCellId(row, 1);
  return new NFA(testNFA, 'test-constraint', posA.at(cell), cell, topCell, leftCell);
});

// --- Variables and domains ---------------------------------------------------
const range = (lo, hi) => Array.from({ length: hi - lo + 1 }, (_, n) => lo + n);
const layers = [
  posA.toVar('position mod ' + MOD_A),
  posB.toVar('position mod ' + MOD_B),
  new Var('S', 'path steps', steps.length),
];
const domains = [
  graph.makeReplicate(new Given(gridCells[0], ...range(1, 9))),
  // VA needs no domain of its own: the sentinel plus MOD_A residues is exactly
  // the 16-value alphabet.
  posB.makeReplicate(new Given(posB.at(gridCells[0]), ...range(1, MOD_B + 1))),
  // The step Vars need no domain of their own: the path-cell machines accept
  // no value on them but unused / in / out.
  new Given(posA.at(RAT_CELL), FIRST), new Given(posB.at(RAT_CELL), FIRST),
];

return [
  shape,
  ...layers,
  ...domains,
  ...pathShape,
  ...counters,
  ...noCross,
  ...teleportPairs,
  teleportDistinct,
  ...redcurrants,
  ...testClues,
];
