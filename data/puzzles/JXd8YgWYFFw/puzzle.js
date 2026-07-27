// Title: RAT RUN 39: Together Apart
// Author: Marty Sears
// Video: https://www.youtube.com/watch?v=JXd8YgWYFFw
// Source: https://sudokupad.app/pja7uaxak9

// Normal sudoku, with no given digits. Two rats stand on R4C5 and R8C2 and each
// walks through the maze to a cupcake, the two reaching different cupcakes of
// R7C2 and R7C9. A walk visits no cell twice, the two walks share no cell, and
// neither walk crosses itself or the other. A step joins two cell centres and
// passes through no thick maze wall; it is orthogonal, or diagonal when the 2x2
// block it cuts across has no wall between any two of its four cells and no
// round wall-spot on the corner the two cells share.
// One rat is Finkz and the other Phinx. The grid markers are unnamed, so which
// is which is part of the solve; what the drawing fixes is that the console
// badges name Finkz skyblue and Phinx plum, that the buttons come in exactly
// those two colours, and that each rat's console panel holds exactly as many
// circles as there are buttons of its colour. So Finkz visits all eight skyblue
// buttons and Phinx all seven plum ones.
// A button's digit is the number of cells its rat moves after the button to
// reach the first cell lying in a different 3x3 box.
// Two digits joined by a blackcurrant have one double the other; two joined by a
// grape differ by at least 5; two joined by a starfruit sum to a total that is
// shared by every starfruit and is deduced rather than given.
// Two digits visited one immediately after the other along a walk are not
// consecutive.
//
// Nothing is omitted. Fog is solving UI. The console drawn on the frame outside
// the grid carries no rules sentence: its bottom row of eight cells reads back
// the skyblue buttons' digits in visiting order, which the grid and the walks
// already determine.

// The alphabet is widened so the Var layers can carry the position counters; the
// 81 grid cells are pinned back to 1-9 below.
const NV = 11;

// Coprime moduli: a closed cycle of steps beside the walks would need a length
// divisible by both, i.e. 90, and the grid holds 81 cells.
const MOD_A = 10, MOD_B = 9;
const OFF = 1;                  // counter value for a cell no rat visits
const FIRST = 2;                // counter value of a walk's first cell
// Step values. A step is stored once, on the (a, b) pair built below; FWD means
// the rat walked a->b and BWD b->a, so the counters can tell direction.
const UNUSED = 1;
const A_FWD = 2, A_BWD = 3, B_FWD = 4, B_BWD = 5;
// Box-exit distances, held one per cell: NO_EXIT for a cell whose walk never
// reaches another box after it, and for a cell no rat visits; otherwise the
// distance plus one. A walk holds at most 9 cells of any one box, so a distance
// never exceeds 9.
const NO_EXIT = 1, DIST_ONE = 2, MAX_EXIT = 10;
// Which drawn rat marker is Finkz, and so which colour of button it collects.
const RAT_1_IS_FINKZ = 1, RAT_2_IS_FINKZ = 2;

const RAT_1 = 'R4C5', RAT_2 = 'R8C2';     // the two rat emoji
const CUPCAKES = ['R7C2', 'R7C9'];        // the two cupcake emoji

