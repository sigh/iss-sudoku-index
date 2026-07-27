// Title: RAT RUN 12: Visiting Order
// Author: Marty Sears
// Video: https://www.youtube.com/watch?v=9tXUSMUJEZs
// Source: https://sudokupad.app/wxhrpva2lr

// Normal sudoku. Finkz starts on R9C2 and walks a path to the cupcake on
// R7C7. The path visits no cell twice, never crosses itself, and never
// passes through a thick maze wall. A step is orthogonal, or diagonal when
// the 2x2 block it cuts across is free of walls and carries no round
// wall-spot on its corner. Two cells joined by a green grape differ by at
// least 5. Box borders (drawn dotted, but the ordinary 3x3 boxes) split the
// path into index lines: each border crossing starts a fresh one, and along
// an index line the Nth cell Finkz visits is "position N", whose digit
// always names the position holding digit N -- i.e. position and digit pair
// up as an involution (a permutation that is its own inverse) within the
// line. "In box 7, r9c2 is position 1" describes the ordinary case where a
// box is visited in a single unbroken run, which is what an index line is
// whenever no path revisits a box; ISS's 1000-cell search budget rules out
// also tracking each box's cumulative order across possibly-separate visits.
//
// Nothing is omitted.

// The alphabet is widened to 16 so the Var layers can carry path state; the
// 81 grid cells are pinned back to 1-9 below.
const NV = 16;

// Two coprime moduli (lcm 165 > 81 cells) rule out a closed loop of steps
// beside the path: ISS has no single-path primitive, and degree alone admits
// one.
const MOD_A = 15, MOD_B = 11;
const OFF = 1;                     // counter value for a cell the path misses
const FIRST = 2;                   // counter value of the path's first cell
const UNUSED = 1, FWD = 2, BWD = 3; // step values: unused, a->b, b->a

const RAT = 'R9C2';
const CUPCAKE = 'R7C7';
const GRAPES = [['R1C5', 'R1C6'], ['R3C5', 'R3C6'], ['R5C6', 'R6C6']];

// --- The drawn maze ---------------------------------------------------------
// Corner (i, j) is the top-left corner of cell RiCj, so the lattice runs
// 1..10. WALLS holds the fourteen thick cadetblue polylines exactly as drawn
// (including the boundary, matching the game's own "thick maze wall" rule).
// SPOTS holds the 39 round wall-spot circles, each on a lattice corner --
// transcribed from the puzzle's own cadetblue overlay circles, not just wall
// corners: most sit where a wall ends or turns, but six sit on corners no
// wall touches at all, and one wall corner (a straight-through corner) has
// no spot, so the two sources must be kept as separate lists.
const WALLS = [
  [[9, 2], [9, 3], [4, 3], [4, 2]],
  [[3, 3], [3, 2], [2, 2]],
  [[8, 5], [8, 4], [10, 4], [10, 10], [1, 10], [1, 5], [2, 5]],
  [[8, 4], [3, 4]],
  [[10, 4], [10, 1], [1, 1], [1, 5]],
  [[10, 7], [9, 7]],
  [[7, 10], [7, 7], [6, 7]],
  [[2, 7], [4, 7], [4, 5], [3, 5]],
  [[2, 6], [3, 6]],
  [[9, 5], [9, 6]],
  [[8, 6], [6, 6], [6, 5], [5, 5]],
  [[5, 6], [5, 8], [2, 8]],
  [[6, 8], [6, 9], [5, 9]],
  [[4, 9], [2, 9]],
];
const SPOTS = [
  [2, 2], [2, 4], [2, 5], [2, 6], [2, 7], [2, 8], [2, 9], [3, 2], [3, 3],
  [3, 4], [3, 5], [3, 6], [4, 2], [4, 3], [4, 5], [4, 7], [4, 9], [5, 2],
  [5, 5], [5, 6], [5, 8], [5, 9], [6, 2], [6, 5], [6, 6], [6, 7], [6, 8],
  [6, 9], [7, 2], [7, 5], [7, 7], [8, 2], [8, 5], [8, 6], [9, 2], [9, 3],
  [9, 5], [9, 6], [9, 7],
];

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

// A diagonal step passes through the one corner its two cells share. It
// needs a 2x2 space, whose only internal edges are the four wall slots
// meeting at that corner, and it may not pass through a wall-spot.
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

