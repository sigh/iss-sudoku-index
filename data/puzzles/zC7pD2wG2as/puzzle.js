// Title: RAT RUN 30: Star Rats
// Author: Marty Sears
// Video: https://www.youtube.com/watch?v=zC7pD2wG2as
// Source: https://sudokupad.app/axfuqiprqj

// Normal sudoku. Two rats stand on R4C1 and R9C9 and each walks to the cupcake
// cell R5C6. A path visits no cell twice, the two paths share no cell but the
// cupcake, neither path crosses itself or the other, and no step passes through
// a thick maze wall. A step is orthogonal, or diagonal when the 2x2 block it
// cuts across is free of walls and carries no round wall-spot on its corner.
// One cell in every row, column and box is a booster, and the nine boosters hold
// nine different digits; a booster's value is its digit plus its row plus its
// column, and every other cell's value is its digit. Two cells joined by a
// blackcurrant have one value double the other. The two values joined by a
// starfruit always sum to the same total, which the solver must deduce. Finally,
// both rats visit the same number of cells and read out the same sequence of
// values.
//
// Nothing is omitted.

// The alphabet is widened to 16 so the Var layers can carry path state, values
// above 9 and the position counters; the 81 grid cells are pinned back to 1-9.
const NV = 16;

const MOD_A = 15, MOD_B = 11;   // coprime: a spurious cycle would need 165 cells
const OFF = 1;                  // counter value for a cell no rat visits
const FIRST = 2;                // counter value of a path's first cell
// Step values. A step is stored once, on the (a, b) pair below; FWD means the
// rat walked a->b, BWD means b->a, so the counters can tell direction.
const UNUSED = 1;
const A_FWD = 2, A_BWD = 3, B_FWD = 4, B_BWD = 5;
// Both paths together cover at most 81 cells and share only the cupcake, so
// each is at most (81 + 1) / 2 cells long.
const MAX_LEN = 41;
const T_NONE = 4;               // value-table entry for a position past the end
const MAX_VALUE = 27;           // 9 (digit) + 9 (row) + 9 (column)

const RAT_CELLS = ['R4C1', 'R9C9'];   // the two rat emoji
const CUPCAKE = 'R5C6';               // both cupcake emoji

// --- The drawn maze -------------------------------------------------------
// Corner (i, j) is the top-left corner of cell RiCj, so the lattice runs 1..10.
// WALLS holds the twelve thick grey polylines exactly as drawn (including the
// boundary); SPOTS holds the 28 round grey wall-spots, each on a lattice corner.
const WALLS = [
  [[9, 2], [4, 2], [4, 5], [5, 5], [5, 6]],
  [[4, 2], [2, 2], [2, 3]],
  [[5, 7], [4, 7], [4, 8], [3, 8], [3, 9]],
  [[3, 8], [2, 8]],
  [[8, 5], [8, 6]],
  [[8, 9], [8, 7], [10, 7], [10, 10], [1, 10], [1, 4], [3, 4]],
  [[10, 7], [10, 1], [1, 1], [1, 4]],
  [[9, 10], [9, 8]],
  [[7, 10], [7, 6]],
  [[2, 6], [2, 7]],
  [[9, 3], [9, 4]],
  [[6, 3], [6, 4], [7, 4]],
];
const SPOTS = [
  [2, 2], [2, 3], [2, 6], [2, 7], [2, 8], [2, 9], [3, 4], [3, 9], [4, 5],
  [4, 7], [4, 8], [5, 5], [5, 6], [5, 7], [5, 8], [5, 9], [6, 3], [6, 4],
  [7, 4], [7, 6], [8, 5], [8, 6], [8, 7], [8, 9], [9, 2], [9, 3], [9, 4],
  [9, 8],
];
// The drawn fruit, each on the edge between the two cells it joins.
const BLACKCURRANTS = [
  ['R2C2', 'R3C2'], ['R3C4', 'R3C5'], ['R4C5', 'R4C6'],
  ['R7C8', 'R7C9'], ['R9C4', 'R9C5'],
];
const STARFRUIT = [
  ['R1C4', 'R2C4'], ['R2C4', 'R3C4'], ['R2C6', 'R3C6'],
  ['R5C2', 'R5C3'], ['R7C6', 'R8C6'], ['R9C7', 'R9C8'],
];

