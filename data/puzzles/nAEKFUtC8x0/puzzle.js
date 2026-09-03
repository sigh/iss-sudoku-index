// Title: RAT RUN 16: Schrodinger's Rat
// Author: Marty Sears
// Video: https://www.youtube.com/watch?v=nAEKFUtC8x0
// Source: https://sudokupad.app/fi311m5b4u

// Rules encoded here:
//  1. SCHRODINGER CELLS. Each row, column and box is filled with the digits 0-9
//     once each. Nine cells hold ten digits because exactly one cell of each row,
//     column and box is a Schrodinger cell carrying two digits. A Schrodinger
//     cell's value is the sum of its two digits; any other cell's value is its
//     digit, so values run 0-17.
//  2. AIM OF EXPERIMENT. Finkz starts on R9C1 and must reach the cupcake on
//     R1C9. The path visits no cell more than once, never crosses itself, and
//     passes through no thick maze wall.
//  3. A step is orthogonal, or diagonal when there is a 2x2 space to do it in --
//     none of that block's four inner edges walled -- and no round wall-spot sits
//     on the corner the step cuts through.
//  4. BLACKCURRANTS. Two values separated by a blackcurrant have a 1:2 ratio.
//  5. ONE-WAY DOORS. Finkz may pass directly through a purple arrow only in the
//     direction it points, and a purple arrow points at the smaller of the two
//     values it sits between.
//  6. TEST CONSTRAINT. The dotted box borders cut the path into segments -- every
//     box border is drawn dotted, so a segment is a maximal run of consecutive
//     path cells inside one box. Each segment holds at least 2 cells, the values
//     of two cells adjacent along the path within a segment always differ by the
//     same amount, and no two segments share that amount.
// Nothing is omitted.

// The alphabet is widened to sixteen values, 0-15, so that the overlays can carry
// the position counters and the split values; the 81 grid cells are pinned back
// to the digits 0-9 below.
const shape = new Shape('9x9', '0-15');
const graph = cellGraph(shape);
const gridCells = graph.cells();
const range = (lo, hi) => Array.from({ length: hi - lo + 1 }, (_, n) => lo + n);
const DIGITS = range(0, 9);

const NONE = 10;                // second-digit layer: this cell holds one digit
const MAX_VALUE = 17;           // 8 + 9, the largest Schrodinger sum

const MOD_A = 15, MOD_B = 11;   // coprime: a spurious cycle would need 165 cells
const OFF = 0;                  // counter value for a cell the path misses
const FIRST = 1;                // counter value of the path's first cell
// Step values. A step is stored once, on the (a, b) pair built below; FWD means
// Finkz walked a->b and BWD b->a, so the counters can tell direction.
const UNUSED = 0, FWD = 1, BWD = 2;

const NO_RUN = 0;               // segment label of a cell the path misses
// A segment lies inside one box and holds at least 2 cells, so a box holds at
// most four of them; each is labelled 1-4 within its box.
const MAX_RUNS = 4;
const UNUSED_DIFF = 2;          // VD sentinel: this (box, label) is not a segment

const RAT = 'R9C1';             // the rat emoji
const CUPCAKE = 'R1C9';         // the cupcake emoji

