// Title: RAT RUN 25: Mod Cons
// Author: Marty Sears
// Video: https://www.youtube.com/watch?v=iKIMhFo26Ws
// Source: https://sudokupad.app/z3tyv4nda6

// Normal sudoku. Finkz and Phinx stand on R9C1 and R1C9 and each walks through
// the maze to a cupcake; the two reach different cupcakes, of R1C1 and R9C9. A
// walk visits no cell twice, the two walks share no cell, neither crosses itself
// or the other, and no step passes through a thick maze wall. A step is
// orthogonal, or diagonal when the 2x2 area it cuts across is free of walls and
// the corner it passes through carries no round wall-spot.
// Two digits joined by a blackcurrant have one double the other.
// A purple arrow points to the smaller of the two digits it sits between, and a
// walk may cross that edge only in the direction the arrow points.
// A pink motion sensor's digit is the number of visited cells among the up to
// nine cells surrounding it, itself included when visited.
// A grey camera's digit is the total of the digits of the visited cells its lens
// points at, along its ray up to the first wall.
// Both walks are modular lines: any three successive cells of a walk hold one
// digit from each of [1,4,7], [2,5,8] and [3,6,9].
//
// Nothing is omitted.

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

const RAT_A = 'R9C1', RAT_B = 'R1C9';     // the two rat emoji
const CUPCAKES = ['R1C1', 'R9C9'];        // the two cupcake emoji

// --- The drawn maze -------------------------------------------------------
// Corner (i, j) is the top-left corner of cell RiCj, so the lattice runs 1..10.
// WALLS holds the eighteen thick blue polylines exactly as drawn, including the
// stretches that run along the grid boundary; SPOTS holds the 41 round blue
// wall-spots, each of which sits on a lattice corner.
const WALLS = [
  [[2, 9], [2, 10], [10, 10], [10, 1], [7, 1], [7, 2]],
  [[2, 10], [1, 10], [1, 1], [7, 1]],
  [[8, 10], [8, 9], [7, 9]],
  [[6, 1], [6, 2]],
  [[8, 9], [8, 8]],
  [[6, 7], [6, 9]],
  [[7, 7], [7, 8]],
  [[2, 7], [4, 7], [4, 9], [3, 9]],
  [[3, 7], [3, 6], [4, 6]],
  [[4, 8], [5, 8]],
  [[2, 5], [3, 5]],
  [[3, 3], [3, 4], [2, 4]],
  [[4, 4], [5, 4]],
  [[6, 6], [6, 3]],
  [[7, 6], [7, 3]],
  [[4, 5], [5, 5]],
  [[4, 3], [4, 2], [3, 2]],
  [[8, 2], [9, 2], [9, 3]],
];
const SPOTS = [
  [2, 2], [2, 3], [2, 4], [2, 5], [2, 6], [2, 7], [2, 8], [2, 9], [3, 2],
  [3, 3], [3, 4], [3, 5], [3, 6], [3, 8], [3, 9], [4, 2], [4, 3], [4, 4],
  [4, 5], [4, 6], [4, 7], [4, 9], [5, 4], [5, 5], [5, 8], [5, 9], [6, 2],
  [6, 3], [6, 6], [6, 7], [6, 9], [7, 2], [7, 3], [7, 6], [7, 7], [7, 8],
  [7, 9], [8, 2], [8, 8], [9, 2], [9, 3],
];
// The drawn fruit, each named by the two cells whose shared edge it sits on.
const BLACKCURRANTS = [
  ['R1C5', 'R1C6'], ['R1C7', 'R1C8'], ['R3C3', 'R4C3'], ['R3C4', 'R4C4'],
  ['R3C5', 'R4C5'], ['R4C8', 'R5C8'], ['R5C7', 'R5C8'],
];
// The drawn purple arrows, each named by the pair it sits between in the
// direction it points: towards the smaller digit, and the only direction a walk
// may cross that edge.
const DOORS = [
  ['R2C6', 'R2C5'], ['R2C7', 'R2C8'], ['R3C4', 'R2C4'], ['R3C4', 'R3C5'],
];
// The pink motion sensors, and the grey cameras with the (dRow, dCol) their lens
// faces: each camera's lens housing is drawn offset to that side of its cell.
const SENSORS = ['R1C4', 'R4C3', 'R9C2', 'R9C7'];
const CAMERAS = { R6C1: [0, 1], R3C6: [1, 0], R7C9: [-1, 0] };

