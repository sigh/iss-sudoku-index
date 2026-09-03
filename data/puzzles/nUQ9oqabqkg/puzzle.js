// Title: The 'No-9 Line'
// Author: Timpanist
// Video: https://www.youtube.com/watch?v=nUQ9oqabqkg
// Source: https://sudokupad.app/185kxmxozs

// Normal sudoku. A single closed loop moves orthogonally between cell centres,
// does not branch or intersect itself, and visits every cell except the nine
// cells containing a 9. The 3x3 box borders divide the loop into segments;
// within a box every segment has the same sum (which may vary from box to box),
// and every box has at least two segments. No two adjacent cells directly
// connected by the loop may sum to 9.
//
// Membership is read straight off the digits: the loop visits a cell exactly
// when its digit is not 9, so it is a closed tour of the 72 non-9 cells.
// Nothing in the rules forbids the loop from running alongside itself (two
// orthogonally adjacent cells with no loop step between them), and with 72 of
// 81 cells on the loop that is unavoidable, so "does not branch or intersect
// itself" is modelled as a per-cell degree rule over the loop's own steps
// rather than as a no-touch rule.
//
// Nothing is omitted.

const UNUSED = 1, FWD = 2, BWD = 3;  // a step is unused, or runs a->b or b->a
const MOD_A = 8, MOD_B = 9;          // the two loop-position moduli
const OFF_POS = 1;                   // position pinned on cells off the loop
const OFF_DIGIT = 9;                 // the digit the loop skips
const BOX_TOTAL = 36;                // 1+2+...+8: a box's loop digits

const graph = cellGraph('9x9');
const geometry = graph.gridGeometry();
const gridCells = graph.cells();

// Position along the loop, mod 8 and mod 9. Value v means position v-1.
const posA = graph.makeOverlay('VA');
const posB = graph.makeOverlay('VB');

// --- Steps ---------------------------------------------------------------
// One Var per orthogonally adjacent pair of cells, recording whether the loop
// uses that pair and in which direction. Direction is what the position
// counters below need; right/down steps from each cell cover every pair once.
const steps = [];
const stepsAt = new Map(gridCells.map(cell => [cell, []]));
for (const cell of gridCells) {
  for (const [dR, dC] of [[0, 1], [1, 0]]) {
    const other = graph.step(cell, dR, dC);
    if (!other) continue;
    const id = 'VS' + (steps.length + 1);
    steps.push({ id, a: cell, b: other });
    stepsAt.get(cell).push({ id, out: FWD, in: BWD });
    stepsAt.get(other).push({ id, out: BWD, in: FWD });
  }
}
const stepBetween = (p, q) =>
  steps.find(s => (s.a === p && s.b === q) || (s.a === q && s.b === p));

// --- Loop membership and degree ------------------------------------------
// Reads a cell's digit, then each step it is an endpoint of. A cell holding 9
// is off the loop and uses no step; every other cell is entered once and left
// once, which is what makes the route non-branching and self-intersection-free.
const degreeNFA = incident => NFA.encodeSpec({
  startState: { k: 0 },
  transition: (s, value) => {
    if (s.k === 0) return { k: 1, on: value !== OFF_DIGIT, in: 0, out: 0 };
    if (s.k > incident.length) return undefined;
    const step = incident[s.k - 1];
    let { in: nIn, out: nOut } = s;
    if (value === step.in) nIn++;
    else if (value === step.out) nOut++;
    else if (value !== UNUSED) return undefined;
    if (nIn > 1 || nOut > 1) return undefined;
    return { k: s.k + 1, on: s.on, in: nIn, out: nOut };
  },
  accept: s => s.k === incident.length + 1 &&
    (s.on ? (s.in === 1 && s.out === 1) : (s.in === 0 && s.out === 0)),
}, geometry.numValues);
const degrees = gridCells.map(cell => {
  const incident = stepsAt.get(cell);
  return new NFA(degreeNFA(incident), 'loop-degree',
    cell, ...incident.map(s => s.id));
});

