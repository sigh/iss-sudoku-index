// Title: RAT RUN 31: Equivalence
// Author: Marty Sears and Justin Vitanza
// Video: https://www.youtube.com/watch?v=Qa9r_bEjVfk
// Source: https://sudokupad.app/37wqeifgzs

// Normal sudoku. Two rats stand on R2C4 and R8C5 and each walks through the maze
// to a cupcake; the two reach different cupcakes, of R7C6 and R3C9. A walk visits
// no cell twice, the two walks share no cell, neither walk crosses itself or the
// other, and no step passes through a thick maze wall. A step is orthogonal, or
// diagonal when the 2x2 block it cuts across is free of walls and carries no
// round wall-spot on the corner the two cells share.
// A rat that walks into a yellow teleport comes out of the other yellow teleport
// and carries on from there; the two teleports hold the same digit.
// Two digits joined by a blackcurrant have one double the other; two joined by a
// redcurrant have opposite parity.
// The digit on a pink motion sensor counts the cells either rat visits among the
// up-to-9 cells of the 3x3 block centred on the sensor, the sensor included.
// In every row and in every column, the digits one rat visits sum to the same
// total as the digits the other rat visits. That total is left to be worked out
// separately for each row and each column ("This sum must be determined for each
// row and column"), so no total is shared between houses.
//
// Nothing is omitted. The rats are named Finkz and Phinx, but every rule naming
// them is symmetric in the two, so the encoding does not decide which is which.

// The alphabet is widened so the Var layers can carry the position counters and
// the visited-digit values; the 81 grid cells are pinned back to 1-9 below.
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

const RAT_A = 'R2C4', RAT_B = 'R8C5';     // the two rat emoji
const CUPCAKES = ['R7C6', 'R3C9'];        // the two cupcake emoji
const TELEPORTS = ['R3C5', 'R9C1'];       // the two yellow 'A' discs

// --- The drawn maze -------------------------------------------------------
// Corner (i, j) is the top-left corner of cell RiCj, so the lattice runs 1..10.
// WALLS holds the eighteen thick green polylines exactly as drawn, including the
// boundary loop; SPOTS holds the 39 round green wall-spots, each on a corner.
const WALLS = [
  [[2, 2], [2, 4]],
  [[2, 6], [2, 9]],
  [[2, 5], [4, 5]],
  [[3, 2], [3, 3]],
  [[3, 4], [5, 4]],
  [[4, 2], [4, 3], [5, 3]],
  [[6, 2], [6, 5], [8, 5]],
  [[7, 5], [7, 9]],
  [[4, 6], [5, 6]],
  [[5, 7], [5, 8]],
  [[5, 9], [5, 10], [10, 10], [10, 1], [7, 1], [7, 2]],
  [[5, 10], [1, 10], [1, 1], [7, 1]],
  [[10, 3], [9, 3]],
  [[4, 7], [3, 7], [3, 9]],
  [[4, 8], [4, 9]],
  [[9, 5], [9, 4], [8, 4], [8, 3], [7, 3]],
  [[8, 6], [9, 6], [9, 7]],
  [[8, 8], [8, 9]],
];
const SPOTS = [
  [2, 2], [2, 4], [2, 5], [2, 6], [2, 9], [3, 2], [3, 3], [3, 4], [3, 7],
  [3, 9], [4, 2], [4, 3], [4, 5], [4, 6], [4, 7], [4, 8], [4, 9], [5, 3],
  [5, 4], [5, 6], [5, 7], [5, 8], [5, 9], [6, 2], [6, 5], [7, 2], [7, 3],
  [7, 9], [8, 3], [8, 4], [8, 5], [8, 6], [8, 8], [8, 9], [9, 3], [9, 4],
  [9, 5], [9, 6], [9, 7],
];
// The drawn fruit, each named by the two cells its edge separates.
const BLACKCURRANTS = [
  ['R3C2', 'R3C3'], ['R4C7', 'R4C8'], ['R4C8', 'R5C8'],
  ['R7C3', 'R7C4'], ['R7C8', 'R7C9'], ['R6C1', 'R6C2'],
];
const REDCURRANTS = [['R3C7', 'R4C7'], ['R6C2', 'R7C2'], ['R6C6', 'R6C7']];
// The drawn pink motion sensors.
const SENSORS = ['R3C3', 'R3C7', 'R5C8', 'R5C9', 'R6C5', 'R6C9', 'R7C1',
  'R7C4', 'R8C9'];

const shape = new Shape('9x9', NV);
const graph = cellGraph(shape);
const gridCells = graph.cells();
const posA = graph.makeOverlay('VA');     // walk position mod MOD_A
const posB = graph.makeOverlay('VB');     // walk position mod MOD_B
// Which rat visits the cell: NOBODY, or one of the two rats.
const owner = graph.makeOverlay('VO');
const NOBODY = 1, OWNER_A = 2, OWNER_B = 3;
// Each rat's contribution to its row and column totals: 1 on a cell that rat
// does not visit, digit + 1 on one it does.
const valA = graph.makeOverlay('VF');
const valB = graph.makeOverlay('VP');

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

