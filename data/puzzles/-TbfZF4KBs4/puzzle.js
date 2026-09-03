// Title: RAT RUN 8: Discontinuous
// Author: Marty Sears
// Video: https://www.youtube.com/watch?v=-TbfZF4KBs4
// Source: https://sudokupad.app/etuf5ak2y4

// Normal sudoku. Finkz the rat stands on R2C1 and walks to the cupcake on R1C8.
// The path visits no cell twice, does not cross itself, and no step passes
// through a thick maze wall. A step is orthogonal, or diagonal when the 2x2
// block it cuts across has no wall between any of its four cells and carries no
// round wall-spot on the corner the step passes through.
// One cell in every row, column and box is a doubler, and the nine doublers hold
// nine different digits; a doubler's value is twice its digit, every other
// cell's value is its digit.
// Two cells joined by a blackcurrant have one value double the other. Two cells
// joined by a red X have values summing to 10, and the rat may never step
// across a red X.
// The dotted box borders cut the path into segments -- each maximal run of
// consecutive path cells lying in one box. Within a segment no two cells may
// have equal or consecutive values.
//
// "Not all possible blackcurrants/Xs have been given" is a negative-constraint
// disclaimer, not a further rule: it says only that the drawn marks are not
// exhaustive. Nothing is omitted.

const NV = 16;                 // widened alphabet: the Var layers carry path state

// Position counters. A spurious cycle beside the path would need a length
// divisible by both moduli, i.e. by 165, and the grid has only 81 cells.
const MOD_A = 15, MOD_B = 11;
const OFF = 1;                 // counter value for a cell the rat never visits
const FIRST = 2;               // counter value of the rat's own cell
// Step values. A step is stored once, on the (a, b) pair below; FWD means the
// rat walked a->b and BWD means b->a, so the counters can tell direction.
const UNUSED = 1, FWD = 2, BWD = 3;
const PLAIN = 1, DOUBLER = 2;  // the doubler flag layer

const RAT = 'R2C1';            // the rat emoji
const CUPCAKE = 'R1C8';        // the cupcake emoji

// --- The drawn maze -------------------------------------------------------
// Corner (i, j) is the top-left corner of cell RiCj, so the lattice runs 1..10.
// WALLS holds the twenty thick yellow polylines exactly as drawn, including the
// grid boundary; SPOTS holds the 42 round yellow wall-spots, each on a lattice
// corner.
const WALLS = [
  [[9, 2], [7, 2], [7, 3], [4, 3], [4, 9]],
  [[5, 3], [5, 2]],
  [[4, 5], [5, 5]],
  [[3, 5], [1, 5], [1, 10], [10, 10], [10, 1], [6, 1], [6, 2]],
  [[1, 5], [1, 1], [6, 1]],
  [[10, 4], [9, 4]],
  [[3, 1], [3, 4], [2, 4]],
  [[4, 1], [4, 2]],
  [[2, 2], [2, 3]],
  [[5, 8], [5, 9]],
  [[5, 7], [7, 7]],
  [[5, 6], [7, 6]],
  [[6, 6], [6, 5]],
  [[7, 4], [5, 4]],
  [[8, 4], [8, 5], [9, 5]],
  [[8, 5], [8, 6]],
  [[8, 9], [8, 7], [9, 7], [9, 6]],
  [[8, 3], [9, 3]],
  [[7, 8], [7, 9]],
  [[2, 6], [3, 6]],
];
const SPOTS = [
  [2, 2], [2, 3], [2, 4], [2, 6], [2, 7], [2, 8], [3, 4], [3, 5], [3, 6],
  [3, 7], [3, 8], [4, 2], [4, 3], [4, 9], [5, 2], [5, 4], [5, 5], [5, 6],
  [5, 7], [5, 8], [5, 9], [6, 2], [6, 5], [7, 2], [7, 3], [7, 4], [7, 5],
  [7, 6], [7, 7], [7, 8], [7, 9], [8, 3], [8, 4], [8, 6], [8, 7], [8, 9],
  [9, 2], [9, 3], [9, 4], [9, 5], [9, 6], [9, 7],
];
// The drawn fruit and doors, each on the edge between the two cells it joins.
const BLACKCURRANTS = [
  ['R1C1', 'R1C2'], ['R1C8', 'R1C9'], ['R2C7', 'R2C8'], ['R3C1', 'R3C2'],
  ['R4C6', 'R4C7'], ['R5C8', 'R5C9'], ['R6C4', 'R6C5'], ['R6C4', 'R7C4'],
  ['R6C5', 'R7C5'], ['R6C6', 'R7C6'], ['R7C4', 'R7C5'], ['R7C3', 'R8C3'],
  ['R8C3', 'R8C4'], ['R8C7', 'R8C8'], ['R8C8', 'R8C9'], ['R8C2', 'R9C2'],
  ['R8C8', 'R9C8'],
];
const RED_XS = [
  ['R3C5', 'R3C6'], ['R4C6', 'R5C6'], ['R4C9', 'R5C9'],
];