// --- The drawn maze -------------------------------------------------------
// Corner (i, j) is the top-left corner of cell RiCj, so the lattice runs 1..10.
// WALLS holds the eighteen thick coral polylines exactly as drawn, the first of
// them the boundary loop, which separates no two grid cells.
const WALLS = [
  [[7, 9], [7, 10], [10, 10], [10, 1], [1, 1], [1, 10], [7, 10]],
  [[4, 2], [5, 2]],
  [[6, 2], [8, 2], [8, 3]],
  [[9, 3], [9, 4]],
  [[8, 10], [8, 9]],
  [[1, 7], [3, 7]],
  [[4, 3], [6, 3]],
  [[3, 3], [3, 4], [4, 4], [4, 5]],
  [[3, 4], [2, 4]],
  [[5, 4], [6, 4]],
  [[7, 3], [7, 4]],
  [[5, 6], [4, 6], [4, 7]],
  [[6, 7], [7, 7], [7, 6]],
  [[2, 3], [2, 2], [3, 2]],
  [[8, 7], [9, 7]],
  [[7, 8], [8, 8]],
  [[4, 8], [4, 9], [5, 9]],
  [[8, 4], [8, 5], [9, 5]],
];
// The 49 round coral wall-spots, each on a lattice corner. Thirty-nine of them
// are the round joints and end-caps of the strokes above; ten stand alone, away
// from any wall, and are the only ones that block a diagonal by themselves.
const SPOTS = [
  [2, 2], [2, 3], [2, 4], [2, 5], [2, 6], [2, 8], [2, 9], [3, 2], [3, 3],
  [3, 7], [3, 8], [3, 9], [4, 2], [4, 3], [4, 4], [4, 5], [4, 6], [4, 7],
  [4, 8], [4, 9], [5, 2], [5, 4], [5, 5], [5, 6], [5, 9], [6, 2], [6, 3],
  [6, 4], [6, 7], [6, 8], [7, 3], [7, 4], [7, 6], [7, 7], [7, 8], [7, 9],
  [8, 2], [8, 3], [8, 4], [8, 5], [8, 6], [8, 7], [8, 8], [8, 9], [9, 3],
  [9, 4], [9, 5], [9, 6], [9, 7],
];

// The drawn buttons, each filling a cell, in the two rat colours.
const SKYBLUE_BUTTONS = ['R1C3', 'R1C4', 'R3C7', 'R4C9', 'R5C1', 'R7C1',
  'R8C4', 'R9C3'];
const PLUM_BUTTONS = ['R3C3', 'R4C4', 'R4C7', 'R5C2', 'R6C4', 'R8C7', 'R9C6'];

// The drawn fruit, each named by the two cells its edge separates.
const BLACKCURRANTS = [['R8C2', 'R9C2'], ['R4C4', 'R4C5'], ['R2C7', 'R2C8'],
['R4C6', 'R5C6']];
const GRAPES = [['R4C2', 'R5C2'], ['R1C1', 'R1C2'], ['R7C5', 'R7C6'],
['R9C7', 'R9C8'], ['R3C5', 'R3C6']];
const STARFRUIT = [['R5C3', 'R6C3'], ['R7C3', 'R8C3'], ['R6C3', 'R6C4'],
['R6C7', 'R7C7'], ['R2C2', 'R3C2'], ['R5C4', 'R6C4']];

const shape = new Shape('9x9', NV);
const graph = cellGraph(shape);
const gridCells = graph.cells();
const posA = graph.makeOverlay('VA');     // walk position mod MOD_A
const posB = graph.makeOverlay('VB');     // walk position mod MOD_B
const exit = graph.makeOverlay('VE');     // cells to the walk's next 3x3 box
const FINKZ_IS = 'VW';

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

const boxOf = cell => {
  const { row, col } = parseCellId(cell);
  return Math.floor((row - 1) / 3) * 3 + Math.floor((col - 1) / 3);
};

// --- Step variables -------------------------------------------------------
// One Var per legal king move, recording whether a walk uses it and in which
// direction; a move the maze forbids gets no variable at all, which is how the
// walls and wall-spots are enforced.
const STEP_DIRS = [[0, 1], [1, 0], [1, 1], [1, -1]];
const steps = [];
const stepsAt = new Map(gridCells.map(cell => [cell, []]));
for (const cell of gridCells) {
  for (const [dRow, dCol] of STEP_DIRS) {
    const other = graph.step(cell, dRow, dCol);
    if (!other || !stepAllowed(cell, dRow, dCol)) continue;
    const id = 'VS' + (steps.length + 1);
    steps.push({ id, a: cell, b: other });
    stepsAt.get(cell).push({ id, out: A_FWD, in: A_BWD, out2: B_FWD, in2: B_BWD });
    stepsAt.get(other).push({ id, out: A_BWD, in: A_FWD, out2: B_BWD, in2: B_FWD });
  }
}

const memo = new Map();
const cached = (key, build) => {
  if (!memo.has(key)) memo.set(key, build());
  return memo.get(key);
};

