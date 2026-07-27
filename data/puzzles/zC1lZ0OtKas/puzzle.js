// Title: RAT RUN 21: Friendly
// Author: Marty Sears
// Video: https://www.youtube.com/watch?v=zC1lZ0OtKas
// Source: https://sudokupad.app/bbcodg1b5w

// Normal sudoku. Finkz and Phinx stand on R1C1 and R9C1 and each walks through
// the maze to the cupcake cell R5C9. A walk visits no cell twice, the two walks
// share no cell but the cupcake, neither crosses itself or the other, and no
// step passes through a thick maze wall. A step is orthogonal, or diagonal when
// the 2x2 block it cuts across is free of walls and its shared corner carries no
// round wall-spot.
// Two digits joined by a blackcurrant have one double the other.
// Two digits joined by a grape differ by at least 5.
// Two digits joined by a red X sum to 10, and no walk may cross that edge.
// TEST CONSTRAINT: a visited cell's digit is its row, its column or its box
// number, boxes numbered 1-9 in reading order.
//
// Nothing is omitted.

// The alphabet is widened so the Var layers can carry the position counters; the
// 81 grid cells are pinned back to 1-9 below.
const NV = 11;

const MOD_A = 10, MOD_B = 9;    // coprime: a spurious cycle would need 90 cells
const OFF = 1;                  // counter value for a cell no rat visits
const FIRST = 2;                // counter value of the walk's first cell
// Step values. A step is stored once, on the (a, b) pair built below; FWD means
// travel a->b and BWD b->a, so the counters can tell direction.
const UNUSED = 1, FWD = 2, BWD = 3;

// The two rat emoji, and the cell holding both cupcake emoji.
const RAT_CELLS = ['R1C1', 'R9C1'];
const CUPCAKE = 'R5C9';

// --- The drawn maze -------------------------------------------------------
// Corner (i, j) is the top-left corner of cell RiCj, so the lattice runs 1..10.
// WALLS holds the ten thick pink polylines as drawn, including the boundary
// loop. The box borders and the cell grid are drawn in thinner, paler strokes
// and are not walls: several of these pink polylines lie along a stretch of a
// box border, which would be pointless if the border were itself a wall, and
// walling every box border would cut the grid into nine sealed boxes, leaving no
// route from either rat to the cupcake at all.
const WALLS = [
  [[3, 2], [3, 3]],
  [[4, 2], [5, 2]],
  [[7, 2], [8, 2]],
  [[8, 4], [9, 4]],
  [[3, 7], [4, 7]],
  [[5, 7], [6, 7]],
  [[5, 8], [2, 8], [2, 9]],
  [[7, 8], [7, 9]],
  [[8, 8], [8, 9]],
  [[3, 9], [3, 10], [10, 10], [10, 1], [1, 1], [1, 10], [3, 10]],
];
// The 29 round pink wall-spots of the same pink, each on a lattice corner.
const SPOTS = [
  [2, 8], [2, 9], [3, 2], [3, 3], [3, 7], [3, 9], [4, 2], [4, 3], [4, 4],
  [4, 5], [4, 6], [4, 7], [5, 2], [5, 7], [5, 8], [6, 7], [7, 2], [7, 3],
  [7, 4], [7, 5], [7, 6], [7, 7], [7, 8], [7, 9], [8, 2], [8, 4], [8, 8],
  [8, 9], [9, 4],
];
// The drawn fruit and doors, each named by the two cells its edge separates.
// Blackcurrants are the black dots, grapes the green ones, doors the red Xs.
const BLACKCURRANTS = [['R3C2', 'R4C2'], ['R5C3', 'R6C3'], ['R8C3', 'R9C3']];
const GRAPES = [
  ['R5C1', 'R6C1'], ['R3C9', 'R4C9'], ['R6C6', 'R6C7'], ['R8C5', 'R8C6'],
];
const DOORS = [['R4C4', 'R5C4'], ['R5C2', 'R6C2'], ['R8C9', 'R9C9']];

const shape = new Shape('9x9', NV);
const graph = cellGraph(shape);
const gridCells = graph.cells();
const posA = graph.makeOverlay('VA');     // position mod 10
const posB = graph.makeOverlay('VB');     // position mod 9

// Split the polylines into unit lattice segments: 'H|i|j' runs from corner
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
// A red X is drawn on the middle of an edge, so it stops the orthogonal step
// across that edge and nothing else: it is not a wall, and the 2x2 blocks that
// touch it stay open to diagonal steps.
const doorEdges = new Set(DOORS.map(([a, b]) => a + '|' + b));

// A diagonal step passes through the one corner its two cells share. It needs a
// 2x2 space, whose only internal edges are the four wall slots meeting at that
// corner, and it may not pass through a wall-spot.
const cornerOpen = (i, j) => !spotSet.has(`${i}|${j}`) &&
  !wallSegments.has(`V|${i - 1}|${j}`) && !wallSegments.has(`V|${i}|${j}`) &&
  !wallSegments.has(`H|${i}|${j - 1}`) && !wallSegments.has(`H|${i}|${j}`);

// Is the (dRow, dCol) step from `cell` to `other` a legal move?
const stepAllowed = (cell, other, dRow, dCol) => {
  const { row, col } = parseCellId(cell);
  if (doorEdges.has(cell + '|' + other) || doorEdges.has(other + '|' + cell)) {
    return false;
  }
  if (dRow === 0) return !wallSegments.has(`V|${row}|${col + Math.max(dCol, 0)}`);
  if (dCol === 0) return !wallSegments.has(`H|${row + Math.max(dRow, 0)}|${col}`);
  return cornerOpen(row + Math.max(dRow, 0), col + Math.max(dCol, 0));
};

