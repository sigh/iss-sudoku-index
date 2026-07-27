// Title: RAT RUN 23: Notable Differences
// Author: Marty Sears
// Video: https://www.youtube.com/watch?v=8GJGYDqViy4
// Source: https://sudokupad.app/3pev731294

// Normal sudoku. Two rats stand on R3C4 and R3C6 and each walks to the cupcake
// cell R9C5. A path visits no cell twice, the two paths share no cell but the
// cupcake, neither path crosses itself or the other, and no step passes through
// a thick maze wall. A step is orthogonal, or diagonal when the 2x2 block it
// cuts across is free of walls and carries no round wall-spot on its corner.
// Two digits joined by a blackcurrant have one double the other; joined by a
// redcurrant, one is odd and one even; joined by a grape, they differ by at
// least 5. Finally both rats visit the same number of cells, and up to but not
// including the cupcake the two rats' Nth digits always differ by the same
// amount, which is the digit on the cupcake cell.
//
// Nothing is omitted.

// The alphabet is widened to 16 so the Var layers can carry path state and the
// two position counters; the 81 grid cells are pinned back to 1-9 below.
const NV = 16;

const MOD_A = 15, MOD_B = 11;   // coprime: a spurious cycle would need 165 cells
const OFF = 1;                  // counter value for a cell no rat visits
const FIRST = 2;                // counter value of the cupcake cell
// Step values. A step is stored once, on the (a, b) pair below; FWD means the
// rat walked a->b, BWD means b->a, so the counters can tell direction.
const UNUSED = 1;
const A_FWD = 2, A_BWD = 3, B_FWD = 4, B_BWD = 5;
// Both paths together cover at most 81 cells and share only the cupcake, so
// each is at most (81 + 1) / 2 = 41 cells and starts at most 40 steps back
// from the cupcake.
const MAX_POS = 40;
const NONE = 10;                // sequence entry for a position past the start

const RAT_CELLS = ['R3C4', 'R3C6'];   // the two rat emoji
const CUPCAKE = 'R9C5';               // both cupcake emoji

// --- The drawn maze -------------------------------------------------------
// Corner (i, j) is the top-left corner of cell RiCj, so the lattice runs 1..10.
// WALLS holds the sixteen thick gold polylines exactly as drawn plus the closed
// boundary; SPOTS holds the 40 round gold wall-spots, each on a lattice corner.
const WALLS = [
  [[9, 8], [9, 3]],
  [[9, 9], [8, 9], [8, 8]],
  [[9, 2], [8, 2], [8, 4]],
  [[2, 5], [4, 5], [4, 4], [2, 4], [2, 2]],
  [[2, 6], [4, 6], [4, 7], [2, 7], [2, 9]],
  [[3, 2], [3, 3]],
  [[3, 8], [3, 9]],
  [[5, 5], [6, 5]],
  [[5, 6], [6, 6]],
  [[7, 8], [7, 9]],
  [[6, 9], [4, 9]],
  [[5, 7], [5, 8]],
  [[7, 2], [7, 3]],
  [[6, 2], [4, 2]],
  [[7, 4], [7, 5]],
  [[8, 5], [8, 6]],
  [[1, 1], [1, 10], [10, 10], [10, 1], [1, 1]],
];
const SPOTS = [
  [2, 2], [2, 4], [2, 5], [2, 6], [2, 7], [2, 9], [3, 2], [3, 3], [3, 8],
  [3, 9], [4, 2], [4, 4], [4, 5], [4, 6], [4, 7], [4, 9], [5, 5], [5, 6],
  [5, 7], [5, 8], [6, 2], [6, 5], [6, 6], [6, 9], [7, 2], [7, 3], [7, 4],
  [7, 5], [7, 8], [7, 9], [8, 2], [8, 4], [8, 5], [8, 6], [8, 8], [8, 9],
  [9, 2], [9, 3], [9, 8], [9, 9],
];
// The drawn fruit, each on the edge between the two cells it joins: seven black
// dots, four red dots and four green dots, named after their colours in the
// rules.
const BLACKCURRANTS = [
  ['R1C1', 'R2C1'], ['R5C9', 'R6C9'], ['R7C9', 'R8C9'], ['R8C1', 'R9C1'],
  ['R8C3', 'R8C4'], ['R8C7', 'R8C8'], ['R9C5', 'R9C6'],
];
const REDCURRANTS = [
  ['R1C9', 'R2C9'], ['R6C6', 'R6C7'], ['R7C3', 'R7C4'], ['R9C4', 'R9C5'],
];
const GRAPES = [
  ['R1C4', 'R1C5'], ['R2C7', 'R3C7'], ['R6C9', 'R7C9'], ['R7C2', 'R7C3'],
];

