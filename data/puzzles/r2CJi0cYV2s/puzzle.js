// Title: RAT RUN 9: Shock Value
// Author: Marty Sears
// Video: https://www.youtube.com/watch?v=r2CJi0cYV2s
// Source: https://sudokupad.app/vaeya6u829

// Normal sudoku. Finkz walks a self-avoiding, non-crossing path from R2C6 to
// R3C2, orthogonally or diagonally through an open 2x2 space, never through a
// thick maze wall and never diagonally through a round wall-spot. Entering
// either yellow teleport (R5C6, R9C9) instantly moves Finkz to the other, from
// where she continues; the two teleport cells hold the same digit. A
// blackcurrant joins two cells in a 1:2 ratio (not every blackcurrant is
// shown). Digits don't repeat in a cage; every cage shares one common,
// deduced total. A cage's shock value is the digit on its lightning cell:
// shock >= 5 makes the cage active, and Finkz may not enter any of its cells;
// shock < 5 is safe. Consecutive digits along Finkz's path differ by at most 2.
//
// Nothing is omitted. The blue dashed cage outlines (not a plain `cages`
// array entry) and the maroon maze strokes are geometry transcribed from the
// source payload's own drawn coordinates.

// The alphabet is widened to carry the path's two subtour-killing position
// counters (mod 15, mod 11; lcm 165 exceeds the 81-cell grid); the 81 grid
// cells are pinned back to 1-9 below.
const NV = 16;
const MOD_A = 15, MOD_B = 11;
const OFF = 1;                      // counter value for a cell Finkz never visits
const FIRST = 2;                    // counter value of the path's first cell
const UNUSED = 1, FWD = 2, BWD = 3; // step values: unused, a->b, b->a

const RAT_CELL = 'R2C6';   // the rat marker
const CUPCAKE = 'R3C2';    // the cupcake marker
const TELEPORTS = ['R5C6', 'R9C9'];  // the two yellow "A" discs

// The 16 thick maroon polylines (color #a50822, th=12), transcribed exactly
// as drawn. Corner [i, j] is the lattice point at the
// top-left of R(i+1)C(j+1) (0-indexed, matching the payload's own [row, col]
// waypoints); the outer border segments block no cell-to-cell move and are
// harmless to include.
const WALLS = [
  [[8, 6], [3, 6], [3, 2], [4, 2]],
  [[5, 6], [5, 4]],
  [[3, 6], [2, 6], [2, 8], [1, 8]],
  [[3, 2], [2, 2], [2, 1]],
  [[5, 5], [4, 5]],
  [[2, 6], [1, 6], [1, 3]],
  [[2, 2], [1, 2]],
  [[3, 7], [6, 7]],
  [[3, 8], [7, 8]],
  [[2, 3], [2, 5]],
  [[8, 8], [9, 8], [9, 9], [0, 9], [0, 0], [9, 0], [9, 8]],
  [[7, 3], [8, 3]],
  [[5, 2], [7, 2]],
  [[6, 2], [6, 3]],
  [[8, 1], [8, 2]],
  [[6, 1], [3, 1]],
];
// The 26 round maroon wall-spots (0.32x0.32 filled circles), by their lattice
// corner, same [row, col] convention.
const SPOTS = [
  [1, 2], [1, 3], [1, 6], [1, 8], [2, 1], [2, 3], [2, 5], [2, 8], [3, 1],
  [3, 7], [3, 8], [4, 2], [4, 5], [5, 2], [5, 4], [6, 1], [6, 3], [6, 7],
  [7, 2], [7, 3], [7, 8], [8, 1], [8, 2], [8, 3], [8, 6], [8, 8],
];

// The seven drawn blackcurrants (0.28-size black edge discs).
const BLACKCURRANTS = [
  ['R9C7', 'R9C8'], ['R4C9', 'R5C9'], ['R1C6', 'R1C7'],
  ['R1C7', 'R1C8'], ['R2C3', 'R3C3'], ['R7C3', 'R8C3'],
  ['R6C5', 'R7C5'],
];

