// Title: RAT RUN: Hit and Miss
// Author: Marty Sears
// Video: https://www.youtube.com/watch?v=wPq635rHE28
// Source: https://sudokupad.app/k4zgmts5h9

// Normal sudoku. Finkz and Phinx stand on R1C1 and R1C2 and each walks through
// the maze to the cupcake on R8C8. A walk visits no cell twice, the two walks
// share no cell but the cupcake, neither walk crosses itself or the other, and
// no step passes through a thick maze wall. A step is orthogonal, or diagonal
// when the 2x2 block it cuts across is free of walls and carries no round
// wall-spot on the corner the two cells share.
// Two digits joined by a blackcurrant have one double the other; two joined by
// a grape differ by at least 5.
// 3x3 box borders cut each walk into segments, so a segment is a maximal run of
// consecutive walk cells lying in one box, and its first cell is position 1. A
// blue hexagonal platform need not be visited, but if a walk steps on it, its
// digit is the number of cells of that segment whose digit equals its position.
//
// Nothing is omitted.

// The alphabet is widened so the Var layers can carry the position counters, the
// segment positions and the hit counts; the 81 grid cells are pinned back to 1-9
// below.
const NV = 11;
// Coprime moduli: a closed cycle of steps beside the walks would need a length
// divisible by both, i.e. 90, and the grid holds 81 cells.
const MOD_A = 10, MOD_B = 9;
const OFF = 1;                  // walk-position value for a cell no rat visits
const FIRST = 2;                // walk-position value of a walk's first cell
// Segment position: NOSEG for a cell no rat visits, otherwise position + 1. A
// segment lies inside one box, so its positions run 1..9, i.e. values 2..10.
const NOSEG = 1, POS1 = 2;
// Hit counts: NOCOUNT for a cell no rat visits, otherwise count + 2, so counts
// 0..9 map to values 2..11.
const NOCOUNT = 1, COUNT0 = 2;
// Step values. A step is stored once, on the (a, b) pair built below; FWD means
// the rat walked a->b and BWD b->a, so the counters can tell direction.
const UNUSED = 1;
const A_FWD = 2, A_BWD = 3, B_FWD = 4, B_BWD = 5;
// Which rat's step values a per-step machine reacts to.
const RAT_ANY = 0, RAT_A = 1, RAT_B = 2;

const RAT_A_CELL = 'R1C1', RAT_B_CELL = 'R1C2';   // the two rat emoji
const CUPCAKE = 'R8C8';                            // both cupcake emoji

// --- Drawn data -----------------------------------------------------------
// The thick wall-coloured polylines on the corner lattice, where corner (i, j)
// is the top-left corner of RiCj, so the lattice runs 1..10. The second entry
// carries the drawn boundary loop, which separates no two grid cells.
const WALLS = [
  [[3, 4], [4, 4]],
  [[2, 4], [1, 4], [1, 10], [10, 10], [10, 1], [1, 1], [1, 4]],
  [[1, 6], [2, 6]],
  [[6, 10], [6, 9]],
  [[8, 10], [8, 9]],
  [[10, 6], [8, 6]],
  [[2, 3], [2, 2], [4, 2]],
  [[3, 3], [4, 3]],
  [[5, 2], [6, 2]],
  [[7, 4], [8, 4], [8, 2]],
  [[6, 5], [4, 5]],
  [[7, 7], [7, 9]],
  [[5, 7], [6, 7]],
  [[4, 7], [4, 9], [5, 9]],
  [[3, 8], [2, 8], [2, 9]],
  [[2, 8], [2, 7]],
  [[9, 3], [9, 5]],
  [[3, 6], [4, 6]],
  [[5, 4], [6, 4]],
  [[5, 8], [6, 8]],
  [[9, 8], [9, 9]],
];
// The round wall-spots of the same colour, each on a lattice corner. All but
// four sit where a wall turns or ends; (2,5), (3,7), (6,3) and (6,6) stand clear
// of every wall and so block diagonal movement only.
const SPOTS = [
  [2, 2], [2, 3], [2, 4], [2, 5], [2, 6], [2, 7], [2, 9],
  [3, 3], [3, 4], [3, 6], [3, 7], [3, 8],
  [4, 2], [4, 3], [4, 4], [4, 5], [4, 6], [4, 7], [4, 9],
  [5, 2], [5, 4], [5, 7], [5, 8], [5, 9],
  [6, 2], [6, 3], [6, 4], [6, 5], [6, 6], [6, 7], [6, 8], [6, 9],
  [7, 4], [7, 7], [7, 9],
  [8, 2], [8, 4], [8, 6], [8, 9],
  [9, 3], [9, 5], [9, 8], [9, 9],
];
// The drawn fruit, each named by the two cells its edge separates: the black
// dots are blackcurrants and the green ones grapes.
const BLACKCURRANTS = [
  ['R8C3', 'R8C4'], ['R9C4', 'R9C5'], ['R3C6', 'R4C6'],
];
const GRAPES = [
  ['R6C3', 'R6C4'], ['R5C4', 'R6C4'], ['R5C5', 'R6C5'],
  ['R6C5', 'R7C5'], ['R2C5', 'R3C5'],
];
// The blue hexagons.
const PLATFORMS = [
  'R1C7', 'R2C3', 'R2C6', 'R3C1', 'R3C7', 'R4C2', 'R4C4',
  'R4C6', 'R5C8', 'R6C1', 'R7C6', 'R7C8', 'R8C1', 'R9C8',
];