const shape = new Shape('9x9', NV);
const graph = cellGraph(shape);
const gridCells = graph.cells();
const posA = graph.makeOverlay('VA');     // signed path position mod 15
const posB = graph.makeOverlay('VB');     // signed path position mod 11
const seqA = n => 'VF' + n;               // rat 1's digit n steps before the end
const seqB = n => 'VG' + n;               // rat 2's digit n steps before the end

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

// A diagonal step passes through the one corner its two cells share. The "2x2
// space" it needs is the four cells around that corner with nothing drawn
// between them, so all four wall slots meeting there must be free; the round
// wall-spot is a second, separately drawn veto on the same corner.
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
// One Var per legal king move; moves the maze forbids get no variable at all.
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

// --- Path shape -----------------------------------------------------------
// Per-cell machine: reads the cell's two counters, then every step it is an end
// of. A cell no rat visits takes the OFF counter and uses no step; a visited
// cell is entered once and left once by the same rat. The rats' own cells are
// only left, the cupcake is only entered, once by each rat.
const ROLE_OF = new Map([[RAT_CELLS[0], 'rat1'], [RAT_CELLS[1], 'rat2'],
[CUPCAKE, 'cupcake']]);
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
      if (next.in1 > 1 || next.out1 > 1 || next.in2 > 1 || next.out2 > 1) return undefined;
      return next;
    },
    accept: s => {
      if (s.k !== 2 + incident.length) return false;
      if (role === 'rat1') return s.vis && s.out1 === 1 && s.in1 === 0 && s.in2 === 0 && s.out2 === 0;
      if (role === 'rat2') return s.vis && s.out2 === 1 && s.in2 === 0 && s.in1 === 0 && s.out1 === 0;
      if (role === 'cupcake') return s.vis && s.in1 === 1 && s.in2 === 1 && s.out1 === 0 && s.out2 === 0;
      if (!s.vis) return s.in1 === 0 && s.out1 === 0 && s.in2 === 0 && s.out2 === 0;
      // A visited cell belongs to exactly one rat, which is what keeps the two
      // paths apart and makes any stray cycle of steps single-rat.
      return (s.in1 === 1 && s.out1 === 1 && s.in2 === 0 && s.out2 === 0) ||
        (s.in2 === 1 && s.out2 === 1 && s.in1 === 0 && s.out1 === 0);
    },
  }, NV));
}
const pathShape = gridCells.map(cell => {
  const incident = stepsAt.get(cell);
  const role = ROLE_OF.get(cell) || 'plain';
  return new NFA(cellNFA(incident, role), 'path-cell',
    posA.at(cell), posB.at(cell), ...incident.map(s => s.id));
});

