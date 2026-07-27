// Title: RAT RUN 22: Copyrat
// Author: Marty Sears
// Video: https://www.youtube.com/watch?v=9CkHikmSpJE
// Source: https://sudokupad.app/m9qm0m5qj0

// Normal sudoku. Two rats stand on R3C8 and R7C4 and each walks to a cupcake;
// the cupcakes are R3C9 and R8C4. A path visits no cell twice, the two paths
// share no cell, neither path crosses itself or the other, and no step passes
// through a thick maze wall. A step is orthogonal, or diagonal when the 2x2
// block it cuts across is free of walls and carries no round wall-spot on its
// corner.
// One cell in every row, column and box is a copycat, and the nine copycats
// hold nine different digits. A copycat's value is the digit of the cell 180
// degrees rotationally opposite it; every other cell's value is its own digit.
// Two cells joined by a blackcurrant have one value double the other; two
// joined by a redcurrant have one even and one odd value; two joined by a grape
// have values differing by at least 5. Finally, within each 3x3 box the values
// of the cells one rat visits total the same as the values of the cells the
// other rat visits.
//
// The rules say only that both rats reach cupcakes, and never pair a named rat
// with a named cupcake, so either rat may end at either cupcake; the encoding
// allows both pairings. A rat's own cell and the cupcake it reaches are cells
// it visits, so they count towards that rat's box totals.
//
// Nothing is omitted.

// The alphabet is widened to 11 so one Var layer can carry a position counter
// modulo 10; the 81 grid cells are pinned back to 1-9.
const NV = 11;

const MOD_A = 10, MOD_B = 9;    // coprime: a spurious cycle would need 90 cells
const OFF = 1;                  // counter value for a cell no rat visits
const FIRST = 2;                // counter value of a path's first cell
// Step values. A step is stored once, on the (a, b) pair below; FWD means the
// rat walked a->b, BWD means b->a, so the counters can tell direction.
const UNUSED = 1;
const A_FWD = 2, A_BWD = 3, B_FWD = 4, B_BWD = 5;
// Who visits a cell.
const NOBODY = 1, RAT_A = 2, RAT_B = 3;
const PLAIN = 1, COPYCAT = 2;
const MAX_DIGIT = 9;

const RAT_CELLS = ['R3C8', 'R7C4'];    // the two rat emoji
const CUPCAKES = ['R3C9', 'R8C4'];     // the two cupcake emoji

// --- The drawn maze -------------------------------------------------------
// Corner (i, j) is the top-left corner of cell RiCj, so the lattice runs 1..10.
// WALLS holds the twenty-one thick blue polylines exactly as drawn (including
// the boundary); SPOTS holds the 41 round blue wall-spots, each on a corner.
const WALLS = [
  [[8, 2], [9, 2]],
  [[3, 7], [1, 7], [1, 10], [10, 10], [10, 1], [7, 1], [7, 2]],
  [[1, 7], [1, 1], [7, 1]],
  [[10, 8], [9, 8]],
  [[4, 1], [4, 2]],
  [[9, 9], [8, 9], [8, 7], [9, 7]],
  [[8, 4], [9, 4]],
  [[9, 3], [7, 3]],
  [[5, 3], [6, 3]],
  [[9, 6], [7, 6], [7, 7]],
  [[7, 6], [7, 5]],
  [[6, 4], [7, 4]],
  [[4, 4], [5, 4]],
  [[3, 5], [4, 5]],
  [[2, 8], [4, 8], [4, 7], [5, 7]],
  [[8, 5], [9, 5]],
  [[2, 4], [3, 4]],
  [[3, 3], [4, 3]],
  [[4, 6], [5, 6]],
  [[6, 9], [7, 9]],
  [[2, 6], [3, 6]],
];
const SPOTS = [
  [2, 4], [2, 6], [2, 8], [3, 3], [3, 4], [3, 5], [3, 6], [3, 7], [4, 2],
  [4, 3], [4, 4], [4, 5], [4, 6], [4, 7], [4, 8], [5, 3], [5, 4], [5, 6],
  [5, 7], [6, 3], [6, 4], [6, 9], [7, 2], [7, 3], [7, 4], [7, 5], [7, 7],
  [7, 9], [8, 2], [8, 4], [8, 5], [8, 7], [8, 9], [9, 2], [9, 3], [9, 4],
  [9, 5], [9, 6], [9, 7], [9, 8], [9, 9],
];
// The drawn fruit, each on the edge between the two cells it joins: the black
// dots are the blackcurrants, the red the redcurrants, the green the grapes.
const BLACKCURRANTS = [
  ['R7C1', 'R7C2'], ['R7C2', 'R8C2'], ['R8C2', 'R9C2'], ['R9C2', 'R9C3'],
  ['R7C4', 'R8C4'], ['R8C6', 'R9C6'],
];
const REDCURRANTS = [
  ['R1C8', 'R1C9'], ['R1C9', 'R2C9'], ['R2C8', 'R2C9'], ['R2C8', 'R3C8'],
  ['R7C3', 'R8C3'],
];
const GRAPES = [
  ['R1C1', 'R2C1'], ['R1C7', 'R1C8'], ['R1C8', 'R2C8'], ['R2C3', 'R3C3'],
  ['R3C2', 'R4C2'], ['R3C3', 'R4C3'],
];