const shape = new Shape('9x9', NV);
const graph = cellGraph(shape);
const gridCells = graph.cells();
const posA = graph.makeOverlay('VA');     // position mod 15
const posB = graph.makeOverlay('VB');     // position mod 11
const boost = graph.makeOverlay('VF');    // 1 = ordinary cell, 2 = booster
const valH = graph.makeOverlay('VH');     // value = 9 * (VH - 1) + VL
const valL = graph.makeOverlay('VL');
const tableH = n => 'VT' + n;             // value at position n, same split
const tableL = n => 'VU' + n;
const rowDigit = n => 'VD' + n;           // the booster digit of row n
const STAR_H = 'VP', STAR_L = 'VQ';        // the deduced starfruit total

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
    steps.push({ id, a: cell, b: other, dRow, dCol });
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
      const next = { k: s.k + 1, vis: s.vis, in1: s.in1, out1: s.out1, in2: s.in2, out2: s.out2 };
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

// Position counters. Numbering a real path 1, 2, 3, ... from the rat's cell is
// always possible, so "the arriving cell's counter is the leaving cell's plus
// one" adds nothing; what it buys is that a closed cycle of steps beside a path
// would need a length divisible by 15 and by 11, i.e. by 165, and there are only
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

// --- Boosters and values --------------------------------------------------
// One booster per row, column and box.
const boosterHouses = graph.houses().map(
  house => new ContainExact(String(2), ...boost.at(house)));
// The nine booster digits are all different. VD<n> is row n's booster digit;
// with exactly one booster in the row it is that cell's digit and nothing else.
const boosterDigitKey = cached('booster-digit', () => NFA.encodeSpec({
  startState: { k: 0 },
  transition: (s, value) => {
    if (s.k === 0) return { k: 1, on: value === 2 };
    if (s.k === 1) return { k: 2, on: s.on, digit: value };
    if (s.k !== 2) return undefined;
    return (!s.on || value === s.digit) ? { done: true } : undefined;
  },
  accept: s => s.done === true,
}, NV));
const boosterDigits = graph.rows().flatMap((house, n) => house.map(
  cell => new NFA(boosterDigitKey, 'booster-digit',
    boost.at(cell), cell, rowDigit(n + 1))));

// A value runs to 27, so it is held split over two cells as 9*(VH-1)+VL, and
// the arithmetic on values is done inside state machines. (`Sum` with
// coefficients would say this in one line, but its propagation drops valid
// assignments for several of the coefficient patterns needed here.)
const splitValue = (h, l) => 9 * (h - 1) + l;
const MAX_H = MAX_VALUE / 9;
// value = digit + row + col for a booster cell, digit for any other.
const valueNFA = bonus => cached('value|' + bonus, () => NFA.encodeSpec({
  startState: { k: 0 },
  transition: (s, value) => {
    if (s.k === 0) return { k: 1, add: value === 2 ? bonus : 0 };
    if (s.k === 1) return { k: 2, v: value + s.add };
    if (s.k === 2) {
      if (value > MAX_H) return undefined;
      return { k: 3, want: s.v - splitValue(value, 0) };
    }
    if (s.k !== 3) return undefined;
    return value === s.want ? { done: true } : undefined;
  },
  accept: s => s.done === true,
}, NV));
const cellValues = gridCells.map(cell => {
  const { row, col } = parseCellId(cell);
  return new NFA(valueNFA(row + col), 'cell-value',
    boost.at(cell), cell, valH.at(cell), valL.at(cell));
});

