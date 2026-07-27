// Title: RAT RUN 29: Counterbalance
// Author: Marty Sears
// Video: https://www.youtube.com/watch?v=C59o3VPre2o
// Source: https://sudokupad.app/xipcvuhz9y

// Normal sudoku, no givens. Two rats stand on R4C5 and R6C5 and each walks to a
// cupcake, one rat per cupcake; the cupcakes are R5C4 and R5C6 and which rat
// takes which is part of the solve. A walk visits no cell twice, the two walks
// share no cell, neither crosses itself or the other, and no step passes through
// a thick maze wall. A step is orthogonal, or diagonal when the 2x2 block it cuts
// across is free of walls and carries no round wall-spot on its shared corner.
// A purple one-way door may only be crossed in the direction it points, and it
// points at the smaller of its two digits. A redcurrant joins one odd and one
// even digit. Finally, every digit standing on a rat's walk appears on that walk
// exactly as many times as its own value, counted separately for each walk.
//
// Nothing is omitted.

// The alphabet is widened to 16 so the Var layers can carry the position
// counters; the 81 grid cells are pinned back to 1-9 below.
const NV = 16;

const MOD_A = 15, MOD_B = 11;   // coprime: a spurious cycle would need 165 cells
const OFF = 1;                  // counter value for a cell no rat visits
const FIRST = 2;                // counter value of a walk's first cell
// Per-cell rat label.
const EMPTY = 1, RAT1 = 2, RAT2 = 3;
// Step values. A step is stored once, on the (a, b) pair built below; FWD means
// the rat walked a->b and BWD b->a, so the counters can tell direction.
const UNUSED = 1;
const A_FWD = 2, A_BWD = 3, B_FWD = 4, B_BWD = 5;

const RAT_CELLS = ['R4C5', 'R6C5'];        // the two mouse emoji
const CUPCAKES = ['R5C4', 'R5C6'];         // the two cupcake emoji

// --- The drawn maze -------------------------------------------------------
// Corner (i, j) is the top-left corner of cell RiCj, so the lattice runs 1..10.
// WALLS holds the sixteen thick olive polylines exactly as drawn, including the
// boundary; SPOTS holds the 39 round olive wall-spots, each on a lattice corner.
const WALLS = [
  [[6, 4], [7, 4], [7, 5]],
  [[7, 6], [7, 7], [6, 7]],
  [[5, 4], [4, 4], [4, 5]],
  [[4, 6], [4, 7], [5, 7]],
  [[7, 8], [4, 8], [4, 9]],
  [[5, 2], [5, 1], [10, 1], [10, 10], [1, 10], [1, 8], [2, 8]],
  [[5, 1], [1, 1], [1, 8]],
  [[7, 10], [7, 9]],
  [[8, 6], [8, 8]],
  [[8, 9], [9, 9]],
  [[3, 2], [2, 2], [2, 3]],
  [[3, 5], [3, 6]],
  [[6, 3], [8, 3], [8, 4], [9, 4]],
  [[7, 3], [7, 2]],
  [[8, 2], [9, 2]],
  [[9, 7], [9, 5], [8, 5]],
];
const SPOTS = [
  [2, 2], [2, 3], [2, 8], [3, 2], [3, 5], [3, 6], [3, 7], [3, 8], [4, 4],
  [4, 5], [4, 6], [4, 7], [4, 8], [4, 9], [5, 2], [5, 4], [5, 7], [6, 3],
  [6, 4], [6, 7], [7, 2], [7, 4], [7, 5], [7, 6], [7, 7], [7, 8], [7, 9],
  [8, 2], [8, 3], [8, 4], [8, 5], [8, 6], [8, 8], [8, 9], [9, 2], [9, 4],
  [9, 5], [9, 7], [9, 9],
];
// One-way doors, as [cell the arrow leaves, cell the arrow points at].
const DOORS = [
  ['R2C6', 'R3C6'],   // chevron on the R2C6/R3C6 edge, pointing down
  ['R8C4', 'R7C4'],   // chevron on the R7C4/R8C4 edge, pointing up
  ['R3C4', 'R3C5'],   // chevron on the R3C4/R3C5 edge, pointing right
];
// The seven red discs, each on the edge between the two cells it joins.
const REDCURRANTS = [
  ['R1C1', 'R1C2'], ['R1C4', 'R2C4'], ['R3C9', 'R4C9'], ['R5C7', 'R6C7'],
  ['R7C7', 'R7C8'], ['R7C2', 'R8C2'], ['R8C1', 'R9C1'],
];

const shape = new Shape('9x9', NV);
const graph = cellGraph(shape);
const gridCells = graph.cells();
const posA = graph.makeOverlay('VA');     // position along the walk, mod 15
const posB = graph.makeOverlay('VB');     // position along the walk, mod 11
const ratOf = graph.makeOverlay('VR');    // EMPTY / RAT1 / RAT2

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