// --- The drawn maze -------------------------------------------------------
// Corner (i, j) is the top-left corner of cell RiCj, so the lattice runs 1..10.
// WALLS holds the twenty thick cyan polylines exactly as drawn, the outer frame
// included; SPOTS holds the 33 round cyan wall-spots, each on a lattice corner.
const WALLS = [
  [[2, 2], [6, 2]],
  [[4, 2], [4, 4], [6, 4]],
  [[8, 2], [7, 2], [7, 4], [10, 4], [10, 10], [1, 10], [1, 6], [3, 6]],
  [[7, 3], [5, 3]],
  [[7, 4], [7, 5]],
  [[10, 4], [10, 1], [9, 1], [9, 3], [8, 3]],
  [[10, 7], [9, 7]],
  [[6, 10], [6, 9]],
  [[1, 6], [1, 4], [2, 4]],
  [[9, 1], [1, 1], [1, 4]],
  [[3, 3], [3, 5], [2, 5]],
  [[2, 7], [4, 7], [4, 8]],
  [[4, 7], [4, 5]],
  [[5, 6], [6, 6]],
  [[7, 6], [7, 7], [8, 7]],
  [[7, 7], [6, 7]],
  [[8, 5], [9, 5]],
  [[8, 6], [9, 6]],
  [[5, 7], [5, 8], [6, 8]],
  [[5, 8], [5, 9], [4, 9]],
];
const SPOTS = [
  [2, 2], [2, 4], [2, 5], [2, 7], [3, 3], [3, 5], [3, 6], [4, 4], [4, 5],
  [4, 8], [4, 9], [5, 3], [5, 6], [5, 7], [5, 9], [6, 2], [6, 4], [6, 6],
  [6, 7], [6, 8], [6, 9], [7, 2], [7, 5], [7, 6], [8, 2], [8, 3], [8, 5],
  [8, 6], [8, 7], [9, 3], [9, 5], [9, 6], [9, 7],
];
// The ten black dots, each on the edge between the two cells it joins.
const BLACKCURRANTS = [
  ['R1C1', 'R2C1'], ['R2C7', 'R2C8'], ['R3C8', 'R3C9'], ['R3C9', 'R4C9'],
  ['R4C5', 'R4C6'], ['R4C4', 'R5C4'], ['R5C2', 'R6C2'], ['R7C7', 'R7C8'],
  ['R7C9', 'R8C9'], ['R9C5', 'R9C6'],
];
// The two purple chevrons, written [from, to] in the direction the tip points.
const ARROWS = [['R2C2', 'R3C2'], ['R3C6', 'R2C6']];

// --- Overlays -------------------------------------------------------------
const second = graph.makeOverlay('VS');   // second digit, NONE when there is none
const valH = graph.makeOverlay('VH');     // value = 9 * VH + VL, so 0..17
const valL = graph.makeOverlay('VL');
const posA = graph.makeOverlay('VA');     // position along the path mod 15
const posB = graph.makeOverlay('VB');     // position along the path mod 11
const seg = graph.makeOverlay('VG');      // segment label within the cell's box

// Split the wall polylines into unit lattice segments: 'H|i|j' runs from corner
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
// One Var per legal king move; a move the maze forbids gets no variable at all,
// which is how the walls reach the solver.
const STEP_DIRS = [[0, 1], [1, 0], [1, 1], [1, -1]];
const boxOf = new Map();
graph.boxes().forEach((box, n) => box.forEach(cell => boxOf.set(cell, n + 1)));
const steps = [];
const stepsAt = new Map(gridCells.map(cell => [cell, []]));
for (const cell of gridCells) {
  for (const [dRow, dCol] of STEP_DIRS) {
    const other = graph.step(cell, dRow, dCol);
    if (!other || !stepAllowed(cell, dRow, dCol)) continue;
    const id = 'VT' + (steps.length + 1);
    const inBox = boxOf.get(cell) === boxOf.get(other);
    steps.push({ id, a: cell, b: other, inBox });
    stepsAt.get(cell).push({ id, out: FWD, in: BWD });
    stepsAt.get(other).push({ id, out: BWD, in: FWD });
  }
}
const stepIndex = new Map(steps.map(s => [s.a + '|' + s.b, s.id]));
// A step whose two cells share a box crosses no dotted border, so it runs inside
// one segment. VP<n> carries that segment's label, or NO_RUN when the step is
// unused; it exists so the per-box machines below can read a step's label
// without re-reading a cell they have already scanned.
const inBoxSteps = steps.filter(s => s.inBox);
inBoxSteps.forEach((s, n) => { s.segId = 'VP' + (n + 1); });
const inBoxStepsOfBox = graph.boxes().map(
  (_, n) => inBoxSteps.filter(s => boxOf.get(s.a) === n + 1));

const memo = new Map();
const cached = (key, build) => {
  if (!memo.has(key)) memo.set(key, build());
  return memo.get(key);
};

// --- Rule 1: Schrodinger sudoku -------------------------------------------
// Over a house's nine grid cells and their nine VS cells: each of 0-9 once and
// NONE eight times. That single statement gives all ten digits, exactly one cell
// with a second digit, and two different digits in it.
const HOUSE_MULTISET = [...DIGITS, ...Array(8).fill(NONE)].join('_');
const houses = graph.rowsColumnsBoxes().map(cells =>
  new ContainExact(HOUSE_MULTISET, ...cells, ...second.at(cells)));

