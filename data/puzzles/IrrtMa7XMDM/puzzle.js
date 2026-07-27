// Title: RAT RUN 38: Synchronicity
// Author: Marty Sears
// Video: https://www.youtube.com/watch?v=IrrtMa7XMDM
// Source: https://sudokupad.app/up5nrki10o

// Normal sudoku. Finkz and Phinx stand on R1C1 and R9C9 and each walks through
// the maze to a cupcake; the two reach different cupcakes, of R2C1 and R8C9. A
// walk steps between orthogonally adjacent cell centres, passes through no thick
// maze wall, visits no cell twice, and the two walks share no cell.
// Two digits joined by a blackcurrant have one double the other.
// A purple arrow points to the smaller of the two digits it sits between, and a
// walk may cross that edge only in the direction the arrow points.
// Two digits visited consecutively along a walk have different parities and
// differ by at least 5.
//
// Nothing is omitted. "The paths must not ... cross themselves or each other"
// adds nothing here: with orthogonal steps between cell centres, two steps meet
// only at a cell they share, which no cell being used twice already forbids.

// The alphabet is widened so the Var layers can carry the position counters; the
// 81 grid cells are pinned back to 1-9 below.
const NV = 11;
// Coprime moduli: a closed cycle of steps beside a walk would need a length
// divisible by both, i.e. 90, and the grid holds 81 cells.
const MOD_A = 10, MOD_B = 9;
const OFF = 1;                  // counter value for a cell no rat visits
const FIRST = 2;                // counter value of a walk's first cell
// Step values. A step is stored once, on the (a, b) pair built below; FWD means
// the rat walked a->b and BWD b->a, so the counters can tell direction.
const UNUSED = 1;
const A_FWD = 2, A_BWD = 3, B_FWD = 4, B_BWD = 5;

const RAT_A = 'R1C1', RAT_B = 'R9C9';     // the two rat emoji
const CUPCAKES = ['R2C1', 'R8C9'];        // the two cupcake emoji

// The thick yellow maze walls, as drawn: polylines on the corner lattice, where
// corner (i, j) is the top-left corner of RiCj, so the lattice runs 1..10. The
// first entry is the drawn boundary loop; it separates no two grid cells.
const WALLS = [
  [[1, 1], [1, 10], [10, 10], [10, 1], [1, 1]],
  [[2, 2], [2, 3]],
  [[9, 8], [9, 9]],
];
// Round wall spots of the same yellow sit on all 64 interior corners, which is
// the drawn form of "there is no space to move diagonally in this maze": a
// diagonal step passes through the corner its two cells share, and every such
// corner carries a spot. Hence the orthogonal-only step directions below, and no
// spot list is needed.

// The drawn fruit, each named by the two cells its edge separates.
const BLACKCURRANTS = [['R2C4', 'R2C5'], ['R3C4', 'R4C4']];
// The drawn purple arrows, each named by the pair it sits between in the
// direction it points: from the larger digit to the smaller, and the only
// direction a walk may cross that edge.
const DOORS = [['R8C9', 'R9C9'], ['R8C6', 'R8C5']];

const shape = new Shape('9x9', NV);
const graph = cellGraph(shape);
const gridCells = graph.cells();
const posA = graph.makeOverlay('VA');     // walk position mod MOD_A
const posB = graph.makeOverlay('VB');     // walk position mod MOD_B

// --- The maze -------------------------------------------------------------
// Split the wall polylines into unit lattice segments: 'H|i|j' runs from corner
// (i, j) to (i, j+1) and so separates R(i-1)Cj from RiCj; 'V|i|j' runs from
// (i, j) to (i+1, j) and separates RiC(j-1) from RiCj.
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
const stepAllowed = (cell, dRow, dCol) => {
  const { row, col } = parseCellId(cell);
  return dRow === 0
    ? !wallSegments.has(`V|${row}|${col + 1}`)
    : !wallSegments.has(`H|${row + 1}|${col}`);
};

// --- Step variables -------------------------------------------------------
// One Var per orthogonal adjacency the maze leaves open, recording whether a
// walk uses it and in which direction; a walled adjacency gets no variable at
// all, which is how the walls are enforced.
const steps = [];
const stepsAt = new Map(gridCells.map(cell => [cell, []]));
for (const cell of gridCells) {
  for (const [dRow, dCol] of [[0, 1], [1, 0]]) {
    const other = graph.step(cell, dRow, dCol);
    if (!other || !stepAllowed(cell, dRow, dCol)) continue;
    const id = 'VS' + (steps.length + 1);
    steps.push({ id, a: cell, b: other });
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

// --- Walk shape -----------------------------------------------------------
// Per-cell machine: reads the cell's two counters, then every step it is an end
// of. A cell no rat visits takes the OFF counter in both layers and uses no
// step; any other cell is entered once and left once by one and the same rat.
// A rat's own cell is only left, a cupcake only entered.
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
// Each rat leaves its own cell once and enters nothing, so counting arrivals
// over the whole grid leaves exactly one cell per rat that is entered and never
// left; only the two cupcakes may be such a cell, and each of them takes exactly
// one arrival. That is what makes the two rats reach different cupcakes.
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

// --- Test constraint ------------------------------------------------------
// Reads the step, then the two digits it joins; an unused step says nothing.
const testNFA = cached('test', () => NFA.encodeSpec({
  startState: { k: 0 },
  transition: (s, value) => {
    if (s.k === 0) return { k: 1, used: value !== UNUSED };
    if (s.k === 1) return { k: 2, used: s.used, a: value };
    if (s.k !== 2) return undefined;
    if (!s.used) return { done: true };
    return ((s.a + value) % 2 === 1 && Math.abs(s.a - value) >= 5)
      ? { done: true } : undefined;
  },
  accept: s => s.done === true,
}, NV));
const testConstraint = steps.map(
  s => new NFA(testNFA, 'test-constraint', s.id, s.a, s.b));

// --- Fruit and doors ------------------------------------------------------
const blackcurrants = BLACKCURRANTS.map(([x, y]) => new BlackDot(x, y));
// An arrow's edge may only be crossed towards the cell it points at, so its step
// keeps only the unused value and the two rats' values for that one direction.
const doors = DOORS.flatMap(([from, to]) => {
  const step = stepBetween(from, to);
  const along = step.a === from ? [A_FWD, B_FWD] : [A_BWD, B_BWD];
  return [
    new GreaterThan(from, to),
    new Given(step.id, UNUSED, ...along),
  ];
});

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
  // exactly the widened alphabet.
  posB.makeReplicate(new Given(posB.at(gridCells[0]), ...range(1, MOD_B + 1))),
  // The step Vars need no domain of their own: the walk-cell machines accept no
  // value on them but unused / in / out, for either rat.
  // Each rat's own cell is the first cell of its walk; without this the whole
  // numbering of a walk could rotate freely through the residues.
  ...[RAT_A, RAT_B].flatMap(cell => [
    new Given(posA.at(cell), FIRST), new Given(posB.at(cell), FIRST)]),
];

return [
  shape,
  ...layers,
  ...domains,
  ...walkShape,
  ...counters,
  ...testConstraint,
  ...blackcurrants,
  ...doors,
];
