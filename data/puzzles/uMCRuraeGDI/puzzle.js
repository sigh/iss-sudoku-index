// Title: RAT RUN 13: Triskaidekaphilia
// Author: Marty Sears
// Video: https://www.youtube.com/watch?v=uMCRuraeGDI
// Source: https://sudokupad.app/zsk8n4tjvw

// Normal sudoku. Finkz the rat walks a path of cell centres from R5C5 to
// R1C9: no cell twice, no self-crossing, and no step across a thick maze
// wall. A step is orthogonal, or diagonal when the 2x2 block it cuts across
// carries no wall and no round wall-spot on its shared corner.
//
// One cell in every row, column and box is a nullifier; the nine nullifiers
// hold nine different digits. A nullifier's Sudoku digit is ordinary for
// row/column/box purposes, but every rule below that reads a cell's "value"
// treats a nullifier cell's value as zero.
//
// A motion sensor cell's digit is how many of itself and its up-to-8 king
// neighbours Finkz's path visits. A blackcurrant-joined pair has one value
// double the other; a grape-joined pair differs by at least 5. A
// red-X-joined pair always sums to 10, and Finkz's path may not step
// directly across that edge (a diagonal cut near it is unrestricted).
// Finally, every row, column and box that Finkz's path enters has its
// visited cells' values (wherever they fall in the house) sum to exactly
// 13; a house the path never enters has no sum requirement.
//
// Nothing is omitted. The maze walls are read from the drawn brown
// (thickness-12) lines and their matching wall-spot dots, per the rules'
// own word "thick"; a separate thin grey line network drawn over most of
// the grid is decorative background texture, not a rule -- as established
// for this family's similarly-styled tiny texture dots elsewhere.

// The alphabet is widened to 16 so the position-counter Vars can carry a
// sentinel plus 15 residues; the 81 grid cells are pinned back to 1-9.
const NV = 16;
const MOD_A = 15, MOD_B = 11;      // coprime moduli; lcm 165 exceeds 81 cells
const OFF = 1;                     // counter value for a cell Finkz misses
const FIRST = 2;                   // counter value of the path's first cell
const UNUSED = 1, FWD = 2, BWD = 3; // step: unused, cellA->cellB, cellB->cellA
const NUL = 1, NORM = 2;           // nullifier flag values

const RAT_CELL = 'R5C5';   // the rat emoji
const CUPCAKE = 'R1C9';    // the cupcake emoji

// --- The drawn maze --------------------------------------------------------
// Corner (i, j), i and j in 0..9, is the top-left corner of cell R(i+1)C(j+1),
// matching the payload's own coordinate lattice. WALLS holds the sixteen
// brown polylines exactly as drawn, including the outer border, plus six
// further single-unit segments the payload draws as short brown rectangles
// instead of polylines (same colour/weight; listed as 2-point segments).
// SPOTS holds the 42 round brown wall-spot corners.
const WALLS = [
  [[4, 3], [4, 4], [3, 4], [3, 7], [1, 7], [1, 6]],
  [[4, 5], [6, 5], [6, 7]],
  [[5, 3], [5, 4]],
  [[7, 7], [7, 6], [8, 6]],
  [[7, 6], [7, 4], [6, 4], [6, 2], [4, 2]],
  [[4, 1], [1, 1]],
  [[1, 2], [1, 3]],
  [[2, 8], [0, 8], [0, 9], [9, 9], [9, 0], [0, 0], [0, 8]],
  [[2, 4], [2, 3], [3, 3]],
  [[1, 5], [2, 5], [2, 6]],
  [[5, 8], [6, 8]],
  [[5, 6], [5, 7], [4, 7]],
  [[8, 5], [8, 2]],
  [[7, 2], [7, 1], [6, 1]],
  [[7, 8], [8, 8]],
  [[2, 2], [3, 2]],
  [[6, 2], [6, 3]],
  [[3, 6], [3, 7]],
  [[2, 3], [2, 4]],
  [[9, 1], [9, 2]],
  [[1, 1], [2, 1]],
  [[1, 0], [2, 0]],
];
const SPOTS = [
  [1, 1], [1, 2], [1, 3], [1, 5], [1, 6], [1, 7], [2, 2], [2, 3], [2, 4],
  [2, 5], [2, 6], [2, 8], [3, 2], [3, 3], [3, 4], [3, 7], [4, 1], [4, 2],
  [4, 3], [4, 4], [4, 5], [4, 7], [5, 3], [5, 4], [5, 6], [5, 7], [5, 8],
  [6, 1], [6, 2], [6, 4], [6, 5], [6, 7], [6, 8], [7, 1], [7, 2], [7, 4],
  [7, 7], [7, 8], [8, 2], [8, 5], [8, 6], [8, 8],
];
// The drawn forbidden doors (red X), berries, and motion sensors.
const FORBIDDEN_DOORS = [['R4C2', 'R5C2'], ['R3C3', 'R4C3'], ['R4C8', 'R5C8']];
const BLACKCURRANTS = [['R1C2', 'R1C3'], ['R6C6', 'R6C7']];
const GRAPES = [['R2C4', 'R2C5'], ['R6C1', 'R6C2'], ['R7C2', 'R7C3']];
const SENSORS = ['R2C1', 'R2C4', 'R7C3', 'R9C2'];

