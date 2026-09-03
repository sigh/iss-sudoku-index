// Title: RAT RUN 5: Disparity
// Author: Marty Sears
// Video: https://www.youtube.com/watch?v=CqSAzDMgWkI
// Source: https://sudokupad.app/wv01avmfs9

// Normal sudoku, no givens.
//
// Finkz the rat stands on R9C1 and walks to the cupcake on R9C9. The walk
// passes through cell centres, visits no cell twice, never crosses itself, and
// never passes through a thick maze wall. A step is orthogonal, or diagonal
// when the 2x2 block it cuts across is free of walls and its shared corner
// carries no round wall-cap (a wall's corner or end).
//
// A purple arrow on a border may only be crossed in the direction it points,
// and it always points at the smaller of the two digits it sits between.
// A blackcurrant joins two cells in a 1:2 ratio; not all possible
// blackcurrants are given, so there is no negative constraint.
// Any two cells consecutive along the walk have opposite parity.
//
// Nothing is omitted.

// The alphabet is widened to 16 so the Var layers can carry the path state and
// the position counters; the 81 grid cells are pinned back to 1-9 below. The
// two counter moduli are coprime with lcm 165 > 81 cells, which is what forbids
// a closed loop of steps beside the walk: ISS has no single-path primitive and
// in/out degree alone admits one.
const NV = 16;
const MOD_A = 15, MOD_B = 11;
const OFF = 1;                       // counter value for a cell the walk misses
const FIRST = 2;                     // counter value of the walk's first cell
const UNUSED = 1, FWD = 2, BWD = 3;  // step values: unused, a->b, b->a

const RAT = 'R9C1';                  // the rat emoji
const CUPCAKE = 'R9C9';              // the cupcake emoji

// --- The drawn maze -------------------------------------------------------
// Corner (i, j) is the top-left corner of cell RiCj, so the lattice runs 1..10.
// WALLS holds the nineteen thick red polylines exactly as drawn. The outer
// border is drawn as a wall too but is left out: it separates no two cells.
const WALLS = [
  [[2, 2], [3, 2]],
  [[2, 3], [3, 3]],
  [[5, 2], [4, 2], [4, 4], [2, 4]],
  [[5, 3], [6, 3]],
  [[6, 2], [9, 2], [9, 3]],
  [[7, 2], [7, 3]],
  [[8, 3], [8, 4], [9, 4], [9, 5]],
  [[8, 4], [5, 4]],
  [[9, 6], [9, 7], [4, 7]],
  [[3, 7], [3, 8], [4, 8]],
  [[3, 5], [2, 5], [2, 9], [5, 9]],
  [[6, 9], [7, 9]],
  [[8, 9], [9, 9], [9, 8]],
  [[7, 8], [8, 8]],
  [[5, 8], [6, 8]],
  [[3, 6], [4, 6]],
  [[4, 5], [5, 5]],
  [[6, 5], [8, 5], [8, 6]],
  [[5, 6], [6, 6]],
];
// The round red blobs, one on every lattice corner where a wall turns or ends.
const CAPS = [
  [2, 2], [2, 3], [2, 4], [2, 5], [2, 9],
  [3, 2], [3, 3], [3, 5], [3, 6], [3, 7], [3, 8],
  [4, 2], [4, 4], [4, 5], [4, 6], [4, 7], [4, 8],
  [5, 2], [5, 3], [5, 4], [5, 5], [5, 6], [5, 8], [5, 9],
  [6, 2], [6, 3], [6, 5], [6, 6], [6, 8], [6, 9],
  [7, 3], [7, 8], [7, 9],
  [8, 3], [8, 5], [8, 6], [8, 8], [8, 9],
  [9, 2], [9, 3], [9, 4], [9, 5], [9, 6], [9, 7], [9, 8], [9, 9],
];
// The twelve purple chevrons, each as [cell the point faces, other cell]. The
// point marks the smaller digit and is the only direction of travel allowed.
const ARROWS = [
  ['R7C8', 'R6C8'], ['R3C4', 'R3C5'], ['R4C3', 'R4C4'], ['R7C7', 'R6C7'],
  ['R1C3', 'R2C3'], ['R7C3', 'R7C2'], ['R5C4', 'R5C5'], ['R1C6', 'R1C5'],
  ['R4C6', 'R4C5'], ['R1C9', 'R1C8'], ['R4C7', 'R3C7'], ['R1C7', 'R1C6'],
];
// The six black dots, each on the border between the two cells it joins.
const BLACKCURRANTS = [
  ['R4C1', 'R5C1'], ['R5C1', 'R6C1'], ['R8C5', 'R9C5'],
  ['R9C4', 'R9C5'], ['R7C7', 'R8C7'], ['R7C8', 'R8C8'],
];

const shape = new Shape('9x9', NV);
const graph = cellGraph(shape);
const gridCells = graph.cells();
const posA = graph.makeOverlay('VA');   // walk position mod 15
const posB = graph.makeOverlay('VB');   // walk position mod 11