// Which of a Schrodinger cell's two digits sits in the grid and which on VS is an
// artifact of splitting them across two layers, not something the puzzle
// distinguishes. Keep the smaller in the grid so each answer has one form.
const digitOrder = gridCells.map(cell => new Pair(
  Pair.fnToKey((d, s) => s === NONE || d < s, shape),
  'grid holds the smaller digit', cell, second.at(cell)));

// value = digit + second digit, held as 9 * VH + VL because 0..17 does not fit
// one cell of a sixteen-value alphabet.
const valueNFA = cached('value', () => NFA.encodeSpec({
  startState: { k: 0 },
  transition: (s, value) => {
    if (s.k === 0) return value > 9 ? undefined : { k: 1, d: value };
    if (s.k === 1) {
      return { k: 2, v: s.d + (value === NONE ? 0 : value) };
    }
    if (s.k === 2) {
      const want = s.v - 9 * value;
      return (value > 1 || want < 0 || want > 8) ? undefined : { k: 3, want };
    }
    if (s.k !== 3) return undefined;
    return value === s.want ? { done: true } : undefined;
  },
  accept: s => s.done === true,
}, shape));
const cellValues = gridCells.map(cell => new NFA(valueNFA, 'cell-value',
  cell, second.at(cell), valH.at(cell), valL.at(cell)));

// --- Rules 2 and 3: the path ----------------------------------------------
// Per-cell machine: reads the cell's two counters, then every step it is an end
// of. A cell the path misses takes the OFF counter and uses no step; a visited
// cell is entered once and left once. Finkz's cell is only left, the cupcake's
// only entered.
const ROLE_OF = new Map([[RAT, 'rat'], [CUPCAKE, 'cupcake']]);
const cellNFA = (incident, role) => {
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
      if (role === 'rat') return s.vis && s.out === 1 && s.in === 0;
      if (role === 'cupcake') return s.vis && s.in === 1 && s.out === 0;
      if (!s.vis) return s.in === 0 && s.out === 0;
      return s.in === 1 && s.out === 1;
    },
  }, shape));
};
const pathShape = gridCells.map(cell => {
  const incident = stepsAt.get(cell);
  return new NFA(cellNFA(incident, ROLE_OF.get(cell) || 'plain'), 'path-cell',
    posA.at(cell), posB.at(cell), ...incident.map(s => s.id));
});

// Position counters. Numbering a real path 1, 2, 3, ... from Finkz's cell is
// always possible, so "the arriving cell's counter is the leaving cell's plus
// one" adds nothing; what it buys is that a closed cycle of steps beside the path
// would need a length divisible by 15 and by 11, i.e. by 165, and there are only
// 81 cells. Degree alone cannot rule such a cycle out.
const nextPos = (v, mod) => FIRST + ((v - FIRST + 1) % mod);
const counterNFA = mod => cached('counter|' + mod, () => NFA.encodeSpec({
  startState: { k: 0 },
  transition: (s, value) => {
    if (s.k === 0) return value > BWD ? undefined : { k: 1, dir: value };
    if (s.k === 1) return value > mod ? undefined : { k: 2, dir: s.dir, a: value };
    if (s.k !== 2) return undefined;
    if (value > mod) return undefined;
    if (s.dir === UNUSED) return { done: true };
    if (s.a === OFF || value === OFF) return undefined;
    return (s.dir === FWD ? value === nextPos(s.a, mod)
      : s.a === nextPos(value, mod)) ? { done: true } : undefined;
  },
  accept: s => s.done === true,
}, shape));
const counters = steps.flatMap(s => [
  new NFA(counterNFA(MOD_A), 'path-order', s.id, posA.at(s.a), posA.at(s.b)),
  new NFA(counterNFA(MOD_B), 'path-order', s.id, posB.at(s.a), posB.at(s.b)),
]);

// The two diagonals of a 2x2 block cross each other, and the path may not cross
// itself.
const noCrossKey = cached('no-cross',
  () => Pair.fnToKey((x, y) => x === UNUSED || y === UNUSED, shape));
const noCross = gridCells.flatMap(cell => {
  const right = graph.step(cell, 0, 1);
  const down = graph.step(cell, 1, 0);
  const diag = graph.step(cell, 1, 1);
  if (!right || !down || !diag) return [];
  const d1 = stepIndex.get(cell + '|' + diag);
  const d2 = stepIndex.get(right + '|' + down);
  return (d1 && d2) ? [new Pair(noCrossKey, 'no-crossing', d1, d2)] : [];
});