const shape = new Shape('9x9', NV);
const graph = cellGraph(shape);
const gridCells = graph.cells();
const posA = graph.makeOverlay('VA');   // position mod MOD_A
const posB = graph.makeOverlay('VB');   // position mod MOD_B
const nullFlag = graph.makeOverlay('VN');
const rowNullDigit = n => 'VD' + n;     // the nullifier digit of row n

const memo = new Map();
const cached = (key, build) => {
  if (!memo.has(key)) memo.set(key, build());
  return memo.get(key);
};

// Split the polylines into unit lattice segments: 'H|i|j' runs from corner
// (i, j) to (i, j+1), 'V|i|j' from (i, j) to (i+1, j).
const wallSegments = new Set();
for (const line of WALLS) {
  for (let n = 1; n < line.length; n++) {
    const [i0, j0] = line[n - 1], [i1, j1] = line[n];
    if (i0 === i1) {
      for (let j = Math.min(j0, j1); j < Math.max(j0, j1); j++) wallSegments.add(`H|${i0}|${j}`);
    } else {
      for (let i = Math.min(i0, i1); i < Math.max(i0, i1); i++) wallSegments.add(`V|${i}|${j0}`);
    }
  }
}
const spotSet = new Set(SPOTS.map(([i, j]) => `${i}|${j}`));
const edgeKey = (a, b) => (a < b ? `${a}|${b}` : `${b}|${a}`);
const doorSet = new Set(FORBIDDEN_DOORS.map(([a, b]) => edgeKey(a, b)));

// A diagonal step passes through the one corner its two cells share. It needs
// a 2x2 space, whose only internal edges are the four wall slots meeting at
// that corner, and it may not pass through a wall-spot.
const cornerOpen = (i, j) => !spotSet.has(`${i}|${j}`) &&
  !wallSegments.has(`V|${i - 1}|${j}`) && !wallSegments.has(`V|${i}|${j}`) &&
  !wallSegments.has(`H|${i}|${j - 1}`) && !wallSegments.has(`H|${i}|${j}`);

// Is the (dRow, dCol) step out of `cell` a legal move? Cell R(row)C(col)'s
// corners run (row-1, col-1) to (row, col) in the 0..9 lattice above.
const stepAllowed = (cell, dRow, dCol) => {
  const { row, col } = parseCellId(cell);
  if (dRow === 0) return !wallSegments.has(`V|${row - 1}|${col - 1 + Math.max(dCol, 0)}`);
  if (dCol === 0) return !wallSegments.has(`H|${row - 1 + Math.max(dRow, 0)}|${col - 1}`);
  return cornerOpen(row - 1 + Math.max(dRow, 0), col - 1 + Math.max(dCol, 0));
};

// --- Step variables ---------------------------------------------------------
// One Var per legal move; a walled move gets no variable, and a forbidden
// door removes just its one orthogonal step (a diagonal cut near it is not a
// pass "directly through" the door, so it stays governed by walls/wall-spots
// alone).
const STEP_DIRS = [[0, 1], [1, 0], [1, 1], [1, -1]];
const steps = [];
const stepsAt = new Map(gridCells.map(cell => [cell, []]));
for (const cell of gridCells) {
  for (const [dRow, dCol] of STEP_DIRS) {
    const other = graph.step(cell, dRow, dCol);
    if (!other || !stepAllowed(cell, dRow, dCol)) continue;
    if ((dRow === 0 || dCol === 0) && doorSet.has(edgeKey(cell, other))) continue;
    const id = 'VS' + (steps.length + 1);
    steps.push({ id, a: cell, b: other });
    stepsAt.get(cell).push({ id, out: FWD, in: BWD });
    stepsAt.get(other).push({ id, out: BWD, in: FWD });
  }
}