// The twelve cages, read from the boundary the dashed blue (#3ad0ff) strokes
// trace, inset from the grid lines. `shock` is each cage's own lightning
// cell -- every outline carries exactly one lightning-symbol label, and
// every lightning cell falls inside exactly one outline.
const CAGES = [
  { cells: ['R1C1', 'R1C2', 'R2C1', 'R2C2'], shock: 'R1C1' },
  { cells: ['R2C4', 'R2C5'], shock: 'R2C4' },
  { cells: ['R3C4', 'R3C5', 'R3C6'], shock: 'R3C4' },
  { cells: ['R4C1', 'R5C1', 'R6C1', 'R7C1'], shock: 'R7C1' },
  { cells: ['R4C2', 'R5C2', 'R6C2', 'R7C2'], shock: 'R5C2' },
  { cells: ['R4C7', 'R5C7', 'R6C7'], shock: 'R4C7' },
  { cells: ['R4C8', 'R5C8', 'R6C8'], shock: 'R4C8' },
  { cells: ['R4C9', 'R5C9', 'R6C9', 'R7C9'], shock: 'R4C9' },
  { cells: ['R5C3', 'R6C3'], shock: 'R6C3' },
  { cells: ['R6C4', 'R7C3', 'R7C4', 'R8C4', 'R9C4'], shock: 'R7C4' },
  { cells: ['R6C5', 'R6C6', 'R7C5', 'R8C5', 'R9C5'], shock: 'R7C5' },
  { cells: ['R8C6', 'R9C6', 'R9C7'], shock: 'R9C6' },
];
// Cage sizes present are 2, 3, 4 and 5 cells. With distinct digits 1-9, the
// achievable-total range per size is [3,17], [6,24], [10,30] and [15,35]; a
// total shared by every cage must lie in all four ranges at once, i.e.
// [15, 17]. This is arithmetic on the drawn cage sizes, not a fit to the
// answer.
const CAGE_TOTALS = [15, 16, 17];

const range = (lo, hi) => Array.from({ length: hi - lo + 1 }, (_, n) => lo + n);

const shape = new Shape('9x9', NV);
const graph = cellGraph(shape);
const gridCells = graph.cells();
const posA = graph.makeOverlay('VA');   // path position mod MOD_A
const posB = graph.makeOverlay('VB');   // path position mod MOD_B

const memo = new Map();
const cached = (key, build) => {
  if (!memo.has(key)) memo.set(key, build());
  return memo.get(key);
};

// --- Maze geometry ---------------------------------------------------------
const wallSegments = new Set();
for (const line of WALLS) {
  for (let n = 1; n < line.length; n++) {
    const [i0, j0] = line[n - 1], [i1, j1] = line[n];
    if (i0 === i1) {
      for (let j = Math.min(j0, j1); j < Math.max(j0, j1); j++) wallSegments.add(`H|${i0}|${j}`);
    } else {
      for (let i = Math.min(i0, i1); i < Math.max(i0, i1); i++) wallSegments.add(`V|${i}|${j0}`);
    }
  }
}
const spotSet = new Set(SPOTS.map(([i, j]) => `${i}|${j}`));

// A diagonal step passes through the one lattice corner its two cells share.
// It needs an open 2x2 -- no wall segment meeting that corner -- and no
// wall-spot sitting on it.
const cornerOpen = (i, j) => !spotSet.has(`${i}|${j}`) &&
  !wallSegments.has(`V|${i - 1}|${j}`) && !wallSegments.has(`V|${i}|${j}`) &&
  !wallSegments.has(`H|${i}|${j - 1}`) && !wallSegments.has(`H|${i}|${j}`);

// Is the (dRow, dCol) step out of `cell` legal? Cell R(row)C(col)'s top/left
// lattice edges are (row-1)/(col-1) and its bottom/right edges are row/col,
// matching the payload's 0-indexed [row, col] corners.
const stepAllowed = (cell, dRow, dCol) => {
  const { row, col } = parseCellId(cell);
  if (dRow === 0) return !wallSegments.has(`V|${row - 1}|${col + Math.min(dCol, 0)}`);
  if (dCol === 0) return !wallSegments.has(`H|${row + Math.min(dRow, 0)}|${col - 1}`);
  return cornerOpen(row + Math.max(dRow, 0) - 1, col + Math.max(dCol, 0) - 1);
};

// --- Step variables ---------------------------------------------------------
// One Var per legal orthogonal/diagonal move, plus one extra Var for the
// teleport link -- an edge with no geometric adjacency of its own, which
// lets the same in/out degree and position-counter machinery below treat a
// teleport hop exactly like any other single move.
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
const stepIndex = new Map(steps.map(s => [s.a + '|' + s.b, s.id]));
const teleportId = 'VS' + (steps.length + 1);
{
  const [tA, tB] = TELEPORTS;
  steps.push({ id: teleportId, a: tA, b: tB });
  stepsAt.get(tA).push({ id: teleportId, out: FWD, in: BWD });
  stepsAt.get(tB).push({ id: teleportId, out: BWD, in: FWD });
}

// --- Path shape --------------------------------------------------------------
// Per-cell machine: reads the cell's two position counters, then every step
// it is an end of. An unvisited cell (OFF counters) uses no step; a visited
// plain cell is entered once and left once. The rat cell is only left, the
// cupcake only entered. A teleport cell, if visited, must use its teleport
// edge for one of its two step-slots -- entering it (by any real move) always
// transports, so it can never simply pass Finkz through to a normal neighbour
// on both sides.
const ROLE = new Map([[RAT_CELL, 'start'], [CUPCAKE, 'end']]);
const TELEPORT_SET = new Set(TELEPORTS);