// Reads the two split values and checks that one is twice the other.
const blackcurrantKey = cached('blackcurrant', () => NFA.encodeSpec({
  startState: { k: 0 },
  transition: (s, value) => {
    if (s.k === 0) return value > MAX_H ? undefined : { k: 1, h: value };
    if (s.k === 1) return { k: 2, x: splitValue(s.h, value) };
    if (s.k === 2) return value > MAX_H ? undefined : { k: 3, x: s.x, h: value };
    if (s.k !== 3) return undefined;
    const y = splitValue(s.h, value);
    return (s.x === 2 * y || y === 2 * s.x) ? { done: true } : undefined;
  },
  accept: s => s.done === true,
}, NV));
const blackcurrants = BLACKCURRANTS.map(([x, y]) => new NFA(blackcurrantKey,
  'blackcurrant', valH.at(x), valL.at(x), valH.at(y), valL.at(y)));

// Reads the two split values and the split total, which is shared by every
// starfruit and so is deduced rather than given.
const starfruitKey = cached('starfruit', () => NFA.encodeSpec({
  startState: { k: 0 },
  transition: (s, value) => {
    if (s.k === 0) return value > MAX_H ? undefined : { k: 1, h: value };
    if (s.k === 1) return { k: 2, x: splitValue(s.h, value) };
    if (s.k === 2) return value > MAX_H ? undefined : { k: 3, x: s.x, h: value };
    if (s.k === 3) return { k: 4, total: s.x + splitValue(s.h, value) };
    // Two values, so the total needs one more high part than a single value.
    if (s.k === 4) {
      if (value > 2 * MAX_H) return undefined;
      return { k: 5, want: s.total - splitValue(value, 0) };
    }
    if (s.k !== 5) return undefined;
    return value === s.want ? { done: true } : undefined;
  },
  accept: s => s.done === true,
}, NV));
const starfruit = STARFRUIT.map(([x, y]) => new NFA(starfruitKey, 'starfruit',
  valH.at(x), valL.at(x), valH.at(y), valL.at(y), STAR_H, STAR_L));

// --- The shared value sequence --------------------------------------------
// Both rats read out the same sequence, so there is one table of values by
// position: VT<n>/VU<n> hold the value at position n, split as the cells are.
// Every visited cell must match its own position's entry, which is what makes
// the two sequences equal; positions past the end of the paths take T_NONE.
const posValues = n => [FIRST + ((n - 1) % MOD_A), FIRST + ((n - 1) % MOD_B)];
const tableNFA = n => cached('table|' + n, () => {
  const [rA, rB] = posValues(n);
  return NFA.encodeSpec({
    startState: { k: 0 },
    transition: (s, value) => {
      if (s.k === 0) return { k: 1, hit: value === rA };
      if (s.k === 1) return { k: 2, hit: s.hit && value === rB };
      if (s.k === 2) return s.hit ? { k: 3, hit: true, h: value } : { k: 3, hit: false };
      if (s.k === 3) return s.hit ? { k: 4, hit: true, h: s.h, l: value } : { k: 4, hit: false };
      if (s.k === 4) {
        if (!s.hit) return { k: 5, hit: false };
        return value === s.h ? { k: 5, hit: true, l: s.l } : undefined;
      }
      if (s.k !== 5) return undefined;
      if (!s.hit) return { done: true };
      return value === s.l ? { done: true } : undefined;
    },
    accept: s => s.done === true,
  }, NV);
});
const sequence = [];
for (let n = 1; n <= MAX_LEN; n++) {
  for (const cell of gridCells) {
    sequence.push(new NFA(tableNFA(n), 'value-at-position',
      posA.at(cell), posB.at(cell), valH.at(cell), valL.at(cell),
      tableH(n), tableL(n)));
  }
}
// The cupcake's counter is the length of both paths, which is what says the two
// rats visit the same number of cells: it is one cell, so one number. It also
// says which table entries are real; the rest are pinned to T_NONE so that the
// table carries no free choice.
const lengthFromCounters = (rA, rB) => {
  for (let n = 1; n <= MOD_A * MOD_B; n++) {
    const [a, b] = posValues(n);
    if (a === rA && b === rB) return n;
  }
  return null;
};
const tailNFA = n => cached('table-tail|' + n, () => NFA.encodeSpec({
  startState: { k: 0 },
  transition: (s, value) => {
    if (s.k === 0) return { k: 1, rA: value };
    if (s.k === 1) {
      const len = lengthFromCounters(s.rA, value);
      if (len === null || len > MAX_LEN) return undefined;
      return { k: 2, used: n <= len };
    }
    if (s.k === 2) {
      if (s.used) return value === T_NONE ? undefined : { k: 3, used: true };
      return value === T_NONE ? { k: 3, used: false } : undefined;
    }
    if (s.k !== 3) return undefined;
    return (s.used || value === 1) ? { done: true } : undefined;
  },
  accept: s => s.done === true,
}, NV));
const tableTail = [];
for (let n = 1; n <= MAX_LEN; n++) {
  tableTail.push(new NFA(tailNFA(n), 'table-length',
    posA.at(CUPCAKE), posB.at(CUPCAKE), tableH(n), tableL(n)));
}