// --- Rule 4: blackcurrants ------------------------------------------------
// Reads the two split values and checks that one is twice the other.
const ratioNFA = cached('ratio', () => NFA.encodeSpec({
  startState: { k: 0 },
  transition: (s, value) => {
    if (s.k === 0) return value > 1 ? undefined : { k: 1, h: value };
    if (s.k === 1) return value > 8 ? undefined : { k: 2, x: 9 * s.h + value };
    if (s.k === 2) return value > 1 ? undefined : { k: 3, x: s.x, h: value };
    if (s.k !== 3) return undefined;
    if (value > 8) return undefined;
    const y = 9 * s.h + value;
    return (s.x === 2 * y || y === 2 * s.x) ? { done: true } : undefined;
  },
  accept: s => s.done === true,
}, shape));
const blackcurrants = BLACKCURRANTS.map(([x, y]) => new NFA(ratioNFA,
  'blackcurrant', valH.at(x), valL.at(x), valH.at(y), valL.at(y)));

// --- Rule 5: one-way doors ------------------------------------------------
// The arrow points at the smaller value, so the value it points to is less than
// the value behind it.
const lessThanNFA = cached('less-than', () => NFA.encodeSpec({
  startState: { k: 0 },
  transition: (s, value) => {
    if (s.k === 0) return value > 1 ? undefined : { k: 1, h: value };
    if (s.k === 1) return value > 8 ? undefined : { k: 2, x: 9 * s.h + value };
    if (s.k === 2) return value > 1 ? undefined : { k: 3, x: s.x, h: value };
    if (s.k !== 3) return undefined;
    if (value > 8) return undefined;
    return s.x < 9 * s.h + value ? { done: true } : undefined;
  },
  accept: s => s.done === true,
}, shape));
// Each arrow sits on an orthogonal edge, so it restricts that edge's own step
// variable: only the direction the tip points is left in the domain.
const doors = ARROWS.flatMap(([from, to]) => {
  const forward = stepIndex.get(from + '|' + to);
  return [
    new NFA(lessThanNFA, 'one-way-door',
      valH.at(to), valL.at(to), valH.at(from), valL.at(from)),
    forward ? new Given(forward, UNUSED, FWD)
      : new Given(stepIndex.get(to + '|' + from), UNUSED, BWD),
  ];
});

// --- Rule 6: the test constraint ------------------------------------------
// A cell carries a segment label exactly when the path visits it.
const labelledIffVisited = gridCells.map(cell => new Pair(
  Pair.fnToKey((p, g) => (p === OFF) === (g === NO_RUN), shape),
  'labelled iff visited', posA.at(cell), seg.at(cell)));

// A used in-box step joins two cells of one segment, so both its ends and its own
// VP carry that label; an unused one carries NO_RUN.
const stepLabelNFA = cached('step-label', () => NFA.encodeSpec({
  startState: { k: 0 },
  transition: (s, value) => {
    if (s.k === 0) return value > BWD ? undefined : { k: 1, used: value !== UNUSED };
    if (s.k === 1) return value > MAX_RUNS ? undefined : { k: 2, used: s.used, g: value };
    if (s.k === 2) {
      return (s.used && value !== s.g) ? undefined : { k: 3, used: s.used, g: s.g };
    }
    if (s.k !== 3) return undefined;
    if (s.used) return (value === s.g && value !== NO_RUN) ? { done: true } : undefined;
    return value === NO_RUN ? { done: true } : undefined;
  },
  accept: s => s.done === true,
}, shape));
const stepLabels = inBoxSteps.map(s => new NFA(stepLabelNFA, 'step-label',
  s.id, seg.at(s.a), seg.at(s.b), s.segId));

// Segment identity is the pair (box, label), so the segment differences live in a
// table of one entry per pair, split as the values are: 9 * VD + VE, with VD set
// to UNUSED_DIFF where that pair names no segment.
const entry = (box, label) => (box - 1) * MAX_RUNS + label;
const diffH = n => 'VD' + n;
const diffL = n => 'VE' + n;
const NUM_ENTRIES = graph.boxes().length * MAX_RUNS;

