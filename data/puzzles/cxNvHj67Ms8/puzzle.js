// Title: RAT RUN 24: Between You and Me
// Author: Marty Sears
// Video: https://www.youtube.com/watch?v=cxNvHj67Ms8
// Source: https://sudokupad.app/1b3iaeit8s

// Normal sudoku. Finkz and Phinx stand on R8C7 and R9C7 and each walks through
// the maze to the cupcake cell R8C8. A walk enters no cell twice, no step
// passes through a thick maze wall, neither walk crosses itself or the other,
// and the two walks share no cell but the cupcake. A step is orthogonal, or
// diagonal when there is a 2x2 space to move through -- no wall inside the 2x2
// block the step cuts across -- and no round wall-spot on the corner it passes.
//
// Digits do not repeat within a cage, and all six cages have the same total,
// which the solver must deduce. The digit on a cage's electricity symbol is
// that cage's shock value: a cage with a shock value of 5 or more may not be
// entered by either walk, and one below 5 is unrestricted.
//
// A red X sits between two digits that sum to 10.
//
// Each walk is a between line: the highest and lowest digits along it sit on
// its two ends, the rat cell and the cupcake cell in some order, and nowhere
// else along it.
//
// Nothing is omitted.

// The alphabet is widened to 11 so the Var layers can carry the walk state and
// the two position counters; the 81 grid cells are pinned back to 1-9 below.
const NV = 11;
// Coprime counter moduli: a closed loop of steps would need a length divisible
// by both, i.e. by 99, and only 81 cells exist.
const MOD_A = 11, MOD_B = 9;

// VP: which walk holds a cell. Only the cupcake may hold BOTH.
const EMPTY = 1, RAT1 = 2, RAT2 = 3, BOTH = 4;
// A step is stored once, on the (a, b) pair it was built from; FWD means the
// rat walked a->b and BWD b->a, which is the direction the counters read.
const NOSTEP = 1, R1_FWD = 2, R1_BWD = 3, R2_FWD = 4, R2_BWD = 5;

const RAT_CELLS = ['R8C7', 'R9C7'];   // the two rat emoji
const CUPCAKE = 'R8C8';               // the cupcake emoji

// --- The drawn maze -------------------------------------------------------
// Corner (i, j) is the top-left corner of cell RiCj, so the lattice runs 1..10.
// WALLS holds the thick aquamarine strokes drawn inside the grid, as polylines
// on that lattice; the stroke tracing the outer border separates no two cells
// and is left out. SPOTS holds the 21 round aquamarine wall-spots.
const WALLS = [
  [[7, 6], [7, 7], [8, 7], [8, 8], [10, 8]],
  [[8, 4], [9, 4]],
  [[9, 5], [10, 5]],
  [[4, 8], [5, 8]],
  [[7, 3], [7, 4]],
];
const SPOTS = [
  [2, 5], [2, 6], [3, 4], [4, 4], [4, 8], [5, 2], [5, 8], [6, 2], [6, 6],
  [7, 3], [7, 4], [7, 6], [7, 7], [8, 4], [8, 5], [8, 7], [8, 8], [8, 9],
  [9, 4], [9, 5], [9, 9],
];

// The six dashed blue cage outlines, each with the cell holding its
// electricity symbol.
const CAGES = [
  { cells: ['R1C2', 'R1C3', 'R1C4', 'R1C5'], shock: 'R1C4' },
  { cells: ['R1C7', 'R2C7'], shock: 'R1C7' },
  { cells: ['R3C1', 'R3C2'], shock: 'R3C1' },
  { cells: ['R3C3', 'R4C3', 'R4C4', 'R5C4'], shock: 'R4C4' },
  { cells: ['R3C8', 'R3C9', 'R4C8', 'R5C8'], shock: 'R4C8' },
  { cells: ['R7C2', 'R8C2'], shock: 'R8C2' },
];
const SAFE_SHOCK = 4;   // "lower than 5"

// The single red X, on the edge it is drawn across.
const RED_X = ['R8C7', 'R9C7'];

const shape = new Shape('9x9', NV);
const graph = cellGraph(shape);
const gridCells = graph.cells();
const walk = graph.makeOverlay('VP');
const posA = graph.makeOverlay('VA');
const posB = graph.makeOverlay('VB');