const shape = new Shape('9x9', NV);
const graph = cellGraph(shape);
const gridCells = graph.cells();
const posA = graph.makeOverlay('VA');   // path position mod 15
const posB = graph.makeOverlay('VB');   // path position mod 11
const boxes = graph.boxes();            // the 9 ordinary 3x3 boxes, row-major
// A single shared overlay: INDEXPOS.at(cell) is the cell's position within
// its own index line (see "Per-box visit order" below). ISS caps a puzzle at
// 1000 grid-plus-Var cells (MAX_SEARCH_CELLS); one running counter per box,
// carried on all 81 cells each, would need 9*81 = 729 cells on top of the
// grid, posA, posB and the ~113 step cells and blow that cap. One shared
// layer, reset wherever the path crosses a box border, stays within budget.
const indexPos = graph.makeOverlay('VC');
const boxOfCell = new Map(boxes.flatMap((cells, b) => cells.map(c => [c, b])));

const memo = new Map();
const cached = (key, build) => {
  if (!memo.has(key)) memo.set(key, build());
  return memo.get(key);
};

// --- Step variables ----------------------------------------------------------
// One Var per legal king move; moves the maze forbids get no variable at all.
const STEP_DIRS = [[0, 1], [1, 0], [1, 1], [1, -1]];
const steps = [];
const stepsAt = new Map(gridCells.map(cell => [cell, []]));
for (const cell of gridCells) {
  for (const [dRow, dCol] of STEP_DIRS) {
    const other = graph.step(cell, dRow, dCol);
    if (!other || !stepAllowed(cell, dRow, dCol)) continue;
    const id = 'VS' + (steps.length + 1);
    const step = { id, a: cell, b: other };
    steps.push(step);
    stepsAt.get(cell).push({ id, out: FWD, in: BWD });
    stepsAt.get(other).push({ id, out: BWD, in: FWD });
  }
}

// --- Path shape ---------------------------------------------------------------
// Per-cell machine: reads the cell's two counters, then every step it is an
// end of. A cell Finkz never visits takes the OFF counter and uses no step;
// a visited cell (other than the endpoints) is entered once and left once.
const ROLE_OF = new Map([[RAT, 'start'], [CUPCAKE, 'end']]);
function cellNFA(incident, role) {
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
      let { in: nIn, out: nOut } = s;
      if (value === step.in) nIn++;
      else if (value === step.out) nOut++;
      else if (value !== UNUSED) return undefined;
      if (nIn > 1 || nOut > 1) return undefined;
      return { k: s.k + 1, vis: s.vis, in: nIn, out: nOut };
    },
    accept: s => {
      if (s.k !== 2 + incident.length) return false;
      if (role === 'start') return s.vis && s.out === 1 && s.in === 0;
      if (role === 'end') return s.vis && s.in === 1 && s.out === 0;
      return s.vis ? (s.in === 1 && s.out === 1) : (s.in === 0 && s.out === 0);
    },
  }, NV));
}
const pathShape = gridCells.map(cell => {
  const incident = stepsAt.get(cell);
  const role = ROLE_OF.get(cell) || 'plain';
  return new NFA(cellNFA(incident, role), 'path-cell',
    posA.at(cell), posB.at(cell), ...incident.map(s => s.id));
});

// Position counters. Numbering a real path 1, 2, 3, ... from Finkz's cell is
// always possible, so "the arriving cell's counter is the leaving cell's
// plus one" adds nothing on the real path; what it buys is that a closed
// cycle of steps beside the path would need a length divisible by 15 and by
// 11, i.e. by 165, and there are only 81 cells. Degree alone cannot rule
// such a cycle out.
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
const noCrossKey = cached('no-cross', () =>
  Pair.fnToKey((x, y) => x === UNUSED || y === UNUSED, NV));
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

// --- Grapes ------------------------------------------------------------------
// A grape relates two fixed cells directly; it does not depend on whether
// Finkz's path actually uses that edge.
const grapes = GRAPES.map(([x, y]) => new Whisper(5, x, y));

// --- Per-box visit order (the TEST CONSTRAINT) --------------------------------
// "Dotted box borders divide the correct path into index lines": indexPos
// carries each visited cell's position within its own index line -- 1 for
// the first cell after Finkz's start or after crossing a box border, then
// incrementing along the path until the next border crossing resets it back
// to 1. This is exactly a box's own per-visit order whenever the path visits
// that box in one unbroken run, which is the case the worked example ("in
// box 7, r9c2 is position 1") describes; the budget above rules out also
// tracking each box's cumulative count across possibly-separate visits.
const IOFF = 1;                        // sentinel: cell not on path
const indexCount = v => v - 1;         // stored value -> actual position (1..9)
const indexValue = p => p + 1;         // actual position -> stored value

