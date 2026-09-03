// Title: RAT RUN 3: Double Dutch
// Author: Marty Sears
// Video: https://www.youtube.com/watch?v=7bqcxHY6cSw
// Source: https://sudokupad.app/5b1du6ra7d

// Normal sudoku. Finkz the rat stands on R1C8 and walks to the cupcake on R8C7
// along a path through cell centres. The path visits no cell twice, never
// crosses itself, and never passes through a thick maze wall. A step is
// orthogonal, or diagonal when there is a 2x2 space to move through and the
// step does not pass through the rounded end or corner of a wall. Two cells
// joined by a blackcurrant have a 1:2 ratio; not every possible blackcurrant is
// drawn, so an undrawn edge says nothing. Adjacent digits along the path differ
// by at least 4 (a Dutch Whisper line).
//
// Nothing is omitted.

// The alphabet is widened to 16 so the Var layers can carry the path state and
// the position counters; the 81 grid cells are pinned back to 1-9 below.
const NV = 16;

// Position counters. A closed loop of steps beside the path would need a length
// divisible by both moduli, i.e. by 165, and the grid holds only 81 cells.
const MOD_A = 15, MOD_B = 11;
const OFF = 1;                     // counter value for a cell the path misses
const FIRST = 2;                   // counter value of the rat's own cell
// Step values. A step is stored once, on the (a, b) pair built below; FWD means
// the rat walked a->b and BWD b->a, so the counters can tell direction.
const UNUSED = 1, FWD = 2, BWD = 3;

const RAT = 'R1C8';                // the rat emoji
const CUPCAKE = 'R8C7';            // the cupcake emoji

// --- The drawn maze -------------------------------------------------------
// Corner (i, j) is the top-left corner of cell RiCj, so the lattice runs 1..10.
// WALLS are the nineteen thick orange polylines exactly as drawn, including the
// four that trace the grid border. SPOTS are the forty round orange discs, each
// sitting on a lattice corner where a wall ends or turns.
const WALLS = [
  [[2, 2], [2, 9]],
  [[3, 4], [3, 5]],
  [[4, 5], [4, 3], [3, 3], [3, 2]],
  [[4, 2], [4, 1], [10, 1], [10, 10], [3, 10], [3, 6], [4, 6]],
  [[4, 1], [1, 1], [1, 10], [3, 10]],
  [[10, 3], [9, 3]],
  [[9, 2], [8, 2], [8, 3]],
  [[8, 2], [5, 2], [5, 6]],
  [[5, 4], [6, 4]],
  [[8, 7], [8, 5], [9, 5], [9, 4]],
  [[8, 6], [7, 6]],
  [[5, 7], [4, 7], [4, 9], [5, 9]],
  [[9, 9], [6, 9]],
  [[7, 9], [7, 7], [6, 7]],
  [[5, 8], [6, 8]],
  [[6, 5], [6, 6]],
  [[7, 4], [7, 5]],
  [[6, 3], [7, 3]],
  [[9, 7], [9, 8]],
];
const SPOTS = [
  [2, 2], [2, 9], [3, 2], [3, 3], [3, 4], [3, 5], [3, 6], [4, 2], [4, 3],
  [4, 5], [4, 6], [4, 7], [4, 9], [5, 2], [5, 6], [5, 7], [5, 8], [5, 9],
  [6, 3], [6, 4], [6, 5], [6, 6], [6, 7], [6, 8], [6, 9], [7, 3], [7, 4],
  [7, 5], [7, 6], [7, 7], [8, 3], [8, 5], [8, 7], [9, 2], [9, 3], [9, 4],
  [9, 5], [9, 7], [9, 8], [9, 9],
];
// The drawn blackcurrants, each on the edge between the two cells it joins.
const BLACKCURRANTS = [
  ['R1C3', 'R1C4'], ['R1C9', 'R2C9'], ['R2C3', 'R3C3'], ['R2C5', 'R3C5'],
  ['R3C2', 'R4C2'], ['R4C5', 'R4C6'], ['R5C5', 'R5C6'], ['R6C1', 'R7C1'],
  ['R7C7', 'R7C8'], ['R8C2', 'R9C2'], ['R8C9', 'R9C9'],
];

const shape = new Shape('9x9', NV);
const graph = cellGraph(shape);
const gridCells = graph.cells();
const posA = graph.makeOverlay('VA');   // position mod 15
const posB = graph.makeOverlay('VB');   // position mod 11

// Split the polylines into unit lattice segments: 'H|i|j' runs from corner
// (i, j) to (i, j+1) and separates R(i-1)Cj from RiCj; 'V|i|j' runs from (i, j)
// to (i+1, j) and separates RiC(j-1) from RiCj.
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