const memo = new Map();
const cached = (key, build) => {
  if (!memo.has(key)) memo.set(key, build());
  return memo.get(key);
};
const range = (lo, hi) => Array.from({ length: hi - lo + 1 }, (_, n) => lo + n);

// --- Legal steps ----------------------------------------------------------
// Split the wall polylines into unit lattice segments: 'H|i|j' is the top edge
// of RiCj and 'V|i|j' its left edge.
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
// space it needs is the block of four cells around that corner, whose only
// internal edges are the four wall slots meeting there; a wall-spot on the
// corner blocks the step outright.
const cornerOpen = (i, j) => !spotSet.has(`${i}|${j}`) &&
  !wallSegments.has(`V|${i - 1}|${j}`) && !wallSegments.has(`V|${i}|${j}`) &&
  !wallSegments.has(`H|${i}|${j - 1}`) && !wallSegments.has(`H|${i}|${j}`);

const stepAllowed = (cell, dRow, dCol) => {
  const { row, col } = parseCellId(cell);
  if (dRow === 0) return !wallSegments.has(`V|${row}|${col + Math.max(dCol, 0)}`);
  if (dCol === 0) return !wallSegments.has(`H|${row + Math.max(dRow, 0)}|${col}`);
  return cornerOpen(row + Math.max(dRow, 0), col + Math.max(dCol, 0));
};

// One Var per legal king move; a move the maze forbids gets no variable at all,
// which is how the walls are enforced.
const STEP_DIRS = [[0, 1], [1, 0], [1, 1], [1, -1]];
const steps = [];
const incidence = new Map(gridCells.map(cell => [cell, []]));
for (const cell of gridCells) {
  for (const [dRow, dCol] of STEP_DIRS) {
    const other = graph.step(cell, dRow, dCol);
    if (!other || !stepAllowed(cell, dRow, dCol)) continue;
    const id = 'VS' + (steps.length + 1);
    steps.push({ id, a: cell, b: other });
    incidence.get(cell).push({ id, start: true });
    incidence.get(other).push({ id, start: false });
  }
}
const stepIndex = new Map(steps.map(s => [s.a + '|' + s.b, s.id]));
// The steps a cell touches, the ones it is the `a` end of first, so a machine
// reading them only needs to know how many of those come first.
const stepsAt = cell => {
  const incident = incidence.get(cell);
  return [...incident.filter(s => s.start), ...incident.filter(s => !s.start)];
};

// --- Walk shape -----------------------------------------------------------
// Per-cell machine: reads the cell's walk value, then every step it is an end
// of. A cell no rat visits uses no step; a visited cell is entered once and
// left once by the same rat. A rat's own cell is only left, and the cupcake is
// only entered, once by each rat.
const ROLE_OF = new Map([[RAT_CELLS[0], 'rat1'], [RAT_CELLS[1], 'rat2'],
[CUPCAKE, 'cupcake']]);
// The step values a cell may show, given which walk holds it.
const ALLOWED = {
  [EMPTY]: [NOSTEP],
  [RAT1]: [NOSTEP, R1_FWD, R1_BWD],
  [RAT2]: [NOSTEP, R2_FWD, R2_BWD],
  [BOTH]: [NOSTEP, R1_FWD, R1_BWD, R2_FWD, R2_BWD],
};
const degreeMachine = (starts, total, role) =>
  cached(`degree|${starts}|${total}|${role}`, () => NFA.encodeSpec({
    startState: { n: -1 },
    transition: (state, value) => {
      if (state.n === -1) {
        if (role === 'rat1' && value !== RAT1) return undefined;
        if (role === 'rat2' && value !== RAT2) return undefined;
        if (role === 'cupcake' && value !== BOTH) return undefined;
        if (role === 'plain' && value === BOTH) return undefined;
        if (!ALLOWED[value]) return undefined;
        return { n: 0, who: value, in1: 0, out1: 0, in2: 0, out2: 0 };
      }
      if (state.n >= total || !ALLOWED[state.who].includes(value)) {
        return undefined;
      }
      // Before index `starts` the cell is the step's `a` end, so a FWD value
      // there is the rat leaving; after it, a FWD value is the rat arriving.
      const leaving = state.n < starts;
      const next = { ...state, n: state.n + 1 };
      if (value === R1_FWD) { if (leaving) next.out1++; else next.in1++; }
      if (value === R1_BWD) { if (leaving) next.in1++; else next.out1++; }
      if (value === R2_FWD) { if (leaving) next.out2++; else next.in2++; }
      if (value === R2_BWD) { if (leaving) next.in2++; else next.out2++; }
      if (next.in1 > 1 || next.out1 > 1 || next.in2 > 1 || next.out2 > 1) {
        return undefined;
      }
      return next;
    },
    accept: (state) => {
      if (state.n !== total) return false;
      const { in1, out1, in2, out2 } = state;
      if (role === 'rat1') return out1 === 1 && in1 === 0;
      if (role === 'rat2') return out2 === 1 && in2 === 0;
      if (role === 'cupcake') {
        return in1 === 1 && out1 === 0 && in2 === 1 && out2 === 0;
      }
      if (state.who === EMPTY) return true;
      if (state.who === RAT1) return in1 === 1 && out1 === 1;
      return in2 === 1 && out2 === 1;
    },
  }, NV));
