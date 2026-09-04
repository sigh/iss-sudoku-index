// Title: Hamiltonian Killer Thermo
// Author: Kaktuslav
// Video: https://www.youtube.com/watch?v=qZaMz2kSgCw
// Source: https://sudokupad.app/wcq666h4y2

// Normal sudoku rows and columns only (no boxes: the payload carries a single
// whole-grid region, and the rules never mention boxes). Draw a directed path
// that moves orthogonally between cell centres and visits every cell of the
// grid exactly once. Each of the 27 cages -- a full partition of the grid,
// drawn with no printed total -- can be entered by the path at most once, i.e.
// all of a cage's cells form a single continuous run of the path before it
// leaves. Reading the cages as the path visits them in order, their totals
// (sum of the digits in each cage) must strictly increase from the path's
// start. Digits may not repeat within a cage.
//
// Nothing is omitted.
//
// Encoding strategy: the path is one directed step Var per grid edge
// (UNUSED/FWD/BWD) plus a START/MID/END role overlay checked against each
// cell's own in/out step count, with ContainExact pinning exactly one START
// and one END cell (so the degree rules alone would otherwise also admit a
// disjoint union of several paths, not just one). This yields one path plus
// zero or more separate cycles ("subtours"); the two path rules above then do
// double duty as subtour elimination instead of needing the usual modular
// position counters, since a route carrying a monotone quantity needs no
// counters. A cycle that crosses any cage
// boundary produces a closed chain of strict cage-total inequalities, which is
// unsatisfiable, so cage-total monotonicity alone rules out every subtour
// except one confined entirely inside a single cage. Checking the 27 cages'
// own adjacency (not just their shape) shows only three -- #21, #25, #26
// below -- contain a 2x2 block of their own cells, the minimal grid cycle;
// every other cage has a cell with fewer than two same-cage neighbours, so no
// cycle can close inside it. Those three 2x2s are excluded directly.

// Cages, transcribed from the source payload's drawn cage outlines: 27
// entries, all "no total" (an outline only), partitioning the full 81 cells.
const CAGES = [
  ['R2C1', 'R2C2'],
  ['R1C1'],
  ['R1C2', 'R1C3'],
  ['R2C3', 'R3C3'],
  ['R3C1', 'R3C2'],
  ['R4C1', 'R4C2'],
  ['R4C3', 'R4C4'],
  ['R2C4', 'R3C4'],
  ['R1C4', 'R1C5'],
  ['R2C5', 'R3C5'],
  ['R4C5', 'R4C6'],
  ['R2C6', 'R3C6'],
  ['R1C6', 'R1C7'],
  ['R1C8', 'R1C9'],
  ['R2C8', 'R2C9'],
  ['R2C7', 'R3C7'],
  ['R3C8', 'R3C9', 'R4C9'],
  ['R4C7', 'R4C8', 'R5C5', 'R5C6', 'R5C7'],
  ['R5C4', 'R6C4', 'R6C5', 'R6C6'],
  ['R8C7', 'R9C4', 'R9C5', 'R9C6', 'R9C7'],
  ['R8C3', 'R8C4', 'R9C3'],
  ['R7C3', 'R7C4', 'R7C5', 'R7C6', 'R8C5', 'R8C6'],
  ['R5C1', 'R5C2', 'R5C3', 'R6C3'],
  ['R6C1', 'R6C2', 'R7C2', 'R8C2'],
  ['R7C1', 'R8C1', 'R9C1', 'R9C2'],
  ['R5C8', 'R5C9', 'R6C7', 'R6C8', 'R6C9', 'R7C9'],
  ['R7C7', 'R7C8', 'R8C8', 'R8C9', 'R9C8', 'R9C9'],
];
// The three cages whose own cells contain a 2x2 block -- verified by checking
// every cage's internal adjacency graph, not just eyeballing shape -- named by
// that block's (top-left, top-right, bottom-left, bottom-right) cells.
const SUBCAGE_2X2 = [
  ['R7C5', 'R7C6', 'R8C5', 'R8C6'],   // inside cage #21
  ['R5C8', 'R5C9', 'R6C8', 'R6C9'],   // inside cage #25
  ['R8C8', 'R8C9', 'R9C8', 'R9C9'],   // inside cage #26
];

