// Title: RAT RUN 2: Tenacity
// Author: Marty Sears
// Video: https://www.youtube.com/watch?v=mCO3JZbzleM
// Source: https://sudokupad.app/3xofp0uc0s

// Normal 8x8 sudoku: digits 1-8, no repeat in a row, column or marked 4x2 box.
// Finkz the rat stands on R7C2 and must reach the cupcake on R8C8 by a snaking
// path through cell centres. The path visits no cell more than once, never
// crosses itself, and never passes through a thick maze wall. A step is
// orthogonal, or diagonal when there is a 2x2 space to move through, but a
// diagonal step may never pass through the rounded end / corner of a wall.
// Any two cells adjacent along the path sum to at least ten.
//
// Nothing is omitted.

// The alphabet is widened to 10 so the two position-counter layers fit; the 64
// grid cells are pinned back to 1-8.
const NV = 10;

const MOD_A = 9, MOD_B = 8;   // coprime: a spurious cycle would need 72 cells
const OFF = 1;                // counter value for a cell the path misses
const FIRST = 2;              // counter value of the path's first cell
// Step values. A step is stored once, on the (a, b) pair below; FWD means the
// rat walked a->b and BWD means b->a, so the counters can tell direction.
const UNUSED = 1, FWD = 2, BWD = 3;
const MIN_SUM = 10;           // the test constraint

const RAT = 'R7C2';           // the rat emoji
const CUPCAKE = 'R8C8';       // the cupcake emoji

// --- The drawn maze -------------------------------------------------------
// Corner (i, j) is the top-left corner of cell RiCj, so the lattice runs 1..9.
// WALLS holds the fifteen thick maze polylines exactly as drawn, including the
// four boundary edges; SPOTS holds the 28 round wall-caps, each on a lattice
// corner.
const WALLS = [
  [[8, 4], [8, 3], [7, 3], [7, 1], [9, 1], [9, 9], [1, 9], [1, 7], [2, 7]],
  [[8, 3], [8, 2]],
  [[7, 1], [1, 1], [1, 7]],
  [[7, 9], [7, 8]],
  [[5, 9], [5, 6]],
  [[1, 5], [2, 5]],
  [[3, 8], [3, 4], [2, 4]],
  [[3, 6], [2, 6]],
  [[8, 8], [8, 5], [6, 5], [6, 2]],
  [[5, 4], [5, 2], [2, 2]],
  [[5, 5], [4, 5], [4, 8]],
  [[4, 5], [4, 4]],
  [[2, 3], [3, 3]],
  [[6, 6], [7, 6], [7, 7]],
  [[6, 7], [6, 8]],
];
const SPOTS = [
  [2, 2], [2, 3], [2, 4], [2, 5], [2, 6], [2, 7], [3, 3], [3, 4], [3, 8],
  [4, 4], [4, 8], [5, 2], [5, 4], [5, 5], [5, 6], [6, 2], [6, 5], [6, 6],
  [6, 7], [6, 8], [7, 3], [7, 6], [7, 7], [7, 8], [8, 2], [8, 4], [8, 5],
  [8, 8],
];

const shape = new Shape('8x8', NV);
const graph = cellGraph(shape);
const gridCells = graph.cells();
const posA = graph.makeOverlay('VA');   // position along the path, mod MOD_A
const posB = graph.makeOverlay('VB');   // position along the path, mod MOD_B

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

// A diagonal step passes through the one corner its two cells share. The 2x2
// space it needs is that corner's four surrounding cells with none of the four
// wall slots meeting there drawn; separately, the corner may carry no wall-cap.
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
// One Var per legal king move; a move the maze forbids gets no variable at all,
// so the walls live in the graph rather than in a constraint.
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

const memo = new Map();
const cached = (key, build) => {
  if (!memo.has(key)) memo.set(key, build());
  return memo.get(key);
};