// --- Walk shape -----------------------------------------------------------
// Per-cell machine: reads the cell's two counters, then every step it is an end
// of. A cell no rat visits takes the OFF counter in both layers and uses no
// step; any other cell is entered once and left once by one and the same rat. A
// rat's own cell is only left, a cupcake only entered.
const ROLE_OF = new Map([[RAT_1, 'rat1'], [RAT_2, 'rat2'],
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
        return { k: 2, vis: s.vis, in1: 0, out1: 0, in2: 0, out2: 0 };
      }
      const n = s.k - 2;
      if (n >= incident.length) return undefined;
      const step = incident[n];
      const next = {
        k: s.k + 1, vis: s.vis,
        in1: s.in1, out1: s.out1, in2: s.in2, out2: s.out2,
      };
      if (value === step.in) next.in1++;
      else if (value === step.out) next.out1++;
      else if (value === step.in2) next.in2++;
      else if (value === step.out2) next.out2++;
      else if (value !== UNUSED) return undefined;
      if (next.in1 > 1 || next.out1 > 1 || next.in2 > 1 || next.out2 > 1) {
        return undefined;
      }
      return next;
    },
    accept: s => {
      if (s.k !== 2 + incident.length) return false;
      if (role === 'rat1') {
        return s.vis && s.out1 === 1 && s.in1 === 0 && s.in2 === 0 && s.out2 === 0;
      }
      if (role === 'rat2') {
        return s.vis && s.out2 === 1 && s.in2 === 0 && s.in1 === 0 && s.out1 === 0;
      }
      if (role === 'cupcake') {
        return s.vis && s.out1 === 0 && s.out2 === 0 && s.in1 + s.in2 === 1;
      }
      if (!s.vis) return s.in1 === 0 && s.out1 === 0 && s.in2 === 0 && s.out2 === 0;
      return (s.in1 === 1 && s.out1 === 1 && s.in2 === 0 && s.out2 === 0) ||
        (s.in2 === 1 && s.out2 === 1 && s.in1 === 0 && s.out1 === 0);
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

// The two diagonals of a 2x2 block cross each other.
const noCrossKey = Pair.fnToKey((x, y) => x === UNUSED || y === UNUSED, NV);
const stepIndex = new Map(steps.map(s => [s.a + '|' + s.b, s.id]));
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

// --- Distance to the next box ---------------------------------------------
// VE counts forwards along a walk. Reading a step and then its two cells'
// entries: the cell being left holds DIST_ONE when the step already leaves the
// box, and otherwise one more than the cell being entered. NO_EXIT starts at a
// walk's last cell and propagates back through the rest of that final box; it is
// also what a cell no rat visits holds. Every entry is fixed by the one ahead of
// it, so the layer carries no free choice.
const exitNFA = sameBox => cached('exit|' + sameBox, () => NFA.encodeSpec({
  startState: { k: 0 },
  transition: (s, value) => {
    if (s.k === 0) return { k: 1, dir: value };
    if (s.k === 1) return { k: 2, dir: s.dir, a: value };
    if (s.k !== 2) return undefined;
    if (s.dir === UNUSED) return { done: true };
    const forward = s.dir === A_FWD || s.dir === B_FWD;
    const [from, to] = forward ? [s.a, value] : [value, s.a];
    if (!sameBox) return from === DIST_ONE ? { done: true } : undefined;
    if (to === NO_EXIT) return from === NO_EXIT ? { done: true } : undefined;
    return (from === to + 1 && from <= MAX_EXIT) ? { done: true } : undefined;
  },
  accept: s => s.done === true,
}, NV));
const idleExitKey = Pair.fnToKey(
  (counter, dist) => counter !== OFF || dist === NO_EXIT, NV);
const exitLayer = [
  ...steps.map(s => new NFA(exitNFA(boxOf(s.a) === boxOf(s.b)), 'box-exit',
    s.id, exit.at(s.a), exit.at(s.b))),
  ...gridCells.map(cell => new Pair(idleExitKey, 'idle-box-exit',
    posA.at(cell), exit.at(cell))),
  // A cupcake is a walk's last cell, so nothing follows it.
  ...CUPCAKES.map(cell => new Given(exit.at(cell), NO_EXIT)),
];

// --- Buttons --------------------------------------------------------------
// Reads which marker is Finkz, then every step the button cell is an end of,
// and requires one of them to be taken by the rat that owns the button's
// colour. With the walk-cell machine above, one incident step of a rat means the
// cell is on that rat's walk, so this is both "must be visited" and "by this
// rat".
const buttonNFA = (incident, skyblue) => cached(
  'button|' + skyblue + '|' + incident.length, () => NFA.encodeSpec({
    startState: { k: 0 },
    transition: (s, value) => {
      if (s.k === 0) {
        const rat1 = (value === RAT_1_IS_FINKZ) === skyblue;
        return {
          k: 1, n: 0, seen: false,
          want: rat1 ? [A_FWD, A_BWD] : [B_FWD, B_BWD],
        };
      }
      if (s.n >= incident.length) return undefined;
      return {
        k: 1, n: s.n + 1, want: s.want,
        seen: s.seen || s.want.includes(value),
      };
    },
    accept: s => s.n === incident.length && s.seen,
  }, NV));
const buttonOwners = [[SKYBLUE_BUTTONS, true], [PLUM_BUTTONS, false]]
  .flatMap(([cells, skyblue]) => cells.map(cell => {
    const incident = stepsAt.get(cell);
    return new NFA(buttonNFA(incident, skyblue), 'button-owner',
      FINKZ_IS, ...incident.map(s => s.id));
  }));
// The button's own digit is its distance to the next box, which VE holds offset
// by one. This also forbids NO_EXIT there: a button's rat always leaves the box.
const buttonDigitKey = Pair.fnToKey((digit, dist) => dist === digit + 1, NV);
const buttonDigits = [...SKYBLUE_BUTTONS, ...PLUM_BUTTONS].map(
  cell => new Pair(buttonDigitKey, 'button-digit', cell, exit.at(cell)));

// --- Test constraint ------------------------------------------------------
// Reads the step, then the two digits it joins; an unused step says nothing.
const testNFA = cached('test', () => NFA.encodeSpec({
  startState: { k: 0 },
  transition: (s, value) => {
    if (s.k === 0) return { k: 1, used: value !== UNUSED };
    if (s.k === 1) return { k: 2, used: s.used, a: value };
    if (s.k !== 2) return undefined;
    if (!s.used) return { done: true };
    return Math.abs(s.a - value) !== 1 ? { done: true } : undefined;
  },
  accept: s => s.done === true,
}, NV));
const testConstraint = steps.map(
  s => new NFA(testNFA, 'test-constraint', s.id, s.a, s.b));

// --- Fruit ----------------------------------------------------------------
const blackcurrants = BLACKCURRANTS.map(([x, y]) => new BlackDot(x, y));
const grapes = GRAPES.map(([x, y]) => new Whisper(5, x, y));
const starfruit = new EqualSum(...STARFRUIT.map(pair => [...pair]));

// --- Variables and domains ------------------------------------------------
const range = (lo, hi) => Array.from({ length: hi - lo + 1 }, (_, n) => lo + n);
const layers = [
  posA.toVar('walk position mod ' + MOD_A),
  posB.toVar('walk position mod ' + MOD_B),
  exit.toVar('cells to the walk next 3x3 box'),
  new Var('S', 'walk steps', steps.length),
  new Var('W', 'which rat marker is Finkz', 1),
];
const domains = [
  graph.makeReplicate(new Given(gridCells[0], ...range(1, 9))),
  // VA needs no domain of its own: the OFF sentinel plus MOD_A residues is
  // exactly the widened alphabet.
  posB.makeReplicate(new Given(posB.at(gridCells[0]), ...range(1, MOD_B + 1))),
  exit.makeReplicate(new Given(exit.at(gridCells[0]), ...range(1, MAX_EXIT))),
  new Given(FINKZ_IS, RAT_1_IS_FINKZ, RAT_2_IS_FINKZ),
  // The step Vars need no domain of their own: the walk-cell machines accept no
  // value on them but unused / in / out, for either rat.
  // Each rat's own cell is the first cell of its walk; without this the whole
  // numbering of a walk could rotate freely through the residues.
  ...[RAT_1, RAT_2].flatMap(cell => [
    new Given(posA.at(cell), FIRST), new Given(posB.at(cell), FIRST)]),
];

return [
  shape,
  ...layers,
  ...domains,
  ...walkShape,
  ...counters,
  ...noCross,
  ...exitLayer,
  ...buttonOwners,
  ...buttonDigits,
  ...testConstraint,
  ...blackcurrants,
  ...grapes,
  starfruit,
];