// --- One path, not two ----------------------------------------------------
// Both rats finish on the same cell and their walks are otherwise disjoint, so
// the union of the two walks is a single self-avoiding path from R1C1 to R9C1
// running through the cupcake. Cutting such a path at the cupcake gives back a
// legal pair of walks, and every legal pair arises from exactly one such path,
// so the encoding carries one path traversed from R1C1 and needs no layer
// saying which rat is on a cell.

// --- Step variables -------------------------------------------------------
// One Var per legal king move, recording whether the path uses it and in which
// direction; a move a wall or a door forbids gets no variable at all, which is
// how walls and doors are enforced.
const STEP_DIRS = [[0, 1], [1, 0], [1, 1], [1, -1]];
const steps = [];
const stepsAt = new Map(gridCells.map(cell => [cell, []]));
for (const cell of gridCells) {
  for (const [dRow, dCol] of STEP_DIRS) {
    const other = graph.step(cell, dRow, dCol);
    if (!other || !stepAllowed(cell, other, dRow, dCol)) continue;
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
// of. A cell off the path takes the OFF counter and uses no step; a cell on the
// path is entered once and left once. The traversal starts at RAT_CELLS[0],
// which is only left, and finishes at RAT_CELLS[1], which is only entered.
const ROLE_OF = new Map([[RAT_CELLS[0], 'start'], [RAT_CELLS[1], 'finish']]);
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
      if (role === 'start') return s.vis && s.out === 1 && s.in === 0;
      if (role === 'finish') return s.vis && s.in === 1 && s.out === 0;
      if (!s.vis) return s.in === 0 && s.out === 0;
      return s.in === 1 && s.out === 1;
    },
  }, NV));
}
const pathShape = gridCells.map(cell => {
  const incident = stepsAt.get(cell);
  const role = ROLE_OF.get(cell) || 'plain';
  return new NFA(cellNFA(incident, role), 'path-cell',
    posA.at(cell), posB.at(cell), ...incident.map(s => s.id));
});

// Position counters. Numbering a real path 1, 2, 3, ... from RAT_CELLS[0] is
// always possible, so "the arriving cell's counter is the leaving cell's plus
// one" rejects no genuine path; what it buys is that a closed cycle of steps
// beside the path would need a length divisible by 10 and by 9, i.e. by 90, and
// there are only 81 cells. The degree rules above admit such a cycle and nothing
// else rules it out.
const nextPos = (v, mod) => FIRST + ((v - FIRST + 1) % mod);
const counterNFA = mod => cached('counter|' + mod, () => NFA.encodeSpec({
  startState: { k: 0 },
  transition: (s, value) => {
    if (s.k === 0) return { k: 1, dir: value };
    if (s.k === 1) return { k: 2, dir: s.dir, a: value };
    if (s.k !== 2) return undefined;
    if (s.dir === UNUSED) return { done: true };
    if (s.a === OFF || value === OFF) return undefined;
    if (s.dir === FWD) {
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

// --- Test constraint ------------------------------------------------------
// Reads the cell's first counter, which is OFF exactly when no rat visits it,
// then its digit: a visited cell's digit must be one of the three numbers that
// name the cell. Each rat stands on a grid cell and so visits it, so the rule
// binds the rat cells and the cupcake too.
const boxNumber = (row, col) =>
  3 * Math.floor((row - 1) / 3) + Math.floor((col - 1) / 3) + 1;
const testKey = allowed => cached('test|' + allowed.join(','), () => Pair.fnToKey(
  (pos, digit) => pos === OFF || allowed.includes(digit), NV));
const testConstraint = gridCells.map(cell => {
  const { row, col } = parseCellId(cell);
  const allowed = [...new Set([row, col, boxNumber(row, col)])];
  return new Pair(testKey(allowed), 'visitable', posA.at(cell), cell);
});

// --- Fruit and doors ------------------------------------------------------
const blackcurrants = BLACKCURRANTS.map(([x, y]) => new BlackDot(x, y));
const grapes = GRAPES.map(([x, y]) => new Whisper(5, x, y));
// A door's movement ban is already in the step graph; this is its digit sum.
const doors = DOORS.map(([x, y]) => new X(x, y));

// --- Variables and domains ------------------------------------------------
const range = (lo, hi) => Array.from({ length: hi - lo + 1 }, (_, n) => lo + n);
const layers = [
  posA.toVar('position mod ' + MOD_A),
  posB.toVar('position mod ' + MOD_B),
  new Var('S', 'path steps', steps.length),
];
const domains = [
  graph.makeReplicate(new Given(gridCells[0], ...range(1, 9))),
  // VA needs no domain of its own: the OFF sentinel plus MOD_A residues is
  // exactly the 11-value alphabet.
  posB.makeReplicate(new Given(posB.at(gridCells[0]), ...range(1, MOD_B + 1))),
  // The step Vars need no domain of their own: the path-cell machines accept no
  // value on them but unused / in / out.
  // The traversal starts at the first rat cell; without this the numbering of
  // the whole path could rotate freely through the residues.
  new Given(posA.at(RAT_CELLS[0]), FIRST),
  new Given(posB.at(RAT_CELLS[0]), FIRST),
  // Both rats reach the cupcake, so it is on the path: anything but OFF.
  new Given(posA.at(CUPCAKE), ...range(FIRST, NV)),
  new Given(posB.at(CUPCAKE), ...range(FIRST, MOD_B + 1)),
];

return [
  shape,
  ...layers,
  ...domains,
  ...pathShape,
  ...counters,
  ...noCross,
  ...testConstraint,
  ...blackcurrants,
  ...grapes,
  ...doors,
];