// A diagonal step passes through the one corner its two cells share. The 2x2
// space it needs is free exactly when none of the four wall slots meeting at
// that corner holds a wall, and it may not pass through a wall-spot. Every drawn
// spot sits on a corner a wall already reaches, so the two clauses agree.
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
// One Var per legal move, recording whether a walk uses it and in which
// direction; a move the maze forbids gets no variable at all, which is how the
// walls are enforced.
const STEP_DIRS = [[0, 1], [1, 0], [1, 1], [1, -1]];
const steps = [];
const stepsAt = new Map(gridCells.map(cell => [cell, []]));
const addStep = (cell, other, teleport) => {
  const id = 'VS' + (steps.length + 1);
  steps.push({ id, a: cell, b: other });
  stepsAt.get(cell).push(
    { id, teleport, out: A_FWD, in: A_BWD, out2: B_FWD, in2: B_BWD });
  stepsAt.get(other).push(
    { id, teleport, out: A_BWD, in: A_FWD, out2: B_BWD, in2: B_FWD });
};
for (const cell of gridCells) {
  for (const [dRow, dCol] of STEP_DIRS) {
    const other = graph.step(cell, dRow, dCol);
    if (!other || !stepAllowed(cell, dRow, dCol)) continue;
    addStep(cell, other, false);
  }
}
// The teleport link is one more move between the two teleport cells; what makes
// it a teleport rather than a shortcut is the rule the per-cell machine below
// adds for those two cells -- a visited teleport cell must use this link, so a
// rat that walks in has no way out but the link, and one that arrives on the
// link has no way on but a walk.
addStep(TELEPORTS[0], TELEPORTS[1], true);

const memo = new Map();
const cached = (key, build) => {
  if (!memo.has(key)) memo.set(key, build());
  return memo.get(key);
};

// --- Walk shape -----------------------------------------------------------
// Per-cell machine: reads the cell's two counters, then every step it is an end
// of, then the cell's owner. A cell no rat visits takes the OFF counter in both
// layers, uses no step and is owned by NOBODY; any other cell is entered once
// and left once by one and the same rat, its owner. A rat's own cell is only
// left, a cupcake only entered.
const ROLE_OF = new Map([[RAT_A, 'ratA'], [RAT_B, 'ratB'],
...CUPCAKES.map(cell => [cell, 'cupcake']),
...TELEPORTS.map(cell => [cell, 'teleport'])]);
function cellNFA(incident, role) {
  // The step values a cell sees depend on whether it is the step's a or b end,
  // so the machine is keyed on that pattern, not just on the step count.
  const sig = 'cell|' + role + '|' +
    incident.map(s => s.out + (s.teleport ? 't' : '')).join(',');
  const last = 2 + incident.length;
  // The owner value the degrees just read imply, or undefined when they do not
  // fit the cell's role.
  const ownerOf = s => {
    if (!s.vis) {
      if (role !== 'plain' && role !== 'teleport') return undefined;
      if (s.in1 || s.out1 || s.in2 || s.out2 || s.tp) return undefined;
      return NOBODY;
    }
    if (role === 'teleport' && s.tp !== 1) return undefined;
    if (role === 'ratA') {
      return (s.out1 === 1 && s.in1 === 0 && s.in2 === 0 && s.out2 === 0)
        ? OWNER_A : undefined;
    }
    if (role === 'ratB') {
      return (s.out2 === 1 && s.in2 === 0 && s.in1 === 0 && s.out1 === 0)
        ? OWNER_B : undefined;
    }
    if (role === 'cupcake') {
      if (s.out1 !== 0 || s.out2 !== 0 || s.in1 + s.in2 !== 1) return undefined;
      return s.in1 === 1 ? OWNER_A : OWNER_B;
    }
    if (s.in1 === 1 && s.out1 === 1 && s.in2 === 0 && s.out2 === 0) {
      return OWNER_A;
    }
    if (s.in2 === 1 && s.out2 === 1 && s.in1 === 0 && s.out1 === 0) {
      return OWNER_B;
    }
    return undefined;
  };
  return cached(sig, () => NFA.encodeSpec({
    startState: { k: 0 },
    transition: (s, value) => {
      if (s.k === 0) return { k: 1, vis: value !== OFF };
      if (s.k === 1) {
        if ((value !== OFF) !== s.vis) return undefined;
        return { k: 2, vis: s.vis, in1: 0, out1: 0, in2: 0, out2: 0, tp: 0 };
      }
      if (s.k < last) {
        const step = incident[s.k - 2];
        const next = {
          k: s.k + 1, vis: s.vis,
          in1: s.in1, out1: s.out1, in2: s.in2, out2: s.out2, tp: s.tp,
        };
        if (value === step.in) next.in1++;
        else if (value === step.out) next.out1++;
        else if (value === step.in2) next.in2++;
        else if (value === step.out2) next.out2++;
        else if (value !== UNUSED) return undefined;
        if (next.in1 > 1 || next.out1 > 1 || next.in2 > 1 || next.out2 > 1) {
          return undefined;
        }
        if (step.teleport && value !== UNUSED) next.tp++;
        return next;
      }
      if (s.k !== last) return undefined;
      return value === ownerOf(s) ? { done: true } : undefined;
    },
    accept: s => s.done === true,
  }, NV));
}
// Each rat leaves its own cell once and enters nothing, so counting arrivals
// over the whole grid leaves exactly one cell per rat that is entered and never
// left; only the two cupcakes may be such a cell, and each of them takes exactly
// one arrival. That is what makes the two rats reach different cupcakes.
const walkShape = gridCells.map(cell => {
  const incident = stepsAt.get(cell);
  return new NFA(cellNFA(incident, ROLE_OF.get(cell) || 'plain'), 'walk-cell',
    posA.at(cell), posB.at(cell), ...incident.map(s => s.id), owner.at(cell));
});