const shape = new Shape('9x9', NV);
const graph = cellGraph(shape);
const gridCells = graph.cells();
const posA = graph.makeOverlay('VA');     // walk position mod MOD_A
const posB = graph.makeOverlay('VB');     // walk position mod MOD_B

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
// One Var per legal king move, recording whether a walk uses it and in which
// direction; a move the maze forbids gets no variable at all, which is how the
// walls and the wall-spots are enforced.
const STEP_DIRS = [[0, 1], [1, 0], [1, 1], [1, -1]];
const steps = [];
const stepsAt = new Map(gridCells.map(cell => [cell, []]));
for (const cell of gridCells) {
  for (const [dRow, dCol] of STEP_DIRS) {
    const other = graph.step(cell, dRow, dCol);
    if (!other || !stepAllowed(cell, dRow, dCol)) continue;
    const step = { id: 'VS' + (steps.length + 1), a: cell, b: other };
    steps.push(step);
    stepsAt.get(cell).push({ step, out: A_FWD, in: A_BWD, out2: B_FWD, in2: B_BWD });
    stepsAt.get(other).push({ step, out: A_BWD, in: A_FWD, out2: B_BWD, in2: B_FWD });
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
      const arm = incident[n];
      const next = {
        k: s.k + 1, vis: s.vis,
        inA: s.inA, outA: s.outA, inB: s.inB, outB: s.outB,
      };
      if (value === arm.in) next.inA++;
      else if (value === arm.out) next.outA++;
      else if (value === arm.in2) next.inB++;
      else if (value === arm.out2) next.outB++;
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
    posA.at(cell), posB.at(cell), ...incident.map(arm => arm.step.id));
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
// or the other walk. Orthogonal steps meet only at a cell they share, which no
// cell being used twice already forbids.
const noCrossKey = Pair.fnToKey((x, y) => x === UNUSED || y === UNUSED, NV);
const noCross = gridCells.flatMap(cell => {
  const right = graph.step(cell, 0, 1);
  const down = graph.step(cell, 1, 0);
  const diag = graph.step(cell, 1, 1);
  if (!right || !down || !diag) return [];
  const fall = stepIndex.get(cell + '|' + diag);
  const rise = stepIndex.get(right + '|' + down);
  return fall && rise ? [new Pair(noCrossKey, 'no-crossing', fall.id, rise.id)] : [];
});

// --- Modular walks --------------------------------------------------------
// Writing a cell's class for the group its digit falls in -- 1 for [1,4,7], 2
// for [2,5,8], 3 for [3,6,9] -- the rule is that the classes of any three
// successive cells of a walk are all different. That is the same as: the class
// of a cell depends only on its position along the walk taken mod 3, through
// some one-to-one table from the three residues to the three classes. Both ways
// round: a table gives three different classes to any three successive
// positions; and conversely, if positions p, p+1, p+2 always carry three
// different classes then p+3 must repeat p's, so the classes are 3-periodic and
// the first three of them are the table. (A walk of one or two cells has no
// three successive cells to constrain, but also no such walk exists here: no rat
// cell is a legal step away from a cupcake.)
// The two tables are the six cells of VP: entries 1-3 hold the classes of walk A
// at positions congruent to 1, 2, 0 mod 3, and entries 4-6 the same for walk B.
const phases = new Var('P', 'modular class by walk and position mod 3', '2x3');
const classCell = (walk, phase) => phases.cell(walk, phase + 1);
const PHASE_ENTRIES = [1, 2].flatMap(
  walk => [0, 1, 2].map(phase => classCell(walk, phase)));
// Reads every step the cell is an end of, then the cell's mod-9 counter, its
// digit, and the whole of VP. The step values name the walk, since a used step
// carries the walk it belongs to whichever end is reading it. MOD_B is a
// multiple of 3, so position mod 3 survives the reduction and the counter gives
// the cell's phase. A cell no walk visits reads the table but constrains
// nothing.
const phaseNFA = degree => cached('phase|' + degree, () => NFA.encodeSpec({
  startState: { k: 0, walk: 0 },
  transition: (s, value) => {
    if (s.k < degree) {
      const walk = value === A_FWD || value === A_BWD ? 1
        : value === B_FWD || value === B_BWD ? 2 : 0;
      if (walk !== 0 && s.walk !== 0 && walk !== s.walk) return undefined;
      return { k: s.k + 1, walk: walk || s.walk };
    }
    if (s.k === degree) {
      // idx is the VP entry this cell must agree with, or -1 when unvisited.
      if (s.walk === 0) return value === OFF ? { k: s.k + 1, idx: -1 } : undefined;
      if (value === OFF) return undefined;
      return { k: s.k + 1, idx: (s.walk - 1) * 3 + ((value - FIRST) % 3) };
    }
    if (s.k === degree + 1) {
      return { k: s.k + 1, idx: s.idx, want: ((value - 1) % 3) + 1 };
    }
    const n = s.k - degree - 2;
    if (n >= PHASE_ENTRIES.length) return undefined;
    if (n === s.idx && value !== s.want) return undefined;
    return { k: s.k + 1, idx: s.idx, want: s.want };
  },
  accept: s => s.k === degree + 2 + PHASE_ENTRIES.length,
}, NV));
const modular = [
  ...PHASE_ENTRIES.map(entry => new Given(entry, 1, 2, 3)),
  // Each walk's table is one-to-one, which is what makes three successive
  // classes three different classes rather than merely 3-periodic.
  ...[1, 2].map(walk => new AllDifferent(
    ...[0, 1, 2].map(phase => classCell(walk, phase)))),
  ...gridCells.map(cell => new NFA(
    phaseNFA(stepsAt.get(cell).length), 'modular-phase',
    ...stepsAt.get(cell).map(arm => arm.step.id), posB.at(cell), cell,
    ...PHASE_ENTRIES)),
];

// --- Motion sensors -------------------------------------------------------
// Reads the sensor's digit, then the position counter of each cell of its
// neighbourhood; a counter other than OFF means that cell is visited.
const sensorNFA = n => cached('sensor|' + n, () => NFA.encodeSpec({
  startState: { k: 0 },
  transition: (s, value) => {
    if (s.k === 0) return value > n ? undefined : { k: 1, want: value, seen: 0 };
    if (s.k > n) return undefined;
    const seen = s.seen + (value === OFF ? 0 : 1);
    return seen > s.want ? undefined : { k: s.k + 1, want: s.want, seen };
  },
  accept: s => s.k === n + 1 && s.seen === s.want,
}, NV));
const sensors = SENSORS.map(cell => {
  // The sensor's own cell is one of the up-to-nine it surveys.
  const around = [cell, ...graph.kingNeighbours(cell)];
  return new NFA(sensorNFA(around.length), 'motion-sensor',
    cell, ...posA.at(around));
});

// --- Video cameras --------------------------------------------------------
// The lens sees along its direction until a wall stops it; the camera's own cell
// is not one of the cells it points at.
const sightLine = (cell, [dRow, dCol]) => {
  const line = [];
  for (let at = cell; ;) {
    const next = graph.step(at, dRow, dCol);
    if (!next || !stepAllowed(at, dRow, dCol)) return line;
    line.push(next);
    at = next;
  }
};
// Reads the camera's digit, then each sight cell as its position counter
// followed by its digit; a visited cell's digit joins the running total.
const cameraNFA = n => cached('camera|' + n, () => NFA.encodeSpec({
  startState: { k: 0 },
  transition: (s, value) => {
    if (s.k === 0) return { k: 1, want: value, sum: 0 };
    if (s.k > 2 * n) return undefined;
    if (s.k % 2 === 1) {
      return { k: s.k + 1, want: s.want, sum: s.sum, on: value !== OFF };
    }
    const sum = s.sum + (s.on ? value : 0);
    return sum > s.want ? undefined : { k: s.k + 1, want: s.want, sum };
  },
  accept: s => s.k === 2 * n + 1 && s.sum === s.want,
}, NV));
const cameras = Object.entries(CAMERAS).map(([cell, direction]) => {
  const line = sightLine(cell, direction);
  return new NFA(cameraNFA(line.length), 'video-camera',
    cell, ...line.flatMap(seen => [posA.at(seen), seen]));
});

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
  phases,
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
  ...noCross,
  ...modular,
  ...sensors,
  ...cameras,
  ...blackcurrants,
  ...doors,
];