const shape = new Shape('9x9', NV);
const graph = cellGraph(shape);
const gridCells = graph.cells();
const posA = graph.makeOverlay('VA');     // position along a path, mod 10
const posB = graph.makeOverlay('VB');     // position along a path, mod 9
const owner = graph.makeOverlay('VO');    // which rat visits the cell, if any
const copy = graph.makeOverlay('VC');     // 1 = ordinary cell, 2 = copycat
const val = graph.makeOverlay('VV');      // the cell's value
const rowDigit = n => 'VD' + n;           // the copycat digit of row n

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
    // aOut / aIn are the values meaning "rat A left / entered here", bOut / bIn
    // the same for rat B; they are swapped at the far end of the step.
    stepsAt.get(cell).push({ id, aOut: A_FWD, aIn: A_BWD, bOut: B_FWD, bIn: B_BWD });
    stepsAt.get(other).push({ id, aOut: A_BWD, aIn: A_FWD, bOut: B_BWD, bIn: B_FWD });
  }
}

const memo = new Map();
const cached = (key, build) => {
  if (!memo.has(key)) memo.set(key, build());
  return memo.get(key);
};

// --- Path shape -----------------------------------------------------------
// Per-cell machine: reads which rat owns the cell, then its two counters, then
// every step the cell is an end of. An unowned cell takes the OFF counters and
// uses no step; an owned cell is entered once and left once by its own rat and
// accepts no step value belonging to the other rat, which is what keeps the two
// paths off each other's cells. A rat's own cell is only left, a cupcake only
// entered -- and a cupcake may be entered by either rat.
const ROLE_OF = new Map([[RAT_CELLS[0], 'rat1'], [RAT_CELLS[1], 'rat2'],
[CUPCAKES[0], 'cupcake'], [CUPCAKES[1], 'cupcake']]);
function cellNFA(incident, role) {
  // The step values a cell sees depend on whether it is the step's a or b end,
  // so the machine is keyed on that pattern, not just on the step count.
  const sig = 'cell|' + role + '|' + incident.map(s => s.aOut).join(',');
  return cached(sig, () => NFA.encodeSpec({
    startState: { k: 0 },
    transition: (s, value) => {
      if (s.k === 0) {
        if (value !== NOBODY && value !== RAT_A && value !== RAT_B) return undefined;
        return { k: 1, own: value };
      }
      if (s.k === 1 || s.k === 2) {
        if ((value === OFF) !== (s.own === NOBODY)) return undefined;
        return { k: s.k + 1, own: s.own, in: 0, out: 0 };
      }
      const n = s.k - 3;
      if (n >= incident.length) return undefined;
      const step = incident[n];
      const next = { k: s.k + 1, own: s.own, in: s.in, out: s.out };
      if (value === UNUSED) return next;
      if (s.own === NOBODY) return undefined;
      if (value === (s.own === RAT_A ? step.aOut : step.bOut)) next.out++;
      else if (value === (s.own === RAT_A ? step.aIn : step.bIn)) next.in++;
      else return undefined;
      if (next.in > 1 || next.out > 1) return undefined;
      return next;
    },
    accept: s => {
      if (s.k !== 3 + incident.length) return false;
      if (role === 'rat1') return s.own === RAT_A && s.out === 1 && s.in === 0;
      if (role === 'rat2') return s.own === RAT_B && s.out === 1 && s.in === 0;
      if (role === 'cupcake') return s.own !== NOBODY && s.in === 1 && s.out === 0;
      if (s.own === NOBODY) return s.in === 0 && s.out === 0;
      return s.in === 1 && s.out === 1;
    },
  }, NV));
}
const pathShape = gridCells.map(cell => {
  const incident = stepsAt.get(cell);
  const role = ROLE_OF.get(cell) || 'plain';
  return new NFA(cellNFA(incident, role), 'path-cell', owner.at(cell),
    posA.at(cell), posB.at(cell), ...incident.map(s => s.id));
});