// --- Path shape -----------------------------------------------------------
// Per-cell machine: reads the cell's two counters, then every step the cell is
// an end of. A cell the path misses takes the OFF counter and uses no step; a
// visited cell is entered once and left once. The rat's cell is only left and
// the cupcake only entered, both exactly once.
const ROLE_OF = new Map([[RAT, 'rat'], [CUPCAKE, 'cupcake']]);
function cellNFA(incident, role) {
  // The step values a cell sees depend on whether it is the step's a or b end,
  // so the machine is keyed on that pattern, not just on the step count.
  const sig = 'cell|' + role + '|' + incident.map(s => s.out).join(',');
  return cached(sig, () => NFA.encodeSpec({
    startState: { k: 0 },
    transition: (s, value) => {
      if (s.k === 0) return { k: 1, vis: value !== OFF };
      if (s.k === 1) {
        // The two counters must agree about whether the cell is visited.
        if ((value !== OFF) !== s.vis) return undefined;
        return { k: 2, vis: s.vis, ins: 0, outs: 0 };
      }
      const n = s.k - 2;
      if (n >= incident.length) return undefined;
      const step = incident[n];
      const next = { k: s.k + 1, vis: s.vis, ins: s.ins, outs: s.outs };
      if (value === step.in) next.ins++;
      else if (value === step.out) next.outs++;
      else if (value !== UNUSED) return undefined;
      if (next.ins > 1 || next.outs > 1) return undefined;
      return next;
    },
    accept: s => {
      if (s.k !== 2 + incident.length) return false;
      if (role === 'rat') return s.vis && s.outs === 1 && s.ins === 0;
      if (role === 'cupcake') return s.vis && s.ins === 1 && s.outs === 0;
      if (!s.vis) return s.ins === 0 && s.outs === 0;
      return s.ins === 1 && s.outs === 1;
    },
  }, NV));
}
const pathShape = gridCells.map(cell => {
  const incident = stepsAt.get(cell);
  return new NFA(cellNFA(incident, ROLE_OF.get(cell) || 'plain'), 'path-cell',
    posA.at(cell), posB.at(cell), ...incident.map(s => s.id));
});

// Position counters. Numbering a real path 1, 2, 3, ... from the rat's cell is
// always possible, so "the arriving cell's counter is the leaving cell's plus
// one" adds nothing to a path; what it buys is that a closed cycle of steps
// beside the path would need a length divisible by 9 and by 8, i.e. by 72,
// and there are only 64 cells. The degree machines alone cannot rule one out.
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
    if (s.dir === BWD) return s.a === nextPos(value, mod) ? { done: true } : undefined;
    return undefined;
  },
  accept: s => s.done === true,
}, NV));
const counters = steps.flatMap(s => [
  new NFA(counterNFA(MOD_A), 'path-order', s.id, posA.at(s.a), posA.at(s.b)),
  new NFA(counterNFA(MOD_B), 'path-order', s.id, posB.at(s.a), posB.at(s.b)),
]);

// The test constraint, read on each step: a used step's two cells sum to at
// least ten, an unused step says nothing about its cells.
const sumNFA = cached('path-sum', () => NFA.encodeSpec({
  startState: { k: 0 },
  transition: (s, value) => {
    if (s.k === 0) return { k: 1, used: value !== UNUSED };
    if (s.k === 1) return { k: 2, used: s.used, a: value };
    if (s.k !== 2) return undefined;
    if (!s.used) return { done: true };
    return s.a + value >= MIN_SUM ? { done: true } : undefined;
  },
  accept: s => s.done === true,
}, NV));
const pathSums = steps.map(
  s => new NFA(sumNFA, 'path-sum', s.id, s.a, s.b));

// The two diagonals of a 2x2 block cross each other, and the path may not cross
// itself.
const noCrossKey = Pair.fnToKey((x, y) => x === UNUSED || y === UNUSED, NV);
const stepIndex = new Map(steps.map(s => [s.a + '|' + s.b, s.id]));
const noCross = gridCells.flatMap(cell => {
  const right = graph.step(cell, 0, 1);
  const down = graph.step(cell, 1, 0);
  const diag = graph.step(cell, 1, 1);
  if (!right || !down || !diag) return [];
  const d1 = stepIndex.get(cell + '|' + diag);
  const d2 = stepIndex.get(right + '|' + down);
  return (d1 && d2) ? [new Pair(noCrossKey, 'no-crossing', d1, d2)] : [];
});

// --- Variables and domains ------------------------------------------------
const range = (lo, hi) => Array.from({ length: hi - lo + 1 }, (_, n) => lo + n);
return [
  shape,
  posA.toVar('position mod ' + MOD_A),
  posB.toVar('position mod ' + MOD_B),
  new Var('S', 'path steps', steps.length),
  graph.makeReplicate(new Given(gridCells[0], ...range(1, 8))),
  // VA needs no domain of its own: the OFF sentinel plus MOD_A residues is
  // exactly the 10-value alphabet.
  posB.makeReplicate(new Given(posB.at(gridCells[0]), ...range(1, MOD_B + 1))),
  // The step Vars need no domain of their own: the path-cell machines accept
  // no value on them but unused / in / out.
  new Given(posA.at(RAT), FIRST),
  new Given(posB.at(RAT), FIRST),
  ...pathShape,
  ...counters,
  ...pathSums,
  ...noCross,
];