// --- Path shape --------------------------------------------------------------
// Per-cell machine: reads the cell's two counters, then every step it is an
// end of. A cell Finkz misses takes the OFF counter and uses no step; a
// visited cell is entered once and left once, except the rat cell (only
// left) and the cupcake (only entered).
const ROLE_OF = new Map([[RAT_CELL, 'rat'], [CUPCAKE, 'cupcake']]);
function cellNFA(incident, role) {
  const sig = 'cell|' + role + '|' + incident.map(s => s.out).join(',');
  return cached(sig, () => NFA.encodeSpec({
    startState: { k: 0 },
    transition: (s, value) => {
      if (s.k === 0) return { k: 1, vis: value !== OFF };
      if (s.k === 1) {
        if ((value !== OFF) !== s.vis) return undefined;
        return { k: 2, vis: s.vis, in1: 0, out1: 0 };
      }
      const n = s.k - 2;
      if (n >= incident.length) return undefined;
      const step = incident[n];
      const next = { k: s.k + 1, vis: s.vis, in1: s.in1, out1: s.out1 };
      if (value === step.in) next.in1++;
      else if (value === step.out) next.out1++;
      else if (value !== UNUSED) return undefined;
      if (next.in1 > 1 || next.out1 > 1) return undefined;
      return next;
    },
    accept: s => {
      if (s.k !== 2 + incident.length) return false;
      if (role === 'rat') return s.vis && s.out1 === 1 && s.in1 === 0;
      if (role === 'cupcake') return s.vis && s.in1 === 1 && s.out1 === 0;
      if (!s.vis) return s.in1 === 0 && s.out1 === 0;
      return s.in1 === 1 && s.out1 === 1;
    },
  }, NV));
}
const pathShape = gridCells.map(cell => {
  const incident = stepsAt.get(cell);
  const role = ROLE_OF.get(cell) || 'plain';
  return new NFA(cellNFA(incident, role), 'path-cell',
    posA.at(cell), posB.at(cell), ...incident.map(s => s.id));
});

// Position counters. Numbering a real path 1, 2, 3, ... from the rat cell is
// always possible, so what this buys is that a closed cycle of steps beside
// the path would need a length divisible by 15 and by 11, i.e. 165; in/out
// degree alone cannot rule such a cycle out.
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

// The two diagonals of a 2x2 block cross each other, and the path may not
// cross itself.
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

// --- Nullifiers ---------------------------------------------------------------
// One nullifier per row, column and box.
const nullifierRules = graph.rowsColumnsBoxes().map(
  cells => new ContainExact(String(NUL), ...nullFlag.at(cells)));
// The nine nullifier digits are all different. rowNullDigit(n) is row n's
// nullifier digit; with exactly one nullifier in the row it is that cell's
// digit and nothing else.
const nullifierDigitKey = cached('nullifier-digit', () => NFA.encodeSpec({
  startState: { k: 0 },
  transition: (s, value) => {
    if (s.k === 0) return { k: 1, on: value === NUL };
    if (s.k === 1) return { k: 2, on: s.on, digit: value };
    if (s.k !== 2) return undefined;
    return (!s.on || value === s.digit) ? { done: true } : undefined;
  },
  accept: s => s.done === true,
}, NV));
const nullifierDigits = graph.rows().flatMap((house, n) => house.map(
  cell => new NFA(nullifierDigitKey, 'nullifier-digit',
    nullFlag.at(cell), cell, rowNullDigit(n + 1))));

// --- Effective-value pair clues (blackcurrant / grape / forbidden-door) -----
// Reads (nullifier flag, digit) for each of two cells, substituting 0 for a
// nullifier's digit, then applies `test` to the two effective values.
function effectivePairMachine(test) {
  return NFA.encodeSpec({
    startState: { phase: 0 },
    transition: (s, value) => {
      if (s.phase === 0) return { phase: 1, nullA: value === NUL };
      if (s.phase === 1) return { phase: 2, a: s.nullA ? 0 : value };
      if (s.phase === 2) return { phase: 3, a: s.a, nullB: value === NUL };
      if (s.phase !== 3) return undefined;
      const b = s.nullB ? 0 : value;
      return test(s.a, b) ? { phase: 4 } : undefined;
    },
    accept: s => s.phase === 4,
  }, NV);
}
const blackcurrantKey = cached('blackcurrant',
  () => effectivePairMachine((a, b) => a === 2 * b || b === 2 * a));
const grapeKey = cached('grape',
  () => effectivePairMachine((a, b) => Math.abs(a - b) >= 5));
const doorSumKey = cached('door-sum',
  () => effectivePairMachine((a, b) => a + b === 10));
const pairClue = (key, name, x, y) =>
  new NFA(key, name, nullFlag.at(x), x, nullFlag.at(y), y);