// A diagonal step passes through the single corner its two cells share. The
// "2x2 space" it needs is the 2x2 block of cells around that corner, whose only
// internal walls are the four lattice segments meeting there; and the corner
// must carry no round wall end. On this maze the two clauses agree everywhere:
// every corner carrying a spot also has a wall segment reaching it, so the spot
// test rejects nothing the segment test does not, and 61 of the 64 interior
// corners are closed. The three open ones - (8, 4), (8, 8) and (9, 6) - give the
// six diagonal steps around the cupcake.
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
// One Var per legal move; a move the maze forbids gets no variable at all, so
// the wall rules live in the graph rather than in a constraint.
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
// Per-cell machine: reads the cell's two counters, then every step it is an end
// of. A cell the path misses takes the OFF counter in both layers and uses none
// of its steps; a visited cell is entered once and left once. The rat's cell is
// only left and the cupcake only entered, which is what makes the path run from
// the one to the other.
function cellNFA(incident, role) {
  // Which step value means "leaving" depends on whether this cell is the step's
  // a or b end, so the machine is keyed on that pattern, not the step count.
  const sig = 'cell|' + role + '|' + incident.map(s => s.out).join(',');
  return cached(sig, () => NFA.encodeSpec({
    startState: { k: 0 },
    transition: (s, value) => {
      if (s.k === 0) return { k: 1, vis: value !== OFF };
      if (s.k === 1) {
        if ((value !== OFF) !== s.vis) return undefined;
        return { k: 2, vis: s.vis, into: 0, outOf: 0 };
      }
      const n = s.k - 2;
      if (n >= incident.length) return undefined;
      const step = incident[n];
      const next = { k: s.k + 1, vis: s.vis, into: s.into, outOf: s.outOf };
      if (value === step.in) next.into++;
      else if (value === step.out) next.outOf++;
      else if (value !== UNUSED) return undefined;
      if (next.into > 1 || next.outOf > 1) return undefined;
      return next;
    },
    accept: s => {
      if (s.k !== 2 + incident.length) return false;
      if (role === 'rat') return s.vis && s.outOf === 1 && s.into === 0;
      if (role === 'cupcake') return s.vis && s.into === 1 && s.outOf === 0;
      if (!s.vis) return s.into === 0 && s.outOf === 0;
      return s.into === 1 && s.outOf === 1;
    },
  }, NV));
}
const ROLE_OF = new Map([[RAT, 'rat'], [CUPCAKE, 'cupcake']]);
const pathShape = gridCells.map(cell => {
  const incident = stepsAt.get(cell);
  return new NFA(cellNFA(incident, ROLE_OF.get(cell) || 'plain'), 'path-cell',
    posA.at(cell), posB.at(cell), ...incident.map(s => s.id));
});

// Position counters. Numbering a real path 1, 2, 3, ... from the rat's cell is
// always possible, so "the arriving cell's counter is the leaving cell's plus
// one" rules out no genuine path; what it buys is that the in/out degrees above
// otherwise admit the path plus a disjoint closed cycle of steps, and such a
// cycle would have to be a multiple of both 15 and 11 cells long.
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
  new NFA(counterNFA(MOD_A), 'path-order', s.id, posA.at(s.a), posA.at(s.b)),
  new NFA(counterNFA(MOD_B), 'path-order', s.id, posB.at(s.a), posB.at(s.b)),
]);

// The two diagonals of a 2x2 block cross each other, and the path never crosses
// itself. Visiting no cell twice does not cover this: the four cells of an X are
// distinct.
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

// Dutch Whisper along the path: reads the step, then its two digits, and asks
// for a difference of at least 4 only when the rat actually took that step.
const whisperNFA = cached('whisper', () => NFA.encodeSpec({
  startState: { k: 0 },
  transition: (s, value) => {
    if (s.k === 0) return { k: 1, used: value !== UNUSED };
    if (s.k === 1) return { k: 2, used: s.used, a: value };
    if (s.k !== 2) return undefined;
    if (!s.used) return { done: true };
    return Math.abs(s.a - value) >= 4 ? { done: true } : undefined;
  },
  accept: s => s.done === true,
}, NV));
const whispers = steps.map(s => new NFA(whisperNFA, 'path-whisper', s.id, s.a, s.b));

// Blackcurrants apply to every drawn pair, on the path or not.
const blackcurrants = BLACKCURRANTS.map(([a, b]) => new BlackDot(a, b));

const range = (lo, hi) => Array.from({ length: hi - lo + 1 }, (_, n) => lo + n);

return [
  shape,
  posA.toVar('position mod ' + MOD_A),
  posB.toVar('position mod ' + MOD_B),
  new Var('S', 'path steps', steps.length),
  // The grid holds ordinary digits; only the Var layers use the wider alphabet.
  graph.makeReplicate(new Given(gridCells[0], ...range(1, 9))),
  // VA needs no domain of its own: the OFF sentinel plus 15 residues is exactly
  // the 16-value alphabet. VB uses 12 of the 16, so it needs one.
  posB.makeReplicate(new Given(posB.at(gridCells[0]), ...range(1, MOD_B + 1))),
  // The step Vars need no domain either: the path-cell machines accept nothing
  // on them but unused / entering / leaving.
  // The rat's cell is the first cell of the path, which stops the whole
  // numbering from rotating freely.
  new Given(posA.at(RAT), FIRST),
  new Given(posB.at(RAT), FIRST),
  ...blackcurrants,
  ...pathShape,
  ...counters,
  ...noCross,
  ...whispers,
];