// --- Position counters ----------------------------------------------------
// Degree alone leaves the used steps as any disjoint union of directed cycles
// covering the non-9 cells. Numbering the loop 0, 1, 2, ... along its direction
// of travel is always possible, so requiring the arriving cell's position to be
// the leaving cell's plus one (mod m) adds nothing; but it forces every cycle's
// length to be divisible by m. lcm(8, 9) = 72 and the non-9 cells number exactly
// 72 (one 9 per row), so a second cycle would have to be 72 cells long as well.
// One cycle is all that survives.
const nextPos = (v, mod) => 1 + (v % mod);
const counterNFA = mod => NFA.encodeSpec({
  startState: { k: 0 },
  transition: (s, value) => {
    if (s.k === 0) return { k: 1, dir: value };
    if (s.k === 1) return { k: 2, dir: s.dir, a: value };
    if (s.k !== 2) return undefined;
    if (s.dir === UNUSED) return { done: true };
    if (s.dir === FWD) return value === nextPos(s.a, mod) ? { done: true } : undefined;
    return s.a === nextPos(value, mod) ? { done: true } : undefined;
  },
  accept: s => s.done === true,
}, geometry.numValues);
const counterA = counterNFA(MOD_A), counterB = counterNFA(MOD_B);
const counters = steps.flatMap(s => [
  new NFA(counterA, 'loop-position', s.id, posA.at(s.a), posA.at(s.b)),
  new NFA(counterB, 'loop-position', s.id, posB.at(s.a), posB.at(s.b)),
]);

// A cell off the loop carries no position, so pin it to one value rather than
// leaving nine spare assignments per omitted cell. Key: digit 9 forces OFF_POS.
const offPosKey = Pair.fnToKey(
  (digit, pos) => digit !== OFF_DIGIT || pos === OFF_POS, geometry.numValues);
const offPositions = gridCells.flatMap(cell => [
  new Pair(offPosKey, 'off-loop-position', cell, posA.at(cell)),
  new Pair(offPosKey, 'off-loop-position', cell, posB.at(cell)),
]);

// --- Seam -----------------------------------------------------------------
// Numbering a closed loop is free to start anywhere and run either way, an
// artifact of the counters above rather than of the puzzle. Both are pinned at
// the first cell of the grid that is on the loop: R1C1, or R1C2 when R1C1 holds
// the row's 9. R1C1 takes position 0 either way -- as the seam when it is on the
// loop, and as an off-loop cell otherwise.
const seamStarts = [
  new Given(posA.at('R1C1'), OFF_POS),
  new Given(posB.at('R1C1'), OFF_POS),
  new Pair(offPosKey, 'loop-seam', 'R1C1', posA.at('R1C2')),
  new Pair(offPosKey, 'loop-seam', 'R1C1', posB.at('R1C2')),
];
// Direction: the seam cell leaves along its rightward step. R1C1 is a corner, so
// when it is on the loop both of its steps are used and one of the two
// directions runs R1C1 -> R1C2; when it is off, R1C2's only other neighbours are
// R1C3 and R2C2, so the step to R1C3 is used and one direction runs that way.
const seamDirection = new NFA(NFA.encodeSpec({
  startState: { k: 0 },
  transition: (s, value) => {
    if (s.k === 0) return { k: 1, on: value !== OFF_DIGIT };
    if (s.k === 1) return (s.on && value !== FWD) ? undefined : { k: 2, on: s.on };
    if (s.k !== 2) return undefined;
    return (!s.on && value !== FWD) ? undefined : { k: 3 };
  },
  accept: s => s.k === 3,
}, geometry.numValues), 'loop-seam',
  'R1C1', stepBetween('R1C1', 'R1C2').id, stepBetween('R1C2', 'R1C3').id);

// --- No two loop-joined cells sum to 9 ------------------------------------
// Reads the step, then its two cells. An unused step relates nothing.
const noNineSpec = NFA.encodeSpec({
  startState: { k: 0 },
  transition: (s, value) => {
    if (s.k === 0) return { k: 1, free: value === UNUSED };
    if (s.k === 1) return s.free ? { k: 2, free: true } : { k: 2, free: false, a: value };
    if (s.k !== 2) return undefined;
    return (s.free || s.a + value !== 9) ? { k: 3 } : undefined;
  },
  accept: s => s.k === 3,
}, geometry.numValues);
const noNines = steps.map(
  s => new NFA(noNineSpec, 'no-9-sum-across-a-step', s.id, s.a, s.b));