// --- Variables and domains ------------------------------------------------
const range = (lo, hi) => Array.from({ length: hi - lo + 1 }, (_, n) => lo + n);
const layers = [
  posA.toVar('position mod ' + MOD_A),
  posB.toVar('position mod ' + MOD_B),
  boost.toVar('booster cells'),
  valH.toVar('value, high part'),
  valL.toVar('value, low part'),
  new Var('S', 'path steps', steps.length),
  new Var('D', 'booster digit by row', 9),
  new Var('T', 'sequence value, high part', MAX_LEN),
  new Var('U', 'sequence value, low part', MAX_LEN),
  new Var('P', 'starfruit total, high part'),
  new Var('Q', 'starfruit total, low part'),
];
const domains = [
  graph.makeReplicate(new Given(gridCells[0], ...range(1, 9))),
  // VA needs no domain of its own: the sentinel plus MOD_A residues is exactly
  // the 16-value alphabet.
  posB.makeReplicate(new Given(posB.at(gridCells[0]), ...range(1, MOD_B + 1))),
  boost.makeReplicate(new Given(boost.at(gridCells[0]), 1, 2)),
  valH.makeReplicate(new Given(valH.at(gridCells[0]), ...range(1, MAX_VALUE / 9))),
  valL.makeReplicate(new Given(valL.at(gridCells[0]), ...range(1, 9))),
  // The step Vars need no domain of their own: the path-cell machines accept
  // no value on them but unused / in / out, for either rat.
  ...range(1, 9).map(n => new Given(rowDigit(n), ...range(1, 9))),
  ...range(1, MAX_LEN).map(n => new Given(tableH(n), ...range(1, T_NONE))),
  ...range(1, MAX_LEN).map(n => new Given(tableL(n), ...range(1, 9))),
  // The largest possible starfruit total is 27 + 27 = 54 = 9 * 6.
  new Given(STAR_H, ...range(1, 6)),
  new Given(STAR_L, ...range(1, 9)),
  // Each rat's own cell is the first cell of its path.
  ...RAT_CELLS.flatMap(cell => [
    new Given(posA.at(cell), FIRST), new Given(posB.at(cell), FIRST)]),
];

return [
  shape,
  ...layers,
  ...domains,
  ...boosterHouses,
  new AllDifferent(...range(1, 9).map(rowDigit)),
  ...boosterDigits,
  ...cellValues,
  ...blackcurrants,
  ...starfruit,
  ...pathShape,
  ...counters,
  ...noCross,
  ...sequence,
  ...tableTail,
];