const NV = 9;                 // no widened alphabet: everything fits 1-9
const UNUSED = 1, FWD = 2, BWD = 3;      // step-Var codes
const START = 1, MID = 2, END = 3;       // path-role codes

const shape = new Shape('9x9', NV);
const graph = cellGraph(shape);
const gridCells = graph.cells();
const cageOf = new Map();
CAGES.forEach((cells, idx) => cells.forEach(cell => cageOf.set(cell, idx)));

// --- Step variables: one per grid edge, orthogonal-only, no maze -----------
// Each unordered edge is built once (right, then down), 'a' the origin cell,
// 'b' its neighbour; FWD means the path steps a->b, BWD means b->a.
const STEP_DIRS = [[0, 1], [1, 0]];
const steps = [];
const stepsAt = new Map(gridCells.map(cell => [cell, []]));
const stepIndex = new Map();
for (const cell of gridCells) {
  for (const [dRow, dCol] of STEP_DIRS) {
    const other = graph.step(cell, dRow, dCol);
    if (!other) continue;
    const id = 'VP' + (steps.length + 1);
    const step = { id, a: cell, b: other };
    steps.push(step);
    stepIndex.set(cell + '|' + other, step);
    stepsAt.get(cell).push({ id, out: FWD, in: BWD });
    stepsAt.get(other).push({ id, out: BWD, in: FWD });
  }
}

const memo = new Map();
const cached = (key, build) => {
  if (!memo.has(key)) memo.set(key, build());
  return memo.get(key);
};

// --- Path role: START (out only) / MID (in and out) / END (in only) -------
// Reads the cell's own role marker, then every incident step; each incident
// step contributes to this cell's in-count or out-count (from this cell's
// side of that edge) or is unused. Caching is keyed on the sequence of "out"
// codes, which is exactly what the transition closure hard-codes per position
// (mirrors the walk-cell machines in the Rat Run scripts).
const roleOverlay = graph.makeOverlay('VM');
function roleNFA(incident) {
  const sig = incident.map(s => s.out).join(',');
  return cached('role|' + sig, () => NFA.encodeSpec({
    startState: { k: 0 },
    transition: (s, value) => {
      if (s.k === 0) return { k: 1, role: value, in: 0, out: 0 };
      const n = s.k - 1;
      if (n >= incident.length) return undefined;
      const step = incident[n];
      const next = { k: s.k + 1, role: s.role, in: s.in, out: s.out };
      if (value === step.out) next.out++;
      else if (value === step.in) next.in++;
      else if (value !== UNUSED) return undefined;
      if (next.in > 1 || next.out > 1) return undefined;
      return next;
    },
    accept: (s) => {
      if (s.k !== 1 + incident.length) return false;
      if (s.role === START) return s.out === 1 && s.in === 0;
      if (s.role === MID) return s.out === 1 && s.in === 1;
      if (s.role === END) return s.out === 0 && s.in === 1;
      return false;
    },
  }, NV));
}
const roleShape = gridCells.map(cell => {
  const incident = stepsAt.get(cell);
  return new NFA(roleNFA(incident), 'path-role',
    roleOverlay.at(cell), ...incident.map(s => s.id));
});
// Exactly one START and one END makes the whole grid one path, not several
// disjoint ones (the per-cell machine above only bounds in/out-degree to at
// most one each; nothing else stops two separate START/END pairs splitting
// the 81 cells into two paths).
const markerCells = roleOverlay.at(gridCells);
const onePath = [
  new ContainExact(String(START), ...markerCells),
  new ContainExact(String(END), ...markerCells),
];