// Position counters. Both layers hold a cell's distance from the cupcake, which
// is pinned to 0; rat 1 counts that distance up and rat 2 counts it down, so
// the residue pair also says which rat stands on the cell (rat 1 at distance k
// has residues +k, rat 2 has -k, and +k = -n mod 165 would need k + n = 165,
// out of reach for two paths of at most 41 cells). What the second modulus buys
// is that a closed cycle of steps beside a path would need a length divisible
// by 15 and by 11, i.e. by 165, and there are only 81 cells; degree alone
// cannot rule such a cycle out.
const nextPos = (v, mod) => FIRST + ((v - FIRST + 1) % mod);
const counterNFA = mod => cached('counter|' + mod, () => NFA.encodeSpec({
  startState: { k: 0 },
  transition: (s, value) => {
    if (s.k === 0) return { k: 1, dir: value };
    if (s.k === 1) return { k: 2, dir: s.dir, a: value };
    if (s.k !== 2) return undefined;
    if (s.dir === UNUSED) return { done: true };
    if (s.a === OFF || value === OFF) return undefined;
    // A rat walks towards the cupcake, so the cell it leaves is one further
    // from the cupcake than the cell it enters -- one higher for rat 1, one
    // lower for rat 2.
    const [from, to] = (s.dir === A_FWD || s.dir === B_FWD) ? [s.a, value] : [value, s.a];
    if (s.dir === A_FWD || s.dir === A_BWD) return from === nextPos(to, mod) ? { done: true } : undefined;
    return to === nextPos(from, mod) ? { done: true } : undefined;
  },
  accept: s => s.done === true,
}, NV));
const counters = steps.flatMap(s => [
  new NFA(counterNFA(MOD_A), 'path-order', s.id, posA.at(s.a), posA.at(s.b)),
  new NFA(counterNFA(MOD_B), 'path-order', s.id, posB.at(s.a), posB.at(s.b)),
]);

// The two diagonals of a 2x2 block cross each other, and no path may cross
// itself or the other path.
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

// --- The two read-out sequences -------------------------------------------
// VF<n> and VG<n> hold the digit each rat stands on n steps before the cupcake,
// or NONE when n is past that rat's own cell. A cell whose residue pair names
// position n on a rat's path must carry that rat's entry.
const residues = (n, sign) => [
  FIRST + ((((sign * n) % MOD_A) + MOD_A) % MOD_A),
  FIRST + ((((sign * n) % MOD_B) + MOD_B) % MOD_B),
];
const seqNFA = n => cached('seq|' + n, () => {
  const [oneA, oneB] = residues(n, 1);      // rat 1's position n
  const [twoA, twoB] = residues(n, -1);     // rat 2's position n
  return NFA.encodeSpec({
    startState: { k: 0 },
    transition: (s, value) => {
      if (s.k === 0) return { k: 1, one: value === oneA, two: value === twoA };
      if (s.k === 1) {
        return { k: 2, one: s.one && value === oneB, two: s.two && value === twoB };
      }
      if (s.k === 2) return { k: 3, one: s.one, two: s.two, d: value };
      if (s.k === 3) {
        if (s.one && value !== s.d) return undefined;
        return { k: 4, two: s.two, d: s.d };
      }
      if (s.k !== 4) return undefined;
      if (s.two && value !== s.d) return undefined;
      return { done: true };
    },
    accept: s => s.done === true,
  }, NV);
});
const sequence = [];
for (let n = 1; n <= MAX_POS; n++) {
  for (const cell of gridCells) {
    sequence.push(new NFA(seqNFA(n), 'digit-at-position',
      posA.at(cell), posB.at(cell), cell, seqA(n), seqB(n)));
  }
}