const shape = new Shape('9x9', NV);
const graph = cellGraph(shape);
const gridCells = graph.cells();
const posA = graph.makeOverlay('VA');   // path position mod 15
const posB = graph.makeOverlay('VB');   // path position mod 11
const segA = graph.makeOverlay('VE');   // position of the first cell of this
const segB = graph.makeOverlay('VG');   // cell's segment, in the same two layers
const dbl = graph.makeOverlay('VF');    // PLAIN / DOUBLER
const rowDigit = n => 'VD' + n;         // the doubler digit of row n

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

// A diagonal step passes through the one corner its two cells share. The 2x2
// block it cuts across is a space only if none of the four wall slots meeting
// at that corner is drawn, and the step may not pass through a wall-spot.
const cornerOpen = (i, j) => !spotSet.has(`${i}|${j}`) &&
  !wallSegments.has(`V|${i - 1}|${j}`) && !wallSegments.has(`V|${i}|${j}`) &&
  !wallSegments.has(`H|${i}|${j - 1}`) && !wallSegments.has(`H|${i}|${j}`);

// The red X edges are doors the rat may not use, so like a wall they simply
// never become a step; unlike a wall they leave their corners' diagonals alone.
const doorEdges = new Set(RED_XS.map(([x, y]) => [x, y].sort().join('|')));

// Is the (dRow, dCol) step out of `cell` a legal move?
const stepAllowed = (cell, dRow, dCol) => {
  const { row, col } = parseCellId(cell);
  if (dRow === 0) return !wallSegments.has(`V|${row}|${col + Math.max(dCol, 0)}`);
  if (dCol === 0) return !wallSegments.has(`H|${row + Math.max(dRow, 0)}|${col}`);
  return cornerOpen(row + Math.max(dRow, 0), col + Math.max(dCol, 0));
};

// --- Step variables -------------------------------------------------------
// One Var per legal king move; a move the maze forbids gets no variable at all.
const STEP_DIRS = [[0, 1], [1, 0], [1, 1], [1, -1]];
const steps = [];
const stepsAt = new Map(gridCells.map(cell => [cell, []]));
for (const cell of gridCells) {
  for (const [dRow, dCol] of STEP_DIRS) {
    const other = graph.step(cell, dRow, dCol);
    if (!other || !stepAllowed(cell, dRow, dCol)) continue;
    if (doorEdges.has([cell, other].sort().join('|'))) continue;
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
const boxOf = cell => {
  const { row, col } = parseCellId(cell);
  return Math.floor((row - 1) / 3) * 3 + Math.floor((col - 1) / 3);
};

// --- Path shape -----------------------------------------------------------
// Per-cell machine: reads the cell's two counters, then every step it is an end
// of. A cell the rat never visits takes the OFF counter and uses no step; a
// visited cell is entered once and left once. The rat's cell is only left and
// the cupcake is only entered.
const ROLE_OF = new Map([[RAT, 'rat'], [CUPCAKE, 'cupcake']]);
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
        return { k: 2, vis: s.vis, into: 0, out: 0 };
      }
      const n = s.k - 2;
      if (n >= incident.length) return undefined;
      const step = incident[n];
      const next = { k: s.k + 1, vis: s.vis, into: s.into, out: s.out };
      if (value === step.in) next.into++;
      else if (value === step.out) next.out++;
      else if (value !== UNUSED) return undefined;
      if (next.into > 1 || next.out > 1) return undefined;
      return next;
    },
    accept: s => {
      if (s.k !== 2 + incident.length) return false;
      if (role === 'rat') return s.vis && s.out === 1 && s.into === 0;
      if (role === 'cupcake') return s.vis && s.into === 1 && s.out === 0;
      if (!s.vis) return s.into === 0 && s.out === 0;
      return s.into === 1 && s.out === 1;
    },
  }, NV));
}
const pathShape = gridCells.map(cell => {
  const incident = stepsAt.get(cell);
  return new NFA(cellNFA(incident, ROLE_OF.get(cell) || 'plain'), 'path-cell',
    posA.at(cell), posB.at(cell), ...incident.map(s => s.id));
});