// A cell is on the path iff posA reads a real position, never OFF; indexPos
// must agree with that on every cell, independent of which steps happen to
// be used, since an off-path cell can sit right next to an on-path one (the
// edge between them is simply unused).
const offAgreementKey = cached('index-off-agreement', () =>
  Pair.fnToKey((a, ip) => (a === OFF) === (ip === IOFF), NV));
const indexOffAgreement = gridCells.map(cell =>
  new Pair(offAgreementKey, 'visiting-order', posA.at(cell), indexPos.at(cell)));

// same: whether the step's two cells share a box (continue the run) or not
// (cross a border, so the arriving cell restarts its index line at 1).
const indexStepNFA = same => cached('indexstep|' + same, () => NFA.encodeSpec({
  startState: { k: 0 },
  transition: (s, value) => {
    if (s.k === 0) return { k: 1, dir: value };
    if (s.k === 1) return { k: 2, dir: s.dir, a: value };
    if (s.k !== 2) return undefined;
    // Unused steps say nothing about the two cells' index positions -- that
    // is indexOffAgreement's job, exactly as pathShape/counterNFA split
    // handles posA/posB.
    if (s.dir === UNUSED) return { done: true };
    if (s.a === IOFF || value === IOFF) return undefined;
    const arrives = same ? s.a + 1 : indexValue(1);
    return s.dir === FWD
      ? (value === arrives ? { done: true } : undefined)
      : (s.a === (same ? value + 1 : indexValue(1)) ? { done: true } : undefined);
  },
  accept: s => s.done === true,
}, NV));
const indexCounters = steps.map(step => {
  const same = boxOfCell.get(step.a) === boxOfCell.get(step.b);
  return new NFA(indexStepNFA(same), 'visiting-order',
    step.id, indexPos.at(step.a), indexPos.at(step.b));
});
// Finkz's own cell starts the very first index line.
const indexStart = new Given(indexPos.at(RAT), indexValue(1));

// The self-referential rule itself: for box b's cell x with position bx
// (IOFF if unvisited) and digit dx, some cell y of the same box (x itself
// included, for a fixed point) must hold position dx and digit
// indexCount(bx) -- "the digit in position N names the position holding
// digit N", read both ways at once. Expressed directly as a disjunction over
// the (at most) 9 candidate partners, rather than one NFA scanning all of
// them: a single automaton carrying both x's own (position, digit)
// reference and each candidate's pair for 9 candidates in turn needs a
// state for every (target, want, found-so-far) combination at every step,
// which blows the compiled-state limit long before all 9 are scanned.
const partnerHasPositionKey = cached('partner-has-position', () =>
  Pair.fnToKey((dx, by) => by === indexValue(dx), NV));   // y's position = x's digit
const partnerHasDigitKey = cached('partner-has-digit', () =>
  Pair.fnToKey((bx, dy) => dy === indexCount(bx), NV));   // y's digit = x's position
const selfRef = [];
for (const boxCells of boxes) {
  for (const x of boxCells) {
    const unvisited = new Given(indexPos.at(x), IOFF);
    const partners = boxCells.map(y => new And([
      new Pair(partnerHasPositionKey, 'visiting-order', x, indexPos.at(y)),
      new Pair(partnerHasDigitKey, 'visiting-order', indexPos.at(x), y),
    ]));
    selfRef.push(new Or([unvisited, ...partners]));
  }
}

// --- Variables and domains -----------------------------------------------------
const range = (lo, hi) => Array.from({ length: hi - lo + 1 }, (_, n) => lo + n);
const layers = [
  posA.toVar('path position mod ' + MOD_A),
  posB.toVar('path position mod ' + MOD_B),
  indexPos.toVar('index-line position'),
  new Var('S', 'path steps', steps.length),
];
const domains = [
  graph.makeReplicate(new Given(gridCells[0], ...range(1, 9))),
  // VA needs no domain of its own: the sentinel plus MOD_A residues is
  // exactly the 16-value alphabet.
  posB.makeReplicate(new Given(posB.at(gridCells[0]), ...range(1, MOD_B + 1))),
  // IOFF plus positions 1..9 is 10 values.
  indexPos.makeReplicate(new Given(indexPos.at(gridCells[0]), ...range(1, 10))),
  // Finkz's own cell is the first cell of the path.
  new Given(posA.at(RAT), FIRST), new Given(posB.at(RAT), FIRST),
  // The step Vars need no domain of their own: the path-cell machines accept
  // no value on them but unused/in/out.
];

return [
  shape,
  ...layers,
  ...domains,
  indexStart,
  ...indexOffAgreement,
  ...pathShape,
  ...counters,
  ...noCross,
  ...grapes,
  ...indexCounters,
  ...selfRef,
];