// A diagonal step passes through the one corner its two cells share. It needs a
// 2x2 space, whose only internal edges are the four wall slots meeting at that
// corner, and it may not pass through a wall-spot.
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
// One Var per legal king move; moves the maze forbids get no variable at all,
// which is how the walls enter the model.
const STEP_DIRS = [[0, 1], [1, 0], [1, 1], [1, -1]];
const steps = [];
const stepsAt = new Map(gridCells.map(cell => [cell, []]));
for (const cell of gridCells) {
  for (const [dRow, dCol] of STEP_DIRS) {
    const other = graph.step(cell, dRow, dCol);
    if (!other || !stepAllowed(cell, dRow, dCol)) continue;
    const id = 'VS' + (steps.length + 1);
    steps.push({ id, a: cell, b: other, dRow, dCol });
    stepsAt.get(cell).push({ id, out: A_FWD, in: A_BWD, out2: B_FWD, in2: B_BWD });
    stepsAt.get(other).push({ id, out: A_BWD, in: A_FWD, out2: B_BWD, in2: B_FWD });
  }
}
const stepIndex = new Map(steps.map(s => [s.a + '|' + s.b, s]));
const stepBetween = (p, q) => stepIndex.get(p + '|' + q) || stepIndex.get(q + '|' + p);

const memo = new Map();
const cached = (key, build) => {
  if (!memo.has(key)) memo.set(key, build());
  return memo.get(key);
};

// --- Path shape -----------------------------------------------------------
// Per-cell machine: reads the cell's rat label and its two counters, then every
// step it is an end of. A cell no rat visits is labelled EMPTY, takes the OFF
// counter and uses no step; a visited cell is entered once and left once by its
// own rat and not touched by the other. A rat's own cell is only left; a cupcake
// is only entered, by whichever rat is on it.
// Modelling the cupcake as a walk's last cell rather than a cell the walk merely
// reaches loses nothing: a rat that passed through one cupcake and stopped on
// the other would leave the second rat no cupcake of its own, since the two
// walks share no cell.
const ROLE_OF = new Map([[RAT_CELLS[0], 'rat1'], [RAT_CELLS[1], 'rat2'],
[CUPCAKES[0], 'cupcake'], [CUPCAKES[1], 'cupcake']]);
function cellNFA(incident, role) {
  // The step values a cell sees depend on whether it is the step's a or b end,
  // so the machine is keyed on that pattern, not just on the step count.
  const sig = 'cell|' + role + '|' + incident.map(s => s.out).join(',');
  return cached(sig, () => NFA.encodeSpec({
    startState: { k: 0 },
    transition: (s, value) => {
      if (s.k === 0) {
        if (role === 'rat1' && value !== RAT1) return undefined;
        if (role === 'rat2' && value !== RAT2) return undefined;
        if (role === 'cupcake' && value === EMPTY) return undefined;
        return { k: 1, rat: value };
      }
      if (s.k === 1) {
        if ((value === OFF) !== (s.rat === EMPTY)) return undefined;
        return { k: 2, rat: s.rat };
      }
      if (s.k === 2) {
        if ((value === OFF) !== (s.rat === EMPTY)) return undefined;
        return { k: 3, rat: s.rat, in1: 0, out1: 0, in2: 0, out2: 0 };
      }
      const n = s.k - 3;
      if (n >= incident.length) return undefined;
      const step = incident[n];
      const next = {
        k: s.k + 1, rat: s.rat,
        in1: s.in1, out1: s.out1, in2: s.in2, out2: s.out2,
      };
      if (value === step.in) next.in1++;
      else if (value === step.out) next.out1++;
      else if (value === step.in2) next.in2++;
      else if (value === step.out2) next.out2++;
      else if (value !== UNUSED) return undefined;
      if (next.in1 > 1 || next.out1 > 1 || next.in2 > 1 || next.out2 > 1) return undefined;
      // Only the cell's own rat may touch it.
      if (s.rat !== RAT1 && (next.in1 > 0 || next.out1 > 0)) return undefined;
      if (s.rat !== RAT2 && (next.in2 > 0 || next.out2 > 0)) return undefined;
      return next;
    },
    accept: s => {
      if (s.k !== 3 + incident.length) return false;
      const isRat1 = s.rat === RAT1;
      const deg = isRat1 ? [s.in1, s.out1] : [s.in2, s.out2];
      if (role === 'rat1' || role === 'rat2') return deg[0] === 0 && deg[1] === 1;
      if (role === 'cupcake') return deg[0] === 1 && deg[1] === 0;
      if (s.rat === EMPTY) return s.in1 === 0 && s.out1 === 0 && s.in2 === 0 && s.out2 === 0;
      return deg[0] === 1 && deg[1] === 1;
    },
  }, NV));
}
const pathShape = gridCells.map(cell => {
  const incident = stepsAt.get(cell);
  const role = ROLE_OF.get(cell) || 'plain';
  return new NFA(cellNFA(incident, role), 'path-cell',
    ratOf.at(cell), posA.at(cell), posB.at(cell), ...incident.map(s => s.id));
});