// --- Box segments ---------------------------------------------------------
// A segment is a maximal run of consecutive loop cells inside one box, so two
// cells of a box share a segment exactly when the loop uses the step between
// them: a box's segments are the connected components of its eight non-9 cells
// under the used steps that stay inside the box, and each is a simple path.
//
// A box holds 1-9 once and its 9 is its only off-loop cell, so its loop cells
// carry the digits 1-8 and total 36. With k segments of common sum S, kS = 36
// and k >= 2, so k is 2, 3, 4 or 6. Six segments need sizes totalling 8, hence
// at least four single-cell segments, each of which would have to be the digit
// 6 -- impossible twice over in one box. Four segments need S = 9; no single
// digit of 1-8 is 9, so every segment has at least two cells, four such
// segments over eight cells makes them all pairs, and each pair is joined by a
// loop step and sums to 9, which the no-9 rule forbids. So k is 2 (S = 18,
// segment sizes {3,5} or {4,4}: two cells reach at most 8+7) or 3 (S = 12,
// sizes {2,2,4} or {2,3,3}: one cell cannot reach 12). Each branch below is one
// such cut of one box; a path forest on 8 cells with k components uses 8 - k
// edges.
const SEGMENT_SHAPES = [
  [2, new Set(['3,5', '4,4'])],
  [3, new Set(['2,2,4', '2,3,3'])],
];

// All ways to choose `pick` of `items`.
const combinations = (items, pick) => {
  if (pick === 0) return [[]];
  if (items.length < pick) return [];
  const [first, ...rest] = items;
  return [
    ...combinations(rest, pick - 1).map(c => [first, ...c]),
    ...combinations(rest, pick),
  ];
};

// The components of `on` under `used`, or null when `used` is not a path forest
// on `on`: a cell needs degree <= 2, and a cell with `outside` neighbours beyond
// the box has at most that many of its two loop steps leaving the box, so its
// degree inside the box is at least 2 - outside.
const pathComponents = (on, used, outside) => {
  const degree = new Map(on.map(cell => [cell, 0]));
  const parent = new Map(on.map(cell => [cell, cell]));
  const find = cell => {
    while (parent.get(cell) !== cell) cell = parent.get(cell);
    return cell;
  };
  for (const { a, b } of used) {
    degree.set(a, degree.get(a) + 1);
    degree.set(b, degree.get(b) + 1);
    if (degree.get(a) > 2 || degree.get(b) > 2) return null;
    const [ra, rb] = [find(a), find(b)];
    if (ra === rb) return null;  // a cycle, not a path
    parent.set(ra, rb);
  }
  for (const cell of on) {
    if (degree.get(cell) < 2 - outside.get(cell)) return null;
  }
  const components = new Map();
  for (const cell of on) {
    const root = find(cell);
    if (!components.has(root)) components.set(root, []);
    components.get(root).push(cell);
  }
  return [...components.values()];
};

const boxSegments = graph.boxes().map(boxCells => {
  const inBox = new Set(boxCells);
  const intra = steps.filter(s => inBox.has(s.a) && inBox.has(s.b));
  const outside = new Map(boxCells.map(
    cell => [cell, graph.neighbours(cell).filter(n => !inBox.has(n)).length]));
  const branches = [];
  for (const off of boxCells) {
    const on = boxCells.filter(cell => cell !== off);
    const avail = intra.filter(s => s.a !== off && s.b !== off);
    for (const [k, sizes] of SEGMENT_SHAPES) {
      for (const used of combinations(avail, on.length - k)) {
        const components = pathComponents(on, used, outside);
        if (!components || components.length !== k) continue;
        const shape = components.map(c => c.length).sort((x, y) => x - y).join(',');
        if (!sizes.has(shape)) continue;
        const usedIds = new Set(used.map(s => s.id));
        branches.push(new And([
          new Given(off, OFF_DIGIT),
          ...avail.map(s => usedIds.has(s.id)
            ? new Given(s.id, FWD, BWD)
            : new Given(s.id, UNUSED)),
          ...components.map(c => new Sum(BOX_TOTAL / k, ...c)),
        ]));
      }
    }
  }
  return new Or(branches);
});

return [
  new Shape('9x9'),
  new Var('S', 'loop steps', steps.length),
  posA.toVar('loop position mod ' + MOD_A),
  posB.toVar('loop position mod ' + MOD_B),
  // Position values run 1..MOD; the mod 9 layer already spans the whole range.
  posA.makeReplicate(new Given(posA.at(gridCells[0]), 1, 2, 3, 4, 5, 6, 7, 8)),
  new Given('R1C4', 2),
  new Given('R2C2', 7),
  new Given('R5C6', 2),
  new Given('R7C8', 5),
  new Given('R8C6', 6),
  new Given('R9C5', 2),
  ...degrees,
  ...counters,
  ...offPositions,
  ...seamStarts,
  seamDirection,
  ...noNines,
  ...boxSegments,
];