// Per (box, label): the labelled cells of the box and the used in-box steps that
// carry the label must make a single run of at least two cells. Both are read in
// one scan and only their difference is carried: a set of path cells joined by
// used steps is a disjoint union of subpaths, so cells - steps counts its pieces,
// and one piece is what "a segment" means. Zero cells and zero steps is the
// (box, label) pair that names no segment, which is also when its table entry
// must be the sentinel.
const runNFA = (numCells, numSteps, label) => cached(
  `run|${numCells}|${numSteps}|${label}`, () => NFA.encodeSpec({
    startState: { i: 0 },
    transition: (s, value) => {
      if (s.i === 0) {
        return value > UNUSED_DIFF
          ? undefined : { i: 1, used: value !== UNUSED_DIFF, n: 0 };
      }
      if (value > MAX_RUNS) return undefined;
      if (s.i <= numCells) {
        const n = s.n + (value === label ? 1 : 0);
        if (s.i < numCells) return { i: s.i + 1, used: s.used, n };
        // The last cell has been read, so the piece count can start: an empty
        // pair names no segment and so carries the sentinel entry, a real one
        // holds at least two cells and needs a real entry.
        if (n === 0) return s.used ? undefined : { i: s.i + 1, d: 0 };
        if (n === 1 || !s.used) return undefined;
        return { i: s.i + 1, d: n };
      }
      if (s.i > numCells + numSteps) return undefined;
      if (value !== label) return { i: s.i + 1, d: s.d };
      return s.d <= 1 ? undefined : { i: s.i + 1, d: s.d - 1 };
    },
    accept: s => s.i === numCells + numSteps + 1 && s.d <= 1,
  }, shape));
const segmentRuns = graph.boxes().flatMap((box, n) => {
  const boxSteps = inBoxStepsOfBox[n];
  return range(1, MAX_RUNS).map(label => new NFA(
    runNFA(box.length, boxSteps.length, label), 'segment-run',
    diffH(entry(n + 1, label)), ...seg.at(box), ...boxSteps.map(s => s.segId)));
});

// Labels within a box are interchangeable, which is an artifact of the overlay
// and not something the puzzle distinguishes: pin them to first-use order in
// reading order so each answer has one form.
const labelOrderNFA = cached('label-order', () => NFA.encodeSpec({
  startState: { max: 0 },
  transition: (s, value) =>
    (value > MAX_RUNS || value > s.max + 1) ? undefined
      : { max: Math.max(s.max, value) },
  accept: () => true,
}, shape));
const labelOrder = graph.boxes().map(
  box => new NFA(labelOrderNFA, 'label-order', ...seg.at(box)));

// Two cells adjacent along the path inside one segment differ by that segment's
// amount. The rules' example reads a segment as a sequence of values, so
// "adjacent" is adjacent along the path, and the difference is unsigned -- the
// example's 1, 3, 5, 7 and its reverse are both a difference of 2.
// `on` says the step carries this label; when it does not the machine reads the
// rest of the scan without imposing anything.
const stepDiffNFA = label => cached('step-diff|' + label, () => NFA.encodeSpec({
  startState: { k: 0 },
  transition: (s, value) => {
    if (s.k === 0) {
      return value > MAX_RUNS ? undefined : { k: 1, on: value === label };
    }
    if (s.k === 1) return value > 1 ? undefined : { k: 2, on: s.on, h: value };
    if (s.k === 2) {
      return value > 8 ? undefined : { k: 3, on: s.on, x: 9 * s.h + value };
    }
    if (s.k === 3) return value > 1 ? undefined : { k: 4, on: s.on, x: s.x, h: value };
    if (s.k === 4) {
      if (value > 8) return undefined;
      return { k: 5, on: s.on, diff: Math.abs(s.x - (9 * s.h + value)) };
    }
    if (s.k === 5) {
      if (value > UNUSED_DIFF) return undefined;
      if (!s.on) return { k: 6, want: null };
      if (value === UNUSED_DIFF) return undefined;
      const want = s.diff - 9 * value;
      return (want < 0 || want > 8) ? undefined : { k: 6, want };
    }
    if (s.k !== 6) return undefined;
    if (value > 8) return undefined;
    return (s.want === null || value === s.want) ? { k: 7 } : undefined;
  },
  accept: s => s.k === 7,
}, shape));
const stepDiffs = inBoxSteps.flatMap(s => range(1, MAX_RUNS).map(label => {
  const n = entry(boxOf.get(s.a), label);
  return new NFA(stepDiffNFA(label), 'segment-difference', s.segId,
    valH.at(s.a), valL.at(s.a), valH.at(s.b), valL.at(s.b), diffH(n), diffL(n));
}));