// Numbering a real path 1, 2, 3, ... from the rat's cell is always possible, so
// "the arriving cell's counter is the leaving cell's plus one" adds nothing on
// its own; what it buys is that a closed cycle of steps beside the path would
// need a length divisible by 15 and by 11. Degree alone cannot rule such a
// cycle out.
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

// The two diagonals of a 2x2 block cross each other, and the path may not cross
// itself.
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

// --- Path segments --------------------------------------------------------
// A segment is named by the position of its own first cell, held in the same
// two modular layers as the position itself: two cells of one path carry the
// same pair of segment values exactly when they are in the same segment,
// because two positions of an at-most-81-cell path never agree mod 15 and mod
// 11 at once. A cell the rat never visits takes OFF in both layers.
const segOffKey = cached('segment-off', () => NFA.encodeSpec({
  startState: { k: 0 },
  transition: (s, value) => {
    if (s.k === 0) return { k: 1, off: value === OFF };
    if (s.k === 1) return (value === OFF) === s.off ? { k: 2, off: s.off } : undefined;
    if (s.k !== 2) return undefined;
    return (value === OFF) === s.off ? { done: true } : undefined;
  },
  accept: s => s.done === true,
}, NV));
const segOff = gridCells.map(cell => new NFA(segOffKey, 'segment-off',
  posA.at(cell), segA.at(cell), segB.at(cell)));

// A used step inside one box keeps the segment name; a used step across a box
// border starts a new segment, whose name is the arriving cell's own position.
const segSameKey = cached('segment-same', () => NFA.encodeSpec({
  startState: { k: 0 },
  transition: (s, value) => {
    if (s.k === 0) return { k: 1, used: value !== UNUSED };
    if (s.k === 1) return { k: 2, used: s.used, a: value };
    if (s.k !== 2) return undefined;
    return (!s.used || value === s.a) ? { done: true } : undefined;
  },
  accept: s => s.done === true,
}, NV));
const segCrossKey = cached('segment-cross', () => NFA.encodeSpec({
  startState: { k: 0 },
  transition: (s, value) => {
    // Reads dir, then the leaving end's position and segment name, then the
    // arriving end's; only the arriving end is pinned, and which end that is
    // depends on the direction the step was walked.
    if (s.k === 0) return { k: 1, dir: value };
    if (s.k === 1) return { k: 2, dir: s.dir, p: s.dir === BWD ? value : 0 };
    if (s.k === 2) {
      if (s.dir === BWD && value !== s.p) return undefined;
      return { k: 3, dir: s.dir };
    }
    if (s.k === 3) return { k: 4, dir: s.dir, p: s.dir === FWD ? value : 0 };
    if (s.k !== 4) return undefined;
    if (s.dir === FWD && value !== s.p) return undefined;
    return { done: true };
  },
  accept: s => s.done === true,
}, NV));
const segLinks = steps.flatMap(s => {
  const layers = [[posA, segA], [posB, segB]];
  if (boxOf(s.a) === boxOf(s.b)) {
    return layers.map(([, seg]) =>
      new NFA(segSameKey, 'segment-link', s.id, seg.at(s.a), seg.at(s.b)));
  }
  return layers.map(([pos, seg]) => new NFA(segCrossKey, 'segment-link',
    s.id, pos.at(s.a), seg.at(s.a), pos.at(s.b), seg.at(s.b)));
});

// --- Values ---------------------------------------------------------------
// A cell's value is its digit, doubled when the cell is a doubler; values reach
// 18, so the arithmetic is done inside the machines that compare values rather
// than stored in a layer of its own.
const valueOf = (flag, digit) => flag === DOUBLER ? 2 * digit : digit;
// Reads (flag, digit) for each of two cells and tests them against `ok`.
const pairValueNFA = (name, ok) => cached('pair|' + name, () => NFA.encodeSpec({
  startState: { k: 0 },
  transition: (s, value) => {
    if (s.k === 0) return { k: 1, f: value };
    if (s.k === 1) return { k: 2, x: valueOf(s.f, value) };
    if (s.k === 2) return { k: 3, x: s.x, f: value };
    if (s.k !== 3) return undefined;
    return ok(s.x, valueOf(s.f, value)) ? { done: true } : undefined;
  },
  accept: s => s.done === true,
}, NV));
const blackcurrantKey = pairValueNFA('blackcurrant', (x, y) => x === 2 * y || y === 2 * x);
const blackcurrants = BLACKCURRANTS.map(([x, y]) => new NFA(blackcurrantKey,
  'blackcurrant', dbl.at(x), x, dbl.at(y), y));
const doorKey = pairValueNFA('door', (x, y) => x + y === 10);
const doors = RED_XS.map(([x, y]) => new NFA(doorKey,
  'forbidden-door', dbl.at(x), x, dbl.at(y), y));