// Position counters. Numbering a real walk 1, 2, 3, ... from the rat's cell is
// always possible, so "the arriving cell's counter is the leaving cell's plus
// one" adds nothing to a genuine walk; what it buys is that a closed cycle of
// steps beside a walk would need a length divisible by 15 and by 11, i.e. by
// 165, and there are only 81 cells. In/out degree alone cannot rule such a
// cycle out.
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
  new NFA(counterNFA(MOD_A), 'path-order', s.id, posA.at(s.a), posA.at(s.b)),
  new NFA(counterNFA(MOD_B), 'path-order', s.id, posB.at(s.a), posB.at(s.b)),
]);

// The two diagonals of a 2x2 block cross each other, and no walk may cross
// itself or the other walk.
const noCrossKey = Pair.fnToKey((x, y) => x === UNUSED || y === UNUSED, NV);
const noCross = [];
for (const cell of gridCells) {
  const right = graph.step(cell, 0, 1);
  const down = graph.step(cell, 1, 0);
  const diag = graph.step(cell, 1, 1);
  if (!right || !down || !diag) continue;
  const d1 = stepBetween(cell, diag);
  const d2 = stepBetween(right, down);
  if (d1 && d2) noCross.push(new Pair(noCrossKey, 'no-crossing', d1.id, d2.id));
}

// --- One-way doors --------------------------------------------------------
// The step across the door's edge may only run the way the arrow points, so the
// two step values for the other direction are struck from its domain. The arrow
// also names the smaller of the two digits.
const doorSteps = DOORS.map(([from, to]) => {
  const step = stepBetween(from, to);
  const allowed = step.a === from ? [A_FWD, B_FWD] : [A_BWD, B_BWD];
  return new Given(step.id, UNUSED, ...allowed);
});
const doorDigits = DOORS.map(([from, to]) => new GreaterThan(from, to));

// --- Redcurrants ----------------------------------------------------------
// Modular(2) over a two-cell "line" is the odd/even pair rule: the window of two
// must hold both residues mod 2.
const redcurrants = REDCURRANTS.map(([x, y]) => new Modular(2, x, y));

// --- The test constraint --------------------------------------------------
// For one rat and one digit d: the walk holds d exactly d times, or not at all.
// The machine reads the whole grid as (rat label, digit) pairs and counts the
// cells that are both this rat's and this digit; a count above d can never
// recover, so it is rejected on the spot rather than carried.
const countNFA = (rat, digit) => cached('count|' + rat + '|' + digit,
  () => NFA.encodeSpec({
    startState: { k: 0, n: 0 },
    transition: (s, value) => {
      if (s.k === 0) return { k: 1, n: s.n, mine: value === rat };
      const n = (s.mine && value === digit) ? s.n + 1 : s.n;
      if (n > digit) return undefined;
      return { k: 0, n };
    },
    accept: s => s.k === 0 && (s.n === 0 || s.n === digit),
  }, NV));
const testConstraint = [];
for (const rat of [RAT1, RAT2]) {
  for (let digit = 1; digit <= 9; digit++) {
    testConstraint.push(new NFA(countNFA(rat, digit), 'digit-count',
      ...gridCells.flatMap(cell => [ratOf.at(cell), cell])));
  }
}

// --- Variables and domains ------------------------------------------------
const range = (lo, hi) => Array.from({ length: hi - lo + 1 }, (_, n) => lo + n);
const layers = [
  posA.toVar('position mod ' + MOD_A),
  posB.toVar('position mod ' + MOD_B),
  ratOf.toVar('which rat visits the cell'),
  new Var('S', 'path steps', steps.length),
];
const domains = [
  graph.makeReplicate(new Given(gridCells[0], ...range(1, 9))),
  // VA needs no domain of its own: the sentinel plus MOD_A residues is exactly
  // the 16-value alphabet.
  posB.makeReplicate(new Given(posB.at(gridCells[0]), ...range(1, MOD_B + 1))),
  ratOf.makeReplicate(new Given(ratOf.at(gridCells[0]), EMPTY, RAT1, RAT2)),
  // The step Vars need no domain of their own: the path-cell machines accept no
  // value on them but unused / in / out, for either rat.
  // Each rat's own cell is the first cell of its walk; without this the whole
  // numbering could rotate freely.
  new Given(ratOf.at(RAT_CELLS[0]), RAT1),
  new Given(ratOf.at(RAT_CELLS[1]), RAT2),
  ...RAT_CELLS.flatMap(cell => [
    new Given(posA.at(cell), FIRST), new Given(posB.at(cell), FIRST)]),
];

return [
  shape,
  ...layers,
  ...domains,
  ...pathShape,
  ...counters,
  ...noCross,
  ...doorSteps,
  ...doorDigits,
  ...redcurrants,
  ...testConstraint,
];