const degrees = gridCells.map(cell => {
  const incident = stepsAt(cell);
  const starts = incident.filter(s => s.start).length;
  return new NFA(
    degreeMachine(starts, incident.length, ROLE_OF.get(cell) || 'plain'),
    'steps-used', walk.at(cell), ...incident.map(s => s.id));
});

// --- Closing the walks: no stray loop of steps ----------------------------
// The in/out counts alone leave each rat's steps as one walk plus any number of
// closed loops. This machine reads a step, then the counter of each of its two
// cells: the arriving cell's counter is the leaving cell's plus one, wrapping
// at the modulus. Numbering a real walk 1, 2, 3, ... from the rat's cell always
// satisfies it, so it costs the walks nothing; what it buys is that a closed
// loop needs a length divisible by the modulus.
const advanceMachine = m => cached('advance|' + m, () => NFA.encodeSpec({
  startState: { phase: 'step' },
  transition: (state, value) => {
    if (state.phase === 'step') {
      if (value === NOSTEP) return { phase: 'skip', left: 2 };
      return { phase: 'first', forward: value === R1_FWD || value === R2_FWD };
    }
    if (state.phase === 'skip') {
      return state.left > 1 ? { phase: 'skip', left: 1 } : { phase: 'done' };
    }
    if (state.phase === 'first') {
      return { phase: 'second', forward: state.forward, a: value };
    }
    if (state.phase !== 'second') return undefined;
    const [from, to] = state.forward ? [state.a, value] : [value, state.a];
    return to === (from % m) + 1 ? { phase: 'done' } : undefined;
  },
  accept: (state) => state.phase === 'done',
}, NV));
// The cupcake ends both walks at once, so one counter cannot hold its position
// on each; its steps are left out of the counter layers instead. No loop can
// reach the cupcake -- in each rat's layer it has an arriving step and no
// leaving step -- so every loop is still covered.
const counterSteps = steps.filter(s => s.a !== CUPCAKE && s.b !== CUPCAKE);
// A cell no rat visits parks at 1, as do the two rat cells (position 1) and the
// cupcake, so the counters carry no free choice of their own.
const idleCounterKey = cached('idle-counter', () => Pair.fnToKey(
  (walkValue, counterValue) => walkValue !== EMPTY || counterValue === 1, NV));
const counterLayers = [[posA, MOD_A], [posB, MOD_B]].flatMap(([pos, m]) => [
  ...counterSteps.map(s => new NFA(advanceMachine(m), `position-mod-${m}`,
    s.id, pos.at(s.a), pos.at(s.b))),
  ...gridCells.map(cell => new Pair(idleCounterKey, 'idle-counter',
    walk.at(cell), pos.at(cell))),
]);

// --- No crossing ----------------------------------------------------------
// The two diagonals of a 2x2 block cross each other, and no walk may cross
// itself or the other walk.
const noCrossKey = cached('no-crossing',
  () => Pair.fnToKey((x, y) => x === NOSTEP || y === NOSTEP, NV));
const noCross = gridCells.flatMap(cell => {
  const right = graph.step(cell, 0, 1);
  const down = graph.step(cell, 1, 0);
  const diag = graph.step(cell, 1, 1);
  if (!right || !down || !diag) return [];
  const d1 = stepIndex.get(cell + '|' + diag);
  const d2 = stepIndex.get(right + '|' + down);
  return d1 && d2 ? [new Pair(noCrossKey, 'no-crossing', d1, d2)] : [];
});