// No two segments share their difference. The amounts run 0-17 and so are split
// over two cells, which AllDifferent cannot read: one machine per pair of table
// entries states it instead.
// A null running value is the sentinel entry, which names no segment and so has
// nothing to be distinct from.
const distinctNFA = cached('distinct-diff', () => NFA.encodeSpec({
  startState: { k: 0 },
  transition: (s, value) => {
    if (s.k === 0) {
      return value > UNUSED_DIFF ? undefined
        : { k: 1, x: value === UNUSED_DIFF ? null : 9 * value };
    }
    if (s.k === 1) {
      return value > 8 ? undefined
        : { k: 2, x: s.x === null ? null : s.x + value };
    }
    if (s.k === 2) {
      return value > UNUSED_DIFF ? undefined
        : { k: 3, x: s.x, y: value === UNUSED_DIFF ? null : 9 * value };
    }
    if (s.k !== 3) return undefined;
    if (value > 8) return undefined;
    const y = s.y === null ? null : s.y + value;
    if (s.x === null || y === null) return { k: 4 };
    return s.x !== y ? { k: 4 } : undefined;
  },
  accept: s => s.k === 4,
}, shape));
const distinctDiffs = range(1, NUM_ENTRIES).flatMap(
  i => range(i + 1, NUM_ENTRIES).map(j => new NFA(distinctNFA, 'distinct-difference',
    diffH(i), diffL(i), diffH(j), diffL(j))));

// --- Variables and domains ------------------------------------------------
const layers = [
  second.toVar('second digit of a Schrodinger cell'),
  valH.toVar('cell value, high part'),
  valL.toVar('cell value, low part'),
  posA.toVar('position along the path mod ' + MOD_A),
  posB.toVar('position along the path mod ' + MOD_B),
  seg.toVar('segment label within the box'),
  new Var('T', 'path steps', steps.length),
  new Var('P', 'segment label of an in-box step', inBoxSteps.length),
  new Var('D', 'segment difference, high part', NUM_ENTRIES),
  new Var('E', 'segment difference, low part', NUM_ENTRIES),
];
const domains = [
  graph.makeReplicate(new Given(gridCells[0], ...DIGITS)),
  second.makeReplicate(new Given(second.at(gridCells[0]), ...range(0, NONE))),
  valH.makeReplicate(new Given(valH.at(gridCells[0]), ...range(0, MAX_VALUE / 9))),
  valL.makeReplicate(new Given(valL.at(gridCells[0]), ...range(0, 8))),
  // VA needs no domain of its own: the OFF sentinel plus the MOD_A residues is
  // exactly the sixteen-value alphabet.
  posB.makeReplicate(new Given(posB.at(gridCells[0]), ...range(OFF, MOD_B))),
  seg.makeReplicate(new Given(seg.at(gridCells[0]), ...range(NO_RUN, MAX_RUNS))),
  // The VT and VP cells need no domain of their own: the path-cell machines
  // accept nothing but unused / in / out on a step, and the step-label machine
  // nothing but NO_RUN and the labels on its VP.
  ...range(1, NUM_ENTRIES).map(n => new Given(diffH(n), ...range(0, UNUSED_DIFF))),
  ...range(1, NUM_ENTRIES).map(n => new Given(diffL(n), ...range(0, 8))),
  // A table entry that names no segment carries no low part either.
  ...range(1, NUM_ENTRIES).map(n => new Pair(
    Pair.fnToKey((h, l) => h !== UNUSED_DIFF || l === 0, shape),
    'sentinel entry is pinned', diffH(n), diffL(n))),
  // Finkz's own cell is the first cell of the path.
  new Given(posA.at(RAT), FIRST), new Given(posB.at(RAT), FIRST),
];

return [
  shape,
  ...layers,
  ...domains,
  ...houses,
  ...digitOrder,
  ...cellValues,
  ...pathShape,
  ...counters,
  ...noCross,
  ...blackcurrants,
  ...doors,
  ...labelledIffVisited,
  ...stepLabels,
  ...segmentRuns,
  ...labelOrder,
  ...stepDiffs,
  ...distinctDiffs,
];