// --- Cage rules: all-different, and totals strictly increase along the path
// One NFA per grid edge whose two cells lie in different cages: reads every
// cell of the "a" side's cage, then every cell of the "b" side's cage, then
// the step last, accepting unconditionally when the step is unused and
// otherwise only when the cage being left has the smaller total. Carries only
// the running difference sumB-sumA, not both sums, and reads the step last so
// its direction does not multiply through the whole scan -- tracking both
// sums (or reading the step first) blows the 4096-state compile cap. Cached
// per (sizeA, sizeB) since the check does not depend on which cages they are,
// only on their cell counts.
function crossNFA(sizeA, sizeB) {
  return cached('cross|' + sizeA + '|' + sizeB, () => NFA.encodeSpec({
    startState: { k: 0, diff: 0 },
    transition: (s, value) => {
      if (s.k < sizeA) return { k: s.k + 1, diff: s.diff - value };
      if (s.k < sizeA + sizeB) return { k: s.k + 1, diff: s.diff + value };
      if (s.k !== sizeA + sizeB) return undefined;
      if (value !== UNUSED && value !== FWD && value !== BWD) return undefined;
      return { k: s.k + 1, diff: s.diff, dir: value };
    },
    accept: (s) => {
      if (s.k !== 1 + sizeA + sizeB) return false;
      if (s.dir === UNUSED) return true;
      if (s.dir === FWD) return s.diff > 0;    // sumA < sumB
      return s.diff < 0;                       // BWD: sumB < sumA
    },
  }, NV));
}
const crossingSteps = steps.filter(s => cageOf.get(s.a) !== cageOf.get(s.b));
const cageOrder = crossingSteps.map(s => {
  const cellsA = CAGES[cageOf.get(s.a)];
  const cellsB = CAGES[cageOf.get(s.b)];
  return new NFA(crossNFA(cellsA.length, cellsB.length), 'cage-thermo-order',
    ...cellsA, ...cellsB, s.id);
});
const cageAllDifferent = CAGES.map(cells => new Cage(0, ...cells));

// --- The three cage-internal 2x2 subtours -----------------------------------
// Forbids the closed 4-cycle around one 2x2 block, in either rotation; every
// other combination of the four edges (including any left unused) is fine.
// Values outside the three step codes are rejected immediately -- carrying
// all nine raw digit values through four reads (9^4) would blow the
// 4096-state compile cap.
function block2x2NFA() {
  return cached('block2x2', () => NFA.encodeSpec({
    startState: { k: 0, vals: [] },
    transition: (s, value) => {
      if (s.k >= 4) return undefined;    // exactly four edges, no more
      if (value !== UNUSED && value !== FWD && value !== BWD) return undefined;
      return { k: s.k + 1, vals: [...s.vals, value] };
    },
    accept: (s) => {
      if (s.k !== 4) return false;
      const [t, r, b, l] = s.vals;
      const clockwise = t === FWD && r === FWD && b === BWD && l === BWD;
      const counter = t === BWD && r === BWD && b === FWD && l === FWD;
      return !(clockwise || counter);
    },
  }, NV));
}
const noSubcageCycle = SUBCAGE_2X2.map(([tl, tr, bl, br]) => {
  const top = stepIndex.get(tl + '|' + tr);
  const left = stepIndex.get(tl + '|' + bl);
  const right = stepIndex.get(tr + '|' + br);
  const bottom = stepIndex.get(bl + '|' + br);
  return new NFA(block2x2NFA(), 'no-cage-subtour', top.id, right.id, bottom.id, left.id);
});

// --- Variables and domains ---------------------------------------------------
const layers = [
  new Var('P', 'path step', steps.length),
  roleOverlay.toVar('path role (start/mid/end)'),
];
// Step cells are left at the grid's full 1-9 domain: every NFA that reads one
// already rejects any value but UNUSED/FWD/BWD on its own (the catch-all
// `else if (value !== UNUSED) return undefined` branches above), so a domain
// Given would only prune search, not change what is accepted -- and 144
// identical per-cell Givens is exactly the copy-without-Replicate the linter
// flags, with no non-spatial Replicate locator to collapse them into.
const domains = [
  roleOverlay.makeReplicate(
    new Given(roleOverlay.at(gridCells[0]), START, MID, END)),
];

return [
  shape,
  new NoBoxes(),
  ...layers,
  ...domains,
  ...cageAllDifferent,
  ...roleShape,
  ...onePath,
  ...cageOrder,
  ...noSubcageCycle,
];