// --- Cages ----------------------------------------------------------------
// Reads the cage's shock digit, then the walk value of each of its cells: a
// shock value of 5 or more leaves every cell of the cage unvisited.
const shockMachine = size => cached('shock|' + size, () => NFA.encodeSpec({
  startState: { n: -1 },
  transition: (state, value) => {
    if (state.n === -1) return { n: 0, blocked: value > SAFE_SHOCK };
    if (state.n >= size) return undefined;
    if (state.blocked && value !== EMPTY) return undefined;
    return { n: state.n + 1, blocked: state.blocked };
  },
  accept: (state) => state.n === size,
}, NV));
const cages = [
  new EqualSum(...CAGES.map(cage => cage.cells)),
  ...CAGES.map(cage => new AllDifferent(...cage.cells)),
  ...CAGES.map(cage => new NFA(shockMachine(cage.cells.length), 'shock-value',
    cage.shock, ...walk.at(cage.cells))),
];

// --- Between lines --------------------------------------------------------
// Reads a cell's walk value, then the two rat digits, the cell's own digit and
// the cupcake digit. A cell on a walk, other than that walk's two ends, must
// lie strictly between the walk's end digits; strictly, because a digit equal
// to an end digit would be a second copy of that walk's highest or lowest.
const betweenMachine = cached('between', () => NFA.encodeSpec({
  startState: { phase: 'walk' },
  transition: (state, value) => {
    if (state.phase === 'walk') {
      if (value !== EMPTY && value !== RAT1 && value !== RAT2) return undefined;
      return { phase: 'rat1', who: value };
    }
    if (state.phase === 'rat1') {
      return {
        phase: 'rat2', who: state.who,
        end: state.who === RAT1 ? value : 0,
      };
    }
    if (state.phase === 'rat2') {
      return {
        phase: 'digit', who: state.who,
        end: state.who === RAT2 ? value : state.end,
      };
    }
    if (state.phase === 'digit') {
      if (state.who === EMPTY) return { phase: 'cupcake', who: EMPTY };
      return { phase: 'cupcake', who: state.who, end: state.end, digit: value };
    }
    if (state.phase !== 'cupcake') return undefined;
    if (state.who === EMPTY) return { phase: 'done' };
    const lo = Math.min(state.end, value), hi = Math.max(state.end, value);
    return lo < state.digit && state.digit < hi ? { phase: 'done' } : undefined;
  },
  accept: (state) => state.phase === 'done',
}, NV));
const betweenLines = gridCells
  .filter(cell => !ROLE_OF.has(cell))
  .map(cell => new NFA(betweenMachine, 'between-line',
    walk.at(cell), RAT_CELLS[0], RAT_CELLS[1], cell, CUPCAKE));

// --- Variables and domains ------------------------------------------------
const layers = [
  walk.toVar('walk membership'),
  posA.toVar('position mod ' + MOD_A),
  posB.toVar('position mod ' + MOD_B),
  new Var('S', 'walk steps', steps.length),
];
const domains = [
  graph.makeReplicate(new Given(gridCells[0], ...range(1, 9))),
  // Only the cupcake may be on both walks.
  walk.makeReplicate(new Given(walk.at(gridCells[0]), EMPTY, RAT1, RAT2),
    walk.at(gridCells.filter(cell => cell !== CUPCAKE))),
  new Given(walk.at(RAT_CELLS[0]), RAT1),
  new Given(walk.at(RAT_CELLS[1]), RAT2),
  new Given(walk.at(CUPCAKE), BOTH),
  // VA needs no domain of its own: MOD_A residues fill the 11-value alphabet.
  posB.makeReplicate(new Given(posB.at(gridCells[0]), ...range(1, MOD_B))),
  ...[...RAT_CELLS, CUPCAKE].flatMap(
    cell => [new Given(posA.at(cell), 1), new Given(posB.at(cell), 1)]),
  // The step Vars need no domain of their own: the per-cell machines accept
  // no value on them but unused / in / out, for either rat.
];

return [
  shape,
  ...layers,
  ...domains,
  ...cages,
  // The red X pair is the edge between the two rat cells. Those cells lie on
  // different walks, which already forbids either walk from stepping across
  // that edge, so the door's "forbidden" leaves only the sum to encode.
  new X(...RED_X),
  ...degrees,
  ...counterLayers,
  ...noCross,
  ...betweenLines,
];