// Position counters. Numbering a real path 1, 2, 3, ... from the rat's cell is
// always possible, so "the arriving cell's counter is the leaving cell's plus
// one" adds nothing; what it buys is that a closed cycle of steps beside a path
// would need a length divisible by 10 and by 9, i.e. by 90, and there are only
// 81 cells. Degree alone cannot rule such a cycle out.
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

// --- Copycats and values --------------------------------------------------
// One copycat per row, column and box.
const copycatHouses = graph.houses().map(
  house => new ContainExact(String(COPYCAT), ...copy.at(house)));
// The nine copycat digits are all different. VD<n> is row n's copycat digit;
// with exactly one copycat in the row it is that cell's digit and nothing else.
const copycatDigitKey = cached('copycat-digit', () => NFA.encodeSpec({
  startState: { k: 0 },
  transition: (s, value) => {
    if (s.k === 0) return { k: 1, on: value === COPYCAT };
    if (s.k === 1) return { k: 2, on: s.on, digit: value };
    if (s.k !== 2) return undefined;
    return (!s.on || value === s.digit) ? { done: true } : undefined;
  },
  accept: s => s.done === true,
}, NV));
const copycatDigits = graph.rows().flatMap((house, n) => house.map(
  cell => new NFA(copycatDigitKey, 'copycat-digit',
    copy.at(cell), cell, rowDigit(n + 1))));

// Reads the copycat flag, the cell's own digit, the digit of the cell 180
// degrees rotationally opposite, and the value: a copycat takes the opposite
// digit, any other cell its own.
const valueKey = cached('cell-value', () => NFA.encodeSpec({
  startState: { k: 0 },
  transition: (s, value) => {
    if (s.k === 0) return { k: 1, copy: value === COPYCAT };
    if (s.k === 1) return { k: 2, copy: s.copy, want: s.copy ? 0 : value };
    if (s.k === 2) return { k: 3, want: s.copy ? value : s.want };
    if (s.k !== 3) return undefined;
    return value === s.want ? { done: true } : undefined;
  },
  accept: s => s.done === true,
}, NV));
const cellValues = gridCells.map(cell => {
  const { row, col } = parseCellId(cell);
  const opposite = makeCellId({ row: 10 - row, col: 10 - col });
  // R5C5 is its own opposite, so its value is its digit whether or not it is a
  // copycat; the general machine cannot read one cell twice.
  if (opposite === cell) return new SameValues(2, cell, val.at(cell));
  return new NFA(valueKey, 'cell-value',
    copy.at(cell), cell, opposite, val.at(cell));
});