// Nabner over a segment: within a box, two cells sharing a segment name may not
// hold equal or consecutive values. Only cells of one box can share a segment,
// so the pairs are drawn box by box.
const nabnerKey = cached('nabner', () => NFA.encodeSpec({
  startState: { k: 0 },
  transition: (s, value) => {
    // Two segment layers for each cell first: `same` false makes the rest of
    // the run vacuous, and OFF (unvisited) never counts as a shared segment.
    if (s.k === 0) return { k: 1, a: value };
    if (s.k === 1) return { k: 2, same: value === s.a && s.a !== OFF };
    if (s.k === 2) return s.same ? { k: 3, same: true, b: value } : { k: 3, same: false };
    if (s.k === 3) return { k: 4, same: s.same && value === s.b };
    if (s.k === 4) return s.same ? { k: 5, same: true, f: value } : { k: 5, same: false };
    if (s.k === 5) return s.same ? { k: 6, same: true, x: valueOf(s.f, value) } : { k: 6, same: false };
    if (s.k === 6) return s.same ? { k: 7, same: true, x: s.x, f: value } : { k: 7, same: false };
    if (s.k !== 7) return undefined;
    if (!s.same) return { done: true };
    return Math.abs(s.x - valueOf(s.f, value)) >= 2 ? { done: true } : undefined;
  },
  accept: s => s.done === true,
}, NV));
const nabner = graph.boxes().flatMap(box => box.flatMap((x, n) =>
  box.slice(n + 1).map(y => new NFA(nabnerKey, 'segment-nabner',
    segA.at(x), segA.at(y), segB.at(x), segB.at(y),
    dbl.at(x), x, dbl.at(y), y))));

// --- Doublers -------------------------------------------------------------
const doublerHouses = graph.rowsColumnsBoxes().map(
  house => new ContainExact(String(DOUBLER), ...dbl.at(house)));
// VD<n> is row n's doubler digit; with exactly one doubler in the row it is
// that cell's digit and nothing else, so AllDifferent over the nine VDs says
// the nine doublers hold nine different digits.
const doublerDigitKey = cached('doubler-digit', () => NFA.encodeSpec({
  startState: { k: 0 },
  transition: (s, value) => {
    if (s.k === 0) return { k: 1, on: value === DOUBLER };
    if (s.k === 1) return { k: 2, on: s.on, digit: value };
    if (s.k !== 2) return undefined;
    return (!s.on || value === s.digit) ? { done: true } : undefined;
  },
  accept: s => s.done === true,
}, NV));
const doublerDigits = graph.rows().flatMap((house, n) => house.map(
  cell => new NFA(doublerDigitKey, 'doubler-digit',
    dbl.at(cell), cell, rowDigit(n + 1))));

// --- Variables and domains ------------------------------------------------
const range = (lo, hi) => Array.from({ length: hi - lo + 1 }, (_, n) => lo + n);
const layers = [
  posA.toVar('position mod ' + MOD_A),
  posB.toVar('position mod ' + MOD_B),
  segA.toVar('segment start mod ' + MOD_A),
  segB.toVar('segment start mod ' + MOD_B),
  dbl.toVar('doubler cells'),
  new Var('S', 'path steps', steps.length),
  new Var('D', 'doubler digit by row', 9),
];
const domains = [
  graph.makeReplicate(new Given(gridCells[0], ...range(1, 9))),
  // VA and VE need no domain of their own: the OFF sentinel plus the MOD_A
  // residues is exactly the 16-value alphabet.
  posB.makeReplicate(new Given(posB.at(gridCells[0]), ...range(1, MOD_B + 1))),
  segB.makeReplicate(new Given(segB.at(gridCells[0]), ...range(1, MOD_B + 1))),
  dbl.makeReplicate(new Given(dbl.at(gridCells[0]), PLAIN, DOUBLER)),
  // The step Vars need no domain of their own: the path-cell machines accept no
  // value on them but unused / in / out.
  ...range(1, 9).map(n => new Given(rowDigit(n), ...range(1, 9))),
  // The rat's own cell is the first cell of the path and of its first segment.
  new Given(posA.at(RAT), FIRST), new Given(posB.at(RAT), FIRST),
  new Given(segA.at(RAT), FIRST), new Given(segB.at(RAT), FIRST),
];

return [
  shape,
  ...layers,
  ...domains,
  ...doublerHouses,
  new AllDifferent(...range(1, 9).map(rowDigit)),
  ...doublerDigits,
  ...blackcurrants,
  ...doors,
  ...pathShape,
  ...counters,
  ...noCross,
  ...segOff,
  ...segLinks,
  ...nabner,
];