// Rat 1's own cell is the far end of its path, so its residue pair gives the
// common length: a position beyond it is NONE in both sequences, and a position
// at or before it is a real pair of digits differing by the cupcake digit.
// "The Nth digit visited" counts the rat's own cell as the first, since that
// cell lies on the path the rules forbid revisiting; the worked example in the
// rules ("5 and 9 ... would contain a 4") reads the difference unsigned.
const positionFromResidues = (rA, rB) => {
  for (let n = 0; n <= MAX_POS; n++) {
    const [a, b] = residues(n, 1);
    if (a === rA && b === rB) return n;
  }
  return null;
};
const tailNFA = n => cached('tail|' + n, () => NFA.encodeSpec({
  startState: { k: 0 },
  transition: (s, value) => {
    if (s.k === 0) return { k: 1, rA: value };
    if (s.k === 1) {
      // A rat cannot stand further than MAX_POS from the cupcake, so its
      // residue pair reads back as one position and nothing else.
      const len = positionFromResidues(s.rA, value);
      if (len === null) return undefined;
      return { k: 2, used: n <= len };
    }
    if (s.k === 2) {
      if (!s.used) return value === NONE ? { k: 3, used: false } : undefined;
      return value === NONE ? undefined : { k: 3, used: true, f: value };
    }
    if (s.k === 3) {
      if (!s.used) return value === NONE ? { k: 4, used: false } : undefined;
      return value === NONE ? undefined : { k: 4, used: true, diff: Math.abs(s.f - value) };
    }
    if (s.k !== 4) return undefined;
    return (!s.used || s.diff === value) ? { done: true } : undefined;
  },
  accept: s => s.done === true,
}, NV));
const tail = [];
for (let n = 1; n <= MAX_POS; n++) {
  tail.push(new NFA(tailNFA(n), 'sequence-length',
    posA.at(RAT_CELLS[0]), posB.at(RAT_CELLS[0]), seqA(n), seqB(n), CUPCAKE));
}
// Both rats visit the same number of cells: rat 2 counts down where rat 1
// counts up, so its own cell carries the negated residue of rat 1's.
const mirrorKey = mod => cached('mirror|' + mod, () => Pair.fnToKey(
  (x, y) => x > OFF && y > OFF && x <= FIRST + mod - 1 && y <= FIRST + mod - 1 &&
    (x - FIRST + y - FIRST) % mod === 0, NV));
const sameLength = [
  new Pair(mirrorKey(MOD_A), 'same-length',
    posA.at(RAT_CELLS[0]), posA.at(RAT_CELLS[1])),
  new Pair(mirrorKey(MOD_B), 'same-length',
    posB.at(RAT_CELLS[0]), posB.at(RAT_CELLS[1])),
];

// --- Variables and domains ------------------------------------------------
const range = (lo, hi) => Array.from({ length: hi - lo + 1 }, (_, n) => lo + n);
const layers = [
  posA.toVar('distance from the cupcake, mod ' + MOD_A),
  posB.toVar('distance from the cupcake, mod ' + MOD_B),
  new Var('S', 'path steps', steps.length),
  new Var('F', 'rat 1 digit by position', MAX_POS),
  new Var('G', 'rat 2 digit by position', MAX_POS),
];
const domains = [
  graph.makeReplicate(new Given(gridCells[0], ...range(1, 9))),
  // VA needs no domain of its own: the sentinel plus MOD_A residues is exactly
  // the 16-value alphabet.
  posB.makeReplicate(new Given(posB.at(gridCells[0]), ...range(1, MOD_B + 1))),
  // The step Vars need no domain of their own: the path-cell machines accept
  // no value on them but unused / in / out, for either rat.
  ...range(1, MAX_POS).flatMap(n => [
    new Given(seqA(n), ...range(1, 9), NONE),
    new Given(seqB(n), ...range(1, 9), NONE)]),
  new Given(posA.at(CUPCAKE), FIRST),
  new Given(posB.at(CUPCAKE), FIRST),
];

return [
  shape,
  ...layers,
  ...domains,
  ...BLACKCURRANTS.map(([x, y]) => new BlackDot(x, y)),
  // One odd and one even is a complete residue system mod 2.
  ...REDCURRANTS.map(([x, y]) => new Modular(2, x, y)),
  ...GRAPES.map(([x, y]) => new Whisper(5, x, y)),
  ...pathShape,
  ...counters,
  ...noCross,
  ...sequence,
  ...tail,
  ...sameLength,
];