const blackcurrants = BLACKCURRANTS.map(([x, y]) => pairClue(blackcurrantKey, 'blackcurrant', x, y));
const grapes = GRAPES.map(([x, y]) => pairClue(grapeKey, 'grape', x, y));
const doorSums = FORBIDDEN_DOORS.map(([x, y]) => pairClue(doorSumKey, 'forbidden-door-sum', x, y));

// --- Motion sensors ------------------------------------------------------------
// "The VALUE on a pink motion sensor" is itself subject to the nullifier rule,
// so a nullified sensor's target is 0, not its digit. Reads the visited/not
// status (posA's OFF sentinel) of the sensor's up-to-9 neighbourhood cells,
// then the sensor's own nullifier flag and digit.
const sensorMachine = size => cached('sensor|' + size, () => NFA.encodeSpec({
  startState: { phase: 'count', visited: 0, left: size },
  transition: (s, value) => {
    if (s.phase === 'count') {
      const visited = s.visited + (value !== OFF ? 1 : 0);
      const left = s.left - 1;
      return left > 0 ? { phase: 'count', visited, left } : { phase: 'flag', visited };
    }
    if (s.phase === 'flag') return { phase: 'digit', visited: s.visited, isNull: value === NUL };
    if (s.phase !== 'digit') return undefined;
    const want = s.isNull ? 0 : value;
    return want === s.visited ? { phase: 'done' } : undefined;
  },
  accept: s => s.phase === 'done',
}, NV));
const sensorClues = SENSORS.map(cell => {
  const neighbourhood = [cell, ...graph.kingNeighbours(cell)];
  return new NFA(sensorMachine(neighbourhood.length), 'motion-sensor',
    ...posA.at(neighbourhood), nullFlag.at(cell), cell);
});

// --- Test constraint: house sums to 13 when visited -------------------------
// Reads (visited, nullifier flag, digit) for each of a house's nine cells,
// summing effective values only over visited cells; a house with no visited
// cell has no requirement, otherwise the sum must be exactly 13. Effective
// values are never negative, so pruning once the running sum exceeds 13 loses
// no valid assignment.
const houseSumKey = cached('house-sum-13', () => NFA.encodeSpec({
  startState: { k: 0, any: false, sum: 0 },
  transition: (s, value) => {
    if (s.k >= 27) return undefined;   // reject reads past the house's 9 cells
    const step = s.k % 3;
    if (step === 0) return { k: s.k + 1, any: s.any, sum: s.sum, visited: value !== OFF };
    if (step === 1) return { k: s.k + 1, any: s.any, sum: s.sum, visited: s.visited, isNull: value === NUL };
    const eff = s.isNull ? 0 : value;
    const sum = s.sum + (s.visited ? eff : 0);
    if (sum > 13) return undefined;
    return { k: s.k + 1, any: s.any || s.visited, sum };
  },
  accept: s => s.k === 27 && (!s.any || s.sum === 13),
}, NV));
const testConstraints = graph.rowsColumnsBoxes().map(cells => new NFA(houseSumKey, 'test-constraint-13',
  ...cells.flatMap(cell => [posA.at(cell), nullFlag.at(cell), cell])));

// --- Variables and domains ---------------------------------------------------
const range = (lo, hi) => Array.from({ length: hi - lo + 1 }, (_, n) => lo + n);
const layers = [
  posA.toVar('position mod ' + MOD_A),
  posB.toVar('position mod ' + MOD_B),
  nullFlag.toVar('nullifier flags'),
  new Var('S', 'path steps', steps.length),
  new Var('D', 'nullifier digit by row', 9),
];
const domains = [
  graph.makeReplicate(new Given(gridCells[0], ...range(1, 9))),
  // VA needs no domain of its own: the sentinel plus MOD_A residues is
  // exactly the 16-value alphabet.
  posB.makeReplicate(new Given(posB.at(gridCells[0]), ...range(1, MOD_B + 1))),
  nullFlag.makeReplicate(new Given(nullFlag.at(gridCells[0]), NUL, NORM)),
  // The step Vars need no domain of their own: the path-cell machines accept
  // no value on them but unused / in / out.
  ...range(1, 9).map(n => new Given(rowNullDigit(n), ...range(1, 9))),
  // The rat's own cell is the first cell of the path.
  new Given(posA.at(RAT_CELL), FIRST),
  new Given(posB.at(RAT_CELL), FIRST),
];

return [
  shape,
  ...layers,
  ...domains,
  ...nullifierRules,
  new AllDifferent(...range(1, 9).map(rowNullDigit)),
  ...nullifierDigits,
  ...pathShape,
  ...counters,
  ...noCross,
  ...blackcurrants,
  ...grapes,
  ...doorSums,
  ...sensorClues,
  ...testConstraints,
];