const shape = new Shape('9x9', NV);
const graph = cellGraph(shape);
const gridCells = graph.cells();
const posA = graph.makeOverlay('VA');     // walk position mod MOD_A
const posB = graph.makeOverlay('VB');     // walk position mod MOD_B
const segPos = graph.makeOverlay('VG');   // position within the walk's segment
const hitsTo = graph.makeOverlay('VK');   // segment hits up to and including here
const segHits = graph.makeOverlay('VC');  // hit total of the whole segment
// The cupcake is the last cell of both walks, so its segment position and its
// two hit counts differ between the rats. The grid overlays above carry rat A's
// reading of the cupcake and this Var carries rat B's.
const cupB = new Var('W', 'cupcake for rat B: segment position, hits so far, hit total', 3);
const [CUP_B_POS, CUP_B_HITS_TO, CUP_B_SEG] = cupB.cells();

const boxOf = cell => {
  const { row, col } = parseCellId(cell);
  return Math.floor((row - 1) / 3) * 3 + Math.floor((col - 1) / 3);
};

// --- The maze -------------------------------------------------------------
// Split the wall polylines into unit lattice segments: 'H|i|j' runs from corner
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

// A diagonal step passes through the one corner its two cells share. It needs a
// 2x2 space, whose only internal edges are the four wall slots meeting at that
// corner, and it may not pass through a wall-spot.
const cornerOpen = (i, j) => !spotSet.has(`${i}|${j}`) &&
  !wallSegments.has(`V|${i - 1}|${j}`) && !wallSegments.has(`V|${i}|${j}`) &&
  !wallSegments.has(`H|${i}|${j - 1}`) && !wallSegments.has(`H|${i}|${j}`);

// Is the (dRow, dCol) step out of `cell` a move the maze leaves open?
const stepAllowed = (cell, dRow, dCol) => {
  const { row, col } = parseCellId(cell);
  if (dRow === 0) return !wallSegments.has(`V|${row}|${col + Math.max(dCol, 0)}`);
  if (dCol === 0) return !wallSegments.has(`H|${row + Math.max(dRow, 0)}|${col}`);
  return cornerOpen(row + Math.max(dRow, 0), col + Math.max(dCol, 0));
};

// --- Step variables -------------------------------------------------------
// One Var per king move the maze leaves open, recording whether a walk uses it
// and in which direction; a move the maze forbids gets no variable at all,
// which is how the walls and the wall-spots are enforced.
const STEP_DIRS = [[0, 1], [1, 0], [1, 1], [1, -1]];
const steps = [];
const stepsAt = new Map(gridCells.map(cell => [cell, []]));
for (const cell of gridCells) {
  for (const [dRow, dCol] of STEP_DIRS) {
    const other = graph.step(cell, dRow, dCol);
    if (!other || !stepAllowed(cell, dRow, dCol)) continue;
    const id = 'VS' + (steps.length + 1);
    steps.push({ id, a: cell, b: other, sameBox: boxOf(cell) === boxOf(other) });
    stepsAt.get(cell).push({ id, out: A_FWD, in: A_BWD, out2: B_FWD, in2: B_BWD });
    stepsAt.get(other).push({ id, out: A_BWD, in: A_FWD, out2: B_BWD, in2: B_FWD });
  }
}
const stepIndex = new Map(steps.map(s => [s.a + '|' + s.b, s]));

const memo = new Map();
const cached = (key, build) => {
  if (!memo.has(key)) memo.set(key, build());
  return memo.get(key);
};