// Split the polylines into unit lattice segments: 'H|i|j' runs from corner
// (i, j) to (i, j+1) and separates RiCj+1 from R(i+1)Cj+1; 'V|i|j' runs from
// (i, j) to (i+1, j) and separates R(i+1)Cj from R(i+1)Cj+1.
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
const capSet = new Set(CAPS.map(([i, j]) => `${i}|${j}`));

// A diagonal step passes through the one corner its two cells share. The 2x2
// block it cuts across is a "space" only when none of the four wall slots
// meeting at that corner is a wall, and the corner must carry no round cap.
const cornerOpen = (i, j) => !capSet.has(`${i}|${j}`) &&
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
// so walls live in the graph rather than in a constraint.
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
const stepIndex = new Map(steps.map(s => [s.a + '|' + s.b, s]));
const stepBetween = (p, q) => stepIndex.get(p + '|' + q) || stepIndex.get(q + '|' + p);

const memo = new Map();
const cached = (key, build) => {
  if (!memo.has(key)) memo.set(key, build());
  return memo.get(key);
};

// --- Walk shape -----------------------------------------------------------
// Per-cell machine: reads the cell's two counters, then every step it is an end
// of. A cell the walk misses takes OFF in both counters and uses no step; a
// visited cell is entered once and left once. The rat's cell is only left, the
// cupcake only entered, and both must be visited.
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
      if (role === 'rat') return s.vis && s.out === 1 && s.in === 0;
      if (role === 'cupcake') return s.vis && s.in === 1 && s.out === 0;
      return s.vis ? (s.in === 1 && s.out === 1) : (s.in === 0 && s.out === 0);
    },
  }, NV));
}
const ROLE_OF = new Map([[RAT, 'rat'], [CUPCAKE, 'cupcake']]);
const walkShape = gridCells.map(cell => {
  const incident = stepsAt.get(cell);
  return new NFA(cellNFA(incident, ROLE_OF.get(cell) || 'plain'), 'walk-cell',
    posA.at(cell), posB.at(cell), ...incident.map(s => s.id));
});

// Position counters. Numbering a real walk 1, 2, 3, ... from the rat's cell is
// always possible, so "the arriving cell's counter is the leaving cell's plus
// one" adds nothing on its own; what it buys is that a closed cycle of steps
// beside the walk would need a length divisible by 15 and by 11, i.e. by 165,
// and there are only 81 cells. Degree alone cannot rule such a cycle out.
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
  new NFA(counterNFA(MOD_A), 'walk-order', s.id, posA.at(s.a), posA.at(s.b)),
  new NFA(counterNFA(MOD_B), 'walk-order', s.id, posB.at(s.a), posB.at(s.b)),
]);

// The two diagonals of a 2x2 block cross each other, and the walk may not cross
// itself. Only one corner of this maze is open, so there is one such pair.
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

// --- Clues ----------------------------------------------------------------
// One-way doors. The digit relation holds always; the direction restriction
// applies to the step across that border, which is the only way to "pass
// directly through" a mark drawn on a cell border.
const doorDigits = ARROWS.map(([small, large]) => new GreaterThan(large, small));
const doorDirections = ARROWS.map(([small, large]) => {
  const step = stepBetween(small, large);
  return new Given(step.id, UNUSED, step.a === large ? FWD : BWD);
});

const blackcurrants = BLACKCURRANTS.map(([x, y]) => new BlackDot(x, y));

// Alternating parity: reads the step, then the digits of its two cells, and
// requires opposite parity whenever the walk uses the step.
const parityNFA = cached('parity', () => NFA.encodeSpec({
  startState: { k: 0 },
  transition: (s, value) => {
    if (s.k === 0) return { k: 1, used: value !== UNUSED };
    if (s.k === 1) return { k: 2, used: s.used, a: value };
    if (s.k !== 2) return undefined;
    if (!s.used) return { done: true };
    return (s.a + value) % 2 === 1 ? { done: true } : undefined;
  },
  accept: s => s.done === true,
}, NV));
const parity = steps.map(s => new NFA(parityNFA, 'alternating-parity', s.id, s.a, s.b));

// --- Variables and domains ------------------------------------------------
const range = (lo, hi) => Array.from({ length: hi - lo + 1 }, (_, n) => lo + n);
const layers = [
  posA.toVar('walk position mod ' + MOD_A),
  posB.toVar('walk position mod ' + MOD_B),
  new Var('S', 'walk steps', steps.length),
];
const domains = [
  graph.makeReplicate(new Given(gridCells[0], ...range(1, 9))),
  // VA needs no domain of its own: the OFF sentinel plus MOD_A residues is
  // exactly the 16-value alphabet.
  posB.makeReplicate(new Given(posB.at(gridCells[0]), ...range(1, MOD_B + 1))),
  // The step Vars need no domain of their own: the walk-cell machines accept no
  // value on them but unused / in / out.
  // The rat's cell is the first cell of the walk; pinning it stops the whole
  // numbering rotating.
  new Given(posA.at(RAT), FIRST),
  new Given(posB.at(RAT), FIRST),
];

return [
  shape,
  ...layers,
  ...domains,
  ...walkShape,
  ...counters,
  ...noCross,
  ...doorDigits,
  ...doorDirections,
  ...blackcurrants,
  ...parity,
];