function cellNFA(incident, role, teleportPos) {
  const sig = 'cell|' + role + '|' + teleportPos + '|' +
    incident.map(s => s.in + '/' + s.out).join(',');
  return cached(sig, () => NFA.encodeSpec({
    startState: { k: 0 },
    transition: (s, value) => {
      if (s.k === 0) return { k: 1, vis: value !== OFF };
      if (s.k === 1) {
        if ((value !== OFF) !== s.vis) return undefined;
        return { k: 2, vis: s.vis, in: 0, out: 0, tUsed: false };
      }
      const n = s.k - 2;
      if (n >= incident.length) return undefined;
      const step = incident[n];
      let { in: nIn, out: nOut, tUsed } = s;
      if (value === step.in) { nIn++; if (n === teleportPos) tUsed = true; }
      else if (value === step.out) { nOut++; if (n === teleportPos) tUsed = true; }
      else if (value !== UNUSED) return undefined;
      if (nIn > 1 || nOut > 1) return undefined;
      return { k: s.k + 1, vis: s.vis, in: nIn, out: nOut, tUsed };
    },
    accept: s => {
      if (s.k !== 2 + incident.length) return false;
      if (role === 'start') return s.vis && s.in === 0 && s.out === 1;
      if (role === 'end') return s.vis && s.in === 1 && s.out === 0;
      if (!s.vis) return s.in === 0 && s.out === 0;
      if (s.in !== 1 || s.out !== 1) return false;
      if (teleportPos >= 0 && !s.tUsed) return false;
      return true;
    },
  }, NV));
}
const pathShape = gridCells.map(cell => {
  const incident = stepsAt.get(cell);
  const role = ROLE.get(cell) || 'plain';
  const teleportPos = TELEPORT_SET.has(cell)
    ? incident.findIndex(s => s.id === teleportId) : -1;
  return new NFA(cellNFA(incident, role, teleportPos), 'path-cell',
    posA.at(cell), posB.at(cell), ...incident.map(s => s.id));
});

// Position counters. Numbering a real walk 1, 2, 3, ... from the rat's cell
// is always possible; what the two coprime moduli buy is that a stray closed
// loop of steps beside the path would need a length divisible by 165, more
// than the 81-cell grid can hold, so degree-1-in/1-out alone cannot admit one.
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

// The two diagonals of one 2x2 block cross at the block's single shared
// corner, so using both would cross the path over itself.
const noCrossKey = cached('no-cross', () => Pair.fnToKey(
  (x, y) => x === UNUSED || y === UNUSED, NV));
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

// Chinese Whisper: consecutive digits along the path (including across the
// teleport hop, which continues the same journey) differ by at most 2.
const diffNFA = cached('diff', () => NFA.encodeSpec({
  startState: { k: 0 },
  transition: (s, value) => {
    if (s.k === 0) return { k: 1, used: value !== UNUSED };
    if (s.k === 1) return { k: 2, used: s.used, a: value };
    if (s.k !== 2) return undefined;
    if (!s.used) return { done: true };
    return Math.abs(s.a - value) <= 2 ? { done: true } : undefined;
  },
  accept: s => s.done === true,
}, NV));
const whispers = steps.map(s => new NFA(diffNFA, 'chinese-whisper', s.id, s.a, s.b));

// --- Cages -------------------------------------------------------------------
const cageDistinct = CAGES.map(cage => new AllDifferent(...cage.cells));
// Exactly one shared total holds for every cage at once.
const cageTotals = new Or(CAGE_TOTALS.map(total =>
  new And(CAGES.map(cage => new Sum(total, ...cage.cells)))));

// A cage is active (shock digit >= 5) or safe (< 5); Finkz's path may not
// enter any cell of an active cage.
const activeKey = cached('cage-active', () => Pair.fnToKey(
  (shockDigit, posAValue) => shockDigit < 5 || posAValue === OFF, NV));
const cageAvoidance = CAGES.flatMap(cage =>
  cage.cells.map(c => new Pair(activeKey, 'cage-active', cage.shock, posA.at(c))));

// --- Variables and domains ---------------------------------------------------
const layers = [
  posA.toVar('path position mod ' + MOD_A),
  posB.toVar('path position mod ' + MOD_B),
  new Var('S', 'path steps', steps.length),
];
const domains = [
  graph.makeReplicate(new Given(gridCells[0], ...range(1, 9))),
  // VA needs no domain of its own: OFF plus MOD_A residues is the full 16-value alphabet.
  posB.makeReplicate(new Given(posB.at(gridCells[0]), ...range(1, MOD_B + 1))),
  // The step Vars need no domain of their own: the per-cell machine above
  // accepts no value on them but unused / in / out.
  new Given(posA.at(RAT_CELL), FIRST), new Given(posB.at(RAT_CELL), FIRST),
];

return [
  shape,
  ...layers,
  ...domains,
  new SameValues(2, ...TELEPORTS),
  ...BLACKCURRANTS.map(([a, b]) => new BlackDot(a, b)),
  ...pathShape,
  ...counters,
  ...noCross,
  ...whispers,
  ...cageDistinct,
  cageTotals,
  ...cageAvoidance,
];