// --- Walk shape -----------------------------------------------------------
// Per-cell machine: reads the cell's five overlay values, then every step it is
// an end of. A cell no rat visits takes the off-walk sentinel in all five layers
// and uses no step; any other cell is entered once and left once by one and the
// same rat. A rat's own cell is only left, and the cupcake is entered once by
// each rat and left by neither.
const ROLE_OF = new Map([
  [RAT_A_CELL, 'ratA'], [RAT_B_CELL, 'ratB'], [CUPCAKE, 'cupcake'],
]);
// The off-walk value of each overlay, in the order the machine reads them.
const SENTINELS = [OFF, OFF, NOSEG, NOCOUNT, NOCOUNT];
function cellNFA(incident, role) {
  // The step values a cell sees depend on whether it is the step's a or b end,
  // so the machine is keyed on that pattern, not just on the step count.
  const sig = 'cell|' + role + '|' + incident.map(s => s.out).join(',');
  return cached(sig, () => NFA.encodeSpec({
    startState: { k: 0 },
    transition: (s, value) => {
      if (s.k < SENTINELS.length) {
        const on = value !== SENTINELS[s.k];
        if (s.k > 0 && on !== s.vis) return undefined;
        return s.k + 1 < SENTINELS.length
          ? { k: s.k + 1, vis: on }
          : { k: s.k + 1, vis: on, inA: 0, outA: 0, inB: 0, outB: 0 };
      }
      const n = s.k - SENTINELS.length;
      if (n >= incident.length) return undefined;
      const step = incident[n];
      const next = {
        k: s.k + 1, vis: s.vis,
        inA: s.inA, outA: s.outA, inB: s.inB, outB: s.outB,
      };
      if (value === step.in) next.inA++;
      else if (value === step.out) next.outA++;
      else if (value === step.in2) next.inB++;
      else if (value === step.out2) next.outB++;
      else if (value !== UNUSED) return undefined;
      if (next.inA > 1 || next.outA > 1 || next.inB > 1 || next.outB > 1) {
        return undefined;
      }
      return next;
    },
    accept: s => {
      if (s.k !== SENTINELS.length + incident.length) return false;
      if (role === 'ratA') {
        return s.vis && s.outA === 1 && s.inA === 0 && s.inB === 0 && s.outB === 0;
      }
      if (role === 'ratB') {
        return s.vis && s.outB === 1 && s.inB === 0 && s.inA === 0 && s.outA === 0;
      }
      if (role === 'cupcake') {
        return s.vis && s.inA === 1 && s.inB === 1 && s.outA === 0 && s.outB === 0;
      }
      if (!s.vis) return s.inA === 0 && s.outA === 0 && s.inB === 0 && s.outB === 0;
      return (s.inA === 1 && s.outA === 1 && s.inB === 0 && s.outB === 0) ||
        (s.inB === 1 && s.outB === 1 && s.inA === 0 && s.outA === 0);
    },
  }, NV));
}
const walkShape = gridCells.map(cell => {
  const incident = stepsAt.get(cell);
  return new NFA(cellNFA(incident, ROLE_OF.get(cell) || 'plain'), 'walk-cell',
    posA.at(cell), posB.at(cell), segPos.at(cell), hitsTo.at(cell),
    segHits.at(cell), ...incident.map(s => s.id));
});

// Position counters. Numbering a real walk 1, 2, 3, ... from the rat's cell is
// always possible, so "the arriving cell's counter is the leaving cell's plus
// one" rejects no genuine walk; what it buys is that a closed cycle of steps
// beside the walks would need a length divisible by MOD_A and by MOD_B. The
// degree rules above admit such a cycle and nothing else rules it out.
// The steps into the cupcake are left out, because both walks end there and one
// counter cannot number two walks whose lengths the rules never tie together. No
// cycle can run through the cupcake either way: nothing leaves it.
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
const counters = steps
  .filter(s => s.a !== CUPCAKE && s.b !== CUPCAKE)
  .flatMap(s => [
    new NFA(counterNFA(MOD_A), 'walk-order', s.id, posA.at(s.a), posA.at(s.b)),
    new NFA(counterNFA(MOD_B), 'walk-order', s.id, posB.at(s.a), posB.at(s.b)),
  ]);