// The owner's rat scores the cell's digit in its own contribution layer and the
// other rat scores nothing, which the padded 1 stands for.
const contributionNFA = cached('contribution', () => NFA.encodeSpec({
  startState: { k: 0 },
  transition: (s, value) => {
    if (s.k === 0) return { k: 1, who: value };
    if (s.k === 1) {
      return {
        k: 2,
        vA: s.who === OWNER_A ? value + 1 : 1,
        vB: s.who === OWNER_B ? value + 1 : 1,
      };
    }
    if (s.k === 2) {
      return value === s.vA ? { k: 3, vB: s.vB } : undefined;
    }
    if (s.k !== 3) return undefined;
    return value === s.vB ? { done: true } : undefined;
  },
  accept: s => s.done === true,
}, NV));
const contributions = gridCells.map(cell => new NFA(contributionNFA,
  'visited-digit', owner.at(cell), cell, valA.at(cell), valB.at(cell)));

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

// The two diagonals of a 2x2 block cross each other, and no walk may cross
// itself or the other walk.
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

// --- Motion sensors -------------------------------------------------------
// Counts the window's visited cells from their owners, and reads the sensor's
// own digit last so the running count is all the machine carries.
const sensorNFA = len => cached('sensor|' + len, () => NFA.encodeSpec({
  startState: { n: 0, cnt: 0 },
  transition: (s, value) => {
    if (s.n < len) {
      return { n: s.n + 1, cnt: s.cnt + (value !== NOBODY ? 1 : 0) };
    }
    if (s.n !== len) return undefined;
    return value === s.cnt ? { done: true } : undefined;
  },
  accept: s => s.done === true,
}, NV));
const sensors = SENSORS.map(cell => {
  const window = [];
  for (let dRow = -1; dRow <= 1; dRow++) {
    for (let dCol = -1; dCol <= 1; dCol++) {
      const other = graph.step(cell, dRow, dCol);
      if (other) window.push(other);
    }
  }
  return new NFA(sensorNFA(window.length), 'motion-sensor',
    ...owner.at(window), cell);
});

// --- The test constraint --------------------------------------------------
// One rat's visited digits in a house sum to the other's. Each contribution
// layer holds digit + 1 on the cells its rat visits and 1 elsewhere, so the two
// nine-cell segments carry the same +9 of padding and it cancels.
const testConstraint = [...graph.rows(), ...graph.columns()].map(
  house => new EqualSum(valA.at(house), valB.at(house)));

// --- Fruit and teleports --------------------------------------------------
const blackcurrants = BLACKCURRANTS.map(([x, y]) => new BlackDot(x, y));
const oppositeParityKey = Pair.fnToKey((x, y) => (x + y) % 2 === 1, NV);
const redcurrants = REDCURRANTS.map(
  ([x, y]) => new Pair(oppositeParityKey, 'redcurrant', x, y));
// Two one-cell sets holding the same values.
const teleportDigits = new SameValues(2, ...TELEPORTS);

// --- Variables and domains ------------------------------------------------
const range = (lo, hi) => Array.from({ length: hi - lo + 1 }, (_, n) => lo + n);
const layers = [
  posA.toVar('walk position mod ' + MOD_A),
  posB.toVar('walk position mod ' + MOD_B),
  owner.toVar('which rat visits the cell'),
  valA.toVar('digits the first rat visits'),
  valB.toVar('digits the second rat visits'),
  new Var('S', 'walk steps', steps.length),
];
const domains = [
  graph.makeReplicate(new Given(gridCells[0], ...range(1, 9))),
  // VA needs no domain of its own: the OFF sentinel plus MOD_A residues is
  // exactly the widened alphabet.
  posB.makeReplicate(new Given(posB.at(gridCells[0]), ...range(1, MOD_B + 1))),
  owner.makeReplicate(new Given(owner.at(gridCells[0]), ...range(1, 3))),
  valA.makeReplicate(new Given(valA.at(gridCells[0]), ...range(1, 10))),
  valB.makeReplicate(new Given(valB.at(gridCells[0]), ...range(1, 10))),
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
  ...contributions,
  ...counters,
  ...noCross,
  ...sensors,
  ...testConstraint,
  ...blackcurrants,
  ...redcurrants,
  teleportDigits,
];