const fruit = (name, fn, pairs) => {
  const key = Pair.fnToKey(fn, NV);
  return pairs.map(([x, y]) => new Pair(key, name, val.at(x), val.at(y)));
};
const blackcurrants = fruit('blackcurrant',
  (x, y) => x === 2 * y || y === 2 * x, BLACKCURRANTS);
const redcurrants = fruit('redcurrant', (x, y) => (x + y) % 2 === 1, REDCURRANTS);
const grapes = fruit('grape', (x, y) => Math.abs(x - y) >= 5, GRAPES);

// --- The test constraint --------------------------------------------------
// Per box, reads each cell as (owner, value) and tracks rat A's running total
// minus rat B's, which must end at zero. A cell shifts the difference by at
// most 9, so a partial difference the cells still to come cannot cancel is
// already dead; without that pruning the machine carries every reachable
// difference and is several times larger.
const BOX_SIZE = 9;
const boxBalanceKey = cached('box-balance', () => NFA.encodeSpec({
  startState: { k: 0, diff: 0 },
  transition: (s, value) => {
    if (s.own === undefined) {
      if (value !== NOBODY && value !== RAT_A && value !== RAT_B) return undefined;
      return { k: s.k, diff: s.diff, own: value };
    }
    const sign = s.own === RAT_A ? 1 : (s.own === RAT_B ? -1 : 0);
    const diff = s.diff + sign * value;
    const k = s.k + 1;
    if (Math.abs(diff) > MAX_DIGIT * (BOX_SIZE - k)) return undefined;
    return { k, diff };
  },
  accept: s => s.k === BOX_SIZE && s.diff === 0 && s.own === undefined,
}, NV));
const boxBalance = graph.boxes().map(box => new NFA(boxBalanceKey, 'box-balance',
  ...box.flatMap(cell => [owner.at(cell), val.at(cell)])));

// --- Variables and domains ------------------------------------------------
const range = (lo, hi) => Array.from({ length: hi - lo + 1 }, (_, n) => lo + n);
const layers = [
  posA.toVar('position mod ' + MOD_A),
  posB.toVar('position mod ' + MOD_B),
  owner.toVar('cell owner'),
  copy.toVar('copycat cells'),
  val.toVar('cell value'),
  new Var('S', 'path steps', steps.length),
  new Var('D', 'copycat digit by row', 9),
];
const domains = [
  graph.makeReplicate(new Given(gridCells[0], ...range(1, MAX_DIGIT))),
  // VA needs no domain of its own: the sentinel plus MOD_A residues is exactly
  // the 11-value alphabet.
  posB.makeReplicate(new Given(posB.at(gridCells[0]), ...range(1, MOD_B + 1))),
  owner.makeReplicate(new Given(owner.at(gridCells[0]), NOBODY, RAT_A, RAT_B)),
  copy.makeReplicate(new Given(copy.at(gridCells[0]), PLAIN, COPYCAT)),
  val.makeReplicate(new Given(val.at(gridCells[0]), ...range(1, MAX_DIGIT))),
  // The step Vars need no domain of their own: the path-cell machines accept
  // no value on them but unused / in / out, for either rat.
  ...range(1, 9).map(n => new Given(rowDigit(n), ...range(1, MAX_DIGIT))),
  // Each rat's own cell is the first cell of its path.
  ...RAT_CELLS.flatMap(cell => [
    new Given(posA.at(cell), FIRST), new Given(posB.at(cell), FIRST)]),
];

return [
  shape,
  ...layers,
  ...domains,
  ...copycatHouses,
  new AllDifferent(...range(1, 9).map(rowDigit)),
  ...copycatDigits,
  ...cellValues,
  ...blackcurrants,
  ...redcurrants,
  ...grapes,
  ...pathShape,
  ...counters,
  ...noCross,
  ...boxBalance,
];