// --- Segments and hit counters --------------------------------------------
// Everything the test constraint needs is carried across a single step. The
// machine reads the step value, then the two cells' segment positions, their
// digits, their hits-so-far and their hit totals, each pair in the fixed order
// (a, b). The step value says which of the two cells is being left (`from`) and
// which is being entered (`to`); `sameBox` says whether the step stays inside
// one 3x3 box:
//   segment position -- `to` restarts at 1 when the step crosses a box border,
//     and is otherwise one more than `from`'s;
//   hits so far -- the count of cells of the segment up to and including this
//     one whose digit equals their position, restarted the same way;
//   hit total -- constant along a segment, and equal to the hits-so-far of the
//     segment's last cell, which is `from` exactly when the step leaves the box.
// `ratMask` limits the machine to one rat's step values, so that the steps into
// the cupcake can be given rat B's own three cells; the machine is inert on any
// step value it does not react to.
const segmentNFA = (sameBox, ratMask) => cached(`segment|${sameBox}|${ratMask}`, () =>
  NFA.encodeSpec({
    startState: { k: 0 },
    transition: (s, value) => {
      if (s.skip !== undefined) {
        return s.skip > 1 ? { skip: s.skip - 1 } : { done: true };
      }
      if (s.k === 0) {
        const mine = value !== UNUSED &&
          (ratMask === RAT_ANY ||
            (ratMask === RAT_A ? value === A_FWD || value === A_BWD
              : value === B_FWD || value === B_BWD));
        if (!mine) return { skip: 8 };
        return { k: 1, fwd: value === A_FWD || value === B_FWD };
      }
      if (s.k === 1) return { k: 2, fwd: s.fwd, ga: value };
      if (s.k === 2) {
        const fromPos = s.fwd ? s.ga : value;
        const toPos = s.fwd ? value : s.ga;
        if (fromPos === NOSEG || toPos === NOSEG) return undefined;
        if (toPos !== (sameBox ? fromPos + 1 : POS1)) return undefined;
        return { k: 3, fwd: s.fwd, toPos };
      }
      // The digit of `to` decides whether `to` is itself a hit; the digit of
      // `from` is read and dropped.
      if (s.k === 3) {
        return s.fwd
          ? { k: 4, fwd: true, toPos: s.toPos }
          : { k: 4, fwd: false, hit: value === s.toPos - 1 ? 1 : 0 };
      }
      if (s.k === 4) {
        return s.fwd
          ? { k: 5, fwd: true, hit: value === s.toPos - 1 ? 1 : 0 }
          : { k: 5, fwd: false, hit: s.hit };
      }
      if (s.k === 5) return { k: 6, fwd: s.fwd, hit: s.hit, ka: value };
      if (s.k === 6) {
        const fromHits = s.fwd ? s.ka : value;
        const toHits = s.fwd ? value : s.ka;
        if (fromHits === NOCOUNT || toHits === NOCOUNT) return undefined;
        if (toHits !== (sameBox ? fromHits + s.hit : COUNT0 + s.hit)) return undefined;
        return { k: 7, fwd: s.fwd, fromHits };
      }
      if (s.k === 7) return { k: 8, fwd: s.fwd, fromHits: s.fromHits, ca: value };
      if (s.k !== 8) return undefined;
      const fromTotal = s.fwd ? s.ca : value;
      const toTotal = s.fwd ? value : s.ca;
      if (fromTotal === NOCOUNT || toTotal === NOCOUNT) return undefined;
      const ok = sameBox ? fromTotal === toTotal : fromTotal === s.fromHits;
      return ok ? { done: true } : undefined;
    },
    accept: s => s.done === true,
  }, NV));
// The three segment cells a step reads for one of its ends, with the cupcake's
// replaced by rat B's copies when the machine is watching rat B.
const endCells = (cell, forRatB) =>
  (forRatB && cell === CUPCAKE)
    ? [CUP_B_POS, CUP_B_HITS_TO, CUP_B_SEG]
    : [segPos.at(cell), hitsTo.at(cell), segHits.at(cell)];
const segmentStep = (s, ratMask) => {
  const forRatB = ratMask === RAT_B;
  const [gA, kA, cA] = endCells(s.a, forRatB);
  const [gB, kB, cB] = endCells(s.b, forRatB);
  return new NFA(segmentNFA(s.sameBox, ratMask), 'segment',
    s.id, gA, gB, s.a, s.b, kA, kB, cA, cB);
};
const segmentSteps = steps.flatMap(s => (s.a === CUPCAKE || s.b === CUPCAKE)
  ? [segmentStep(s, RAT_A), segmentStep(s, RAT_B)]
  : [segmentStep(s, RAT_ANY)]);

// A walk's first cell opens a segment at position 1, so its hits-so-far records
// only whether that cell's own digit is 1.
const firstCellKey = Pair.fnToKey(
  (digit, hits) => hits === COUNT0 + (digit === POS1 - 1 ? 1 : 0), NV);
const walkEnds = [
  ...[RAT_A_CELL, RAT_B_CELL].flatMap(cell => [
    new Given(segPos.at(cell), POS1),
    new Pair(firstCellKey, 'segment-start', cell, hitsTo.at(cell)),
  ]),
  // A walk's last cell closes its segment, so the total is its hits-so-far;
  // every other cell's segment is closed by its outgoing step above. Two
  // one-cell sets is how SameValues says two cells are equal.
  new SameValues(2, hitsTo.at(CUPCAKE), segHits.at(CUPCAKE)),
  new SameValues(2, CUP_B_HITS_TO, CUP_B_SEG),
];

// A visited platform's digit is its segment's hit total; an unvisited platform
// says nothing.
const platformKey = Pair.fnToKey(
  (digit, total) => total === NOCOUNT || digit === total - COUNT0, NV);
const platforms = PLATFORMS.map(cell => new Pair(
  platformKey, 'hit-counter', cell, segHits.at(cell)));

// --- Crossing -------------------------------------------------------------
// The two diagonals of a 2x2 block cross each other, and no walk may cross
// itself or the other walk.
const noCrossKey = Pair.fnToKey((x, y) => x === UNUSED || y === UNUSED, NV);
const noCross = gridCells.flatMap(cell => {
  const right = graph.step(cell, 0, 1);
  const down = graph.step(cell, 1, 0);
  const diag = graph.step(cell, 1, 1);
  if (!right || !down || !diag) return [];
  const d1 = stepIndex.get(cell + '|' + diag);
  const d2 = stepIndex.get(right + '|' + down);
  return (d1 && d2) ? [new Pair(noCrossKey, 'no-crossing', d1.id, d2.id)] : [];
});

// --- Fruit ----------------------------------------------------------------
const blackcurrants = BLACKCURRANTS.map(([x, y]) => new BlackDot(x, y));
const grapes = GRAPES.map(([x, y]) => new Whisper(5, x, y));

// --- Variables and domains ------------------------------------------------
const range = (lo, hi) => Array.from({ length: hi - lo + 1 }, (_, n) => lo + n);
const layers = [
  posA.toVar('walk position mod ' + MOD_A),
  posB.toVar('walk position mod ' + MOD_B),
  segPos.toVar('position within segment'),
  hitsTo.toVar('segment hits so far'),
  segHits.toVar('segment hit total'),
  new Var('S', 'walk steps', steps.length),
  cupB,
];
const domains = [
  graph.makeReplicate(new Given(gridCells[0], ...range(1, 9))),
  // VA needs no domain of its own: the off-walk sentinel plus MOD_A residues is
  // exactly the widened alphabet, and likewise VK and VC carry the sentinel plus
  // the ten counts 0..9.
  posB.makeReplicate(new Given(posB.at(gridCells[0]), ...range(1, MOD_B + 1))),
  segPos.makeReplicate(
    new Given(segPos.at(gridCells[0]), NOSEG, ...range(POS1, POS1 + 8))),
  // The step Vars need no domain of their own: the walk-cell machines accept no
  // value on them but unused / in / out, for either rat.
  // Each rat's own cell is the first cell of its walk; without this the whole
  // numbering of a walk could rotate freely through the residues.
  ...[RAT_A_CELL, RAT_B_CELL].flatMap(cell => [
    new Given(posA.at(cell), FIRST), new Given(posB.at(cell), FIRST)]),
  // The cupcake ends both walks, at two positions that need not agree, so its
  // own counters number nothing; they are pinned rather than left to float.
  new Given(posA.at(CUPCAKE), FIRST), new Given(posB.at(CUPCAKE), FIRST),
  // Rat B's cupcake cells mirror the grid overlays without the off-walk value:
  // the cupcake is on both walks.
  new Given(CUP_B_POS, ...range(POS1, POS1 + 8)),
  new Given(CUP_B_HITS_TO, ...range(COUNT0, COUNT0 + 9)),
  new Given(CUP_B_SEG, ...range(COUNT0, COUNT0 + 9)),
];

return [
  shape,
  ...layers,
  ...domains,
  ...walkShape,
  ...counters,
  ...segmentSteps,
  ...walkEnds,
  ...platforms,
  ...noCross,
  ...blackcurrants,
  ...grapes,
];
