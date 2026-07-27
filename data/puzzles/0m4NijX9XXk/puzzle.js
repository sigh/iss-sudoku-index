// Title: RAT RUN 14: Thermoregulation
// Author: Marty Sears
// Video: https://www.youtube.com/watch?v=0m4NijX9XXk
// Source: https://sudokupad.app/vcncpwgckm

// Normal sudoku. Finkz walks from R9C6 (the rat marker) to R8C3 (the cupcake
// marker) along a path of cell centres: orthogonal steps always, diagonal
// steps only across a 2x2 block free of walls and not carrying a round
// wall-spot on the shared corner. The path never repeats a cell and never
// crosses itself or a thick maze wall.
//
// Blackcurrants: the two digits joined by one have a 1:2 ratio.
//
// Cages: every cage totals the same deduced value. Separately, each cage's
// electricity symbol sits over one cell of that cage, and that cell's own
// digit is the cage's shock value; Finkz's path may not enter any cell of a
// cage whose shock value is 5 or higher.
//
// Test constraint: cutting the path wherever it crosses a 3x3 box border
// splits it into segments; each segment's digit total must exceed the one
// before it on the path.
//
// Nothing is omitted.

// NFA reads share one alphabet, hard-capped at 16 symbols; every overlay
// below is sized to fit inside it. The 81 grid cells are pinned to 1-9.
const NV = 16;

const OFF = 1;              // sentinel: cell not on Finkz's path (all overlays)
const NONE = 2;              // prevH sentinel: no segment has finished yet
const FIRST = 2;              // posA/posB value at the rat cell (position 0)
const MOD_A = 15, MOD_B = 11; // coprime; lcm 165 exceeds the 81-cell grid, so
                               // no closed loop of steps can satisfy both.
const UNUSED = 1, FWD = 2, BWD = 3; // step values: unused, a->b, b->a
const isFwd = v => v === FWD;

const RAT = 'R9C6';       // the rat marker (underlay text, near R9C6)
const CUPCAKE = 'R8C3';   // the cupcake marker (underlay text, near R8C3)

// --- The drawn maze --------------------------------------------------------
// Corner (r, c), r/c in 0..9, is the point shared by up to four cells:
// R(r)C(c), R(r)C(c+1), R(r+1)C(c), R(r+1)C(c+1) (1-indexed cells). WALLS is
// the 13 thick slategray polylines exactly as drawn, including the outer
// border segment (which blocks no interior move, since there is no cell
// beyond the grid). SPOTS is the 36 round wall-spot corners, drawn in the
// same colour as the walls.
const WALLS = [
  [[4, 1], [4, 0], [9, 0], [9, 9], [0, 9], [0, 0], [4, 0]],
  [[9, 4], [8, 4], [8, 3]],
  [[2, 9], [2, 7]],
  [[3, 8], [3, 7], [5, 7]],
  [[4, 7], [4, 6]],
  [[8, 5], [6, 5], [6, 8], [5, 8]],
  [[7, 5], [7, 1], [5, 1], [5, 2], [3, 2], [3, 1], [1, 1], [1, 2]],
  [[8, 7], [7, 7], [7, 6]],
  [[8, 1], [8, 2]],
  [[5, 6], [5, 5], [3, 5]],
  [[5, 5], [5, 4], [6, 4], [6, 3]],
  [[3, 6], [1, 6], [1, 8]],
  [[2, 6], [2, 3]],
];
const SPOTS = [
  [5, 8], [6, 8], [1, 6], [6, 3], [4, 1], [6, 2], [7, 1], [8, 1], [8, 2],
  [8, 3], [8, 4], [8, 5], [8, 7], [7, 7], [7, 6], [3, 8], [3, 7], [4, 6],
  [5, 7], [5, 6], [3, 5], [3, 6], [1, 8], [2, 3], [3, 3], [3, 4], [5, 4],
  [6, 4], [6, 5], [5, 1], [5, 2], [3, 2], [3, 1], [1, 1], [2, 7], [1, 2],
];

// Unit lattice segments the walls cover. 'H|r|c' separates the 0-indexed
// cells (r-1,c) and (r,c); 'V|r|c' separates (r,c-1) and (r,c).
const wallSeg = new Set();
for (const poly of WALLS) {
  for (let i = 1; i < poly.length; i++) {
    const [r0, c0] = poly[i - 1];
    const [r1, c1] = poly[i];
    if (r0 === r1) {
      for (let c = Math.min(c0, c1); c < Math.max(c0, c1); c++) wallSeg.add(`H|${r0}|${c}`);
    } else {
      for (let r = Math.min(r0, r1); r < Math.max(r0, r1); r++) wallSeg.add(`V|${r}|${c0}`);
    }
  }
}
const spotSet = new Set(SPOTS.map(([r, c]) => `${r}|${c}`));

// Is the orthogonal step between 0-indexed cells (r0,c0) and (r1,c1) walled?
const orthBlocked = (r0, c0, r1, c1) => r0 === r1
  ? wallSeg.has(`V|${r0}|${Math.min(c0, c1) + 1}`)
  : wallSeg.has(`H|${Math.min(r0, r1) + 1}|${c0}`);

// A diagonal step passes through the one lattice corner its two cells share.
// It needs a 2x2 space: the corner carries no wall-spot, and none of the four
// unit segments meeting there is a wall.
const cornerOpen = (r, c) => !spotSet.has(`${r}|${c}`) &&
  !wallSeg.has(`V|${r - 1}|${c}`) && !wallSeg.has(`V|${r}|${c}`) &&
  !wallSeg.has(`H|${r}|${c - 1}`) && !wallSeg.has(`H|${r}|${c}`);

const shape = new Shape('9x9', NV);
const graph = cellGraph(shape);
const gridCells = graph.cells();

// --- Step variables ---------------------------------------------------------
// One Var per legal move (orthogonal or diagonal); the maze's forbidden moves
// get no variable at all, so walls live directly in the graph.
const STEP_DIRS = [[0, 1], [1, 0], [1, 1], [1, -1]];
const steps = [];
for (const cell of gridCells) {
  const { row, col } = parseCellId(cell);   // 1-indexed
  const r0 = row - 1, c0 = col - 1;          // 0-indexed
  for (const [dr, dc] of STEP_DIRS) {
    const other = graph.step(cell, dr, dc);
    if (!other) continue;
    if (dr === 0 || dc === 0) {
      if (orthBlocked(r0, c0, r0 + dr, c0 + dc)) continue;
    } else {
      const cornerR = r0 + 1;
      const cornerC = dc === 1 ? c0 + 1 : c0;
      if (!cornerOpen(cornerR, cornerC)) continue;
    }
    steps.push({ id: 'VS' + (steps.length + 1), a: cell, b: other });
  }
}
const stepVar = new Var('S', 'path steps', steps.length);
steps.forEach((s, i) => { s.id = stepVar.cell(i + 1); });
const stepIndex = new Map(steps.map(s => [s.a + '|' + s.b, s]));
const stepBetween = (p, q) => stepIndex.get(p + '|' + q) || stepIndex.get(q + '|' + p);

const stepsAt = new Map(gridCells.map(cell => [cell, []]));
for (const s of steps) {
  stepsAt.get(s.a).push({ id: s.id, out: FWD, in: BWD });
  stepsAt.get(s.b).push({ id: s.id, out: BWD, in: FWD });
}

// --- Overlays ----------------------------------------------------------------
const posA = graph.makeOverlay('VA');   // position mod 15 (OFF = not visited)
const posB = graph.makeOverlay('VB');   // position mod 11
// Current segment's digit total, split high/low: OFF, else real H (1..5) is
// stored as H+1 and paired with real L (1..9) so that total = 9*(H-1)+L.
const segH = graph.makeOverlay('VG');
const segL = graph.makeOverlay('VK');
// The previous (already-finished) segment's total, same split, plus NONE for
// "no segment has finished yet": OFF, NONE, else real H (1..5) as H+2.
const prevH = graph.makeOverlay('VP');
const prevL = graph.makeOverlay('VQ');

const memo = new Map();
const cached = (key, build) => {
  if (!memo.has(key)) memo.set(key, build());
  return memo.get(key);
};

// --- Path shape: degrees ------------------------------------------------------
function cellNFA(incident, role) {
  const sig = 'deg|' + role + '|' + incident.map(s => s.out).join(',');
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
      if (role === 'rat') return s.vis && s.in === 0 && s.out === 1;
      if (role === 'cupcake') return s.vis && s.in === 1 && s.out === 0;
      return s.vis ? (s.in === 1 && s.out === 1) : (s.in === 0 && s.out === 0);
    },
  }, NV));
}
const pathShape = gridCells.map(cell => {
  const incident = stepsAt.get(cell);
  const role = cell === RAT ? 'rat' : cell === CUPCAKE ? 'cupcake' : 'plain';
  return new NFA(cellNFA(incident, role), 'path-cell', posA.at(cell), posB.at(cell),
    ...incident.map(s => s.id));
});

// --- Subtour elimination: two coprime position counters -----------------------
const nextPos = (v, mod) => FIRST + ((v - FIRST + 1) % mod);
const counterNFA = mod => cached('cnt' + mod, () => NFA.encodeSpec({
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

// --- No self-crossing: the two diagonals of one 2x2 block can't both be used -
const noCrossKey = Pair.fnToKey((x, y) => x === UNUSED || y === UNUSED, NV);
const noCross = [];
for (const cell of gridCells) {
  const right = graph.step(cell, 0, 1);
  const down = graph.step(cell, 1, 0);
  const diag = graph.step(cell, 1, 1);
  if (!right || !down || !diag) continue;
  const d1 = stepBetween(cell, diag);
  const d2 = stepBetween(right, down);
  if (d1 && d2) noCross.push(new Pair(noCrossKey, 'no-crossing', d1.id, d2.id));
}

// --- Test constraint: box-segment totals strictly increase along the path ----
// Box-crossing is static per edge (fixed by the two cells' positions), so the
// direction-dependent arithmetic below is compiled into two small machines,
// chosen per step by whether its two cells share a box.
const boxOf = cell => {
  const { row, col } = parseCellId(cell);
  return Math.floor((row - 1) / 3) * 3 + Math.floor((col - 1) / 3);
};

// Reads (in this order, for both machines): step, a-digit, b-digit,
// a-segH, b-segH, a-segL, b-segL, a-prevH, b-prevH, a-prevL, b-prevL.
// Each phase reads both cells' value for one field before moving to the next
// field, so a value can be checked and dropped from state as soon as its
// partner arrives, keeping the compiled state count small.
const sameBoxMachine = () => cached('seg-same', () => NFA.encodeSpec({
  startState: { phase: 'step' },
  transition: (s, value) => {
    if (s.phase === 'step') {
      if (value === UNUSED) return { phase: 'skip', left: 10 };
      if (value !== FWD && value !== BWD) return undefined;
      return { phase: 'aD', dir: value };
    }
    if (s.phase === 'skip') {
      return s.left > 1 ? { phase: 'skip', left: s.left - 1 } : { phase: 'done' };
    }
    if (s.phase === 'aD') {
      if (value < 1 || value > 9) return undefined;
      return { phase: 'bD', dir: s.dir, aD: value };
    }
    if (s.phase === 'bD') {
      if (value < 1 || value > 9) return undefined;
      const toD = isFwd(s.dir) ? value : s.aD;
      return { phase: 'aSegH', dir: s.dir, toD };
    }
    if (s.phase === 'aSegH') {
      if (value < 2 || value > 6) return undefined;
      return { phase: 'bSegH', dir: s.dir, toD: s.toD, h: value };
    }
    if (s.phase === 'bSegH') {
      if (value < 2 || value > 6) return undefined;
      const fromH = isFwd(s.dir) ? s.h : value;
      const toH = isFwd(s.dir) ? value : s.h;
      return { phase: 'aSegL', dir: s.dir, toD: s.toD, fromH, toH };
    }
    if (s.phase === 'aSegL') {
      if (value < 1 || value > 9) return undefined;
      if (isFwd(s.dir)) {
        const total = value + s.toD;
        const carry = total > 9 ? 1 : 0;
        const expH = (s.fromH - 1) + carry + 1;
        const expL = carry ? total - 9 : total;
        if (expH !== s.toH) return undefined;
        return { phase: 'bSegL', dir: s.dir, expL };
      }
      return { phase: 'bSegL', dir: s.dir, toD: s.toD, fromH: s.fromH, toL: value, toH: s.toH };
    }
    if (s.phase === 'bSegL') {
      if (value < 1 || value > 9) return undefined;
      if (isFwd(s.dir)) {
        if (value !== s.expL) return undefined;
        return { phase: 'aPrevH', dir: s.dir };
      }
      const total = value + s.toD;   // value = fromL
      const carry = total > 9 ? 1 : 0;
      const expH = (s.fromH - 1) + carry + 1;
      const expL = carry ? total - 9 : total;
      if (expH !== s.toH || expL !== s.toL) return undefined;
      return { phase: 'aPrevH', dir: s.dir };
    }
    if (s.phase === 'aPrevH') {
      if (value < 1 || value > 7) return undefined;
      return { phase: 'bPrevH', dir: s.dir, h: value };
    }
    if (s.phase === 'bPrevH') {
      if (value < 1 || value > 7) return undefined;
      return value === s.h ? { phase: 'aPrevL', dir: s.dir } : undefined;
    }
    if (s.phase === 'aPrevL') {
      if (value < 1 || value > 9) return undefined;
      return { phase: 'bPrevL', dir: s.dir, l: value };
    }
    if (s.phase === 'bPrevL') {
      if (value < 1 || value > 9) return undefined;
      return value === s.l ? { phase: 'done' } : undefined;
    }
    return undefined;
  },
  accept: s => s.phase === 'done',
}, NV));

const crossBoxMachine = () => cached('seg-cross', () => NFA.encodeSpec({
  startState: { phase: 'step' },
  transition: (s, value) => {
    if (s.phase === 'step') {
      if (value === UNUSED) return { phase: 'skip', left: 10 };
      if (value !== FWD && value !== BWD) return undefined;
      return { phase: 'aD', dir: value };
    }
    if (s.phase === 'skip') {
      return s.left > 1 ? { phase: 'skip', left: s.left - 1 } : { phase: 'done' };
    }
    if (s.phase === 'aD') {
      if (value < 1 || value > 9) return undefined;
      return { phase: 'bD', dir: s.dir, aD: value };
    }
    if (s.phase === 'bD') {
      if (value < 1 || value > 9) return undefined;
      const toD = isFwd(s.dir) ? value : s.aD;
      return { phase: 'aSegH', dir: s.dir, toD };
    }
    if (s.phase === 'aSegH') {
      if (value < 2 || value > 6) return undefined;
      if (isFwd(s.dir)) return { phase: 'bSegH', dir: s.dir, toD: s.toD, fromH: value };
      // BWD: a is the fresh segment's cell; its H is always the encoding of
      // real H=1, i.e. 2 (a single digit's total needs no high part).
      if (value !== 2) return undefined;
      return { phase: 'bSegH', dir: s.dir, toD: s.toD };
    }
    if (s.phase === 'bSegH') {
      if (value < 2 || value > 6) return undefined;
      if (isFwd(s.dir)) {
        if (value !== 2) return undefined;
        return { phase: 'aSegL', dir: s.dir, toD: s.toD, fromH: s.fromH };
      }
      return { phase: 'aSegL', dir: s.dir, toD: s.toD, fromH: value };
    }
    if (s.phase === 'aSegL') {
      if (value < 1 || value > 9) return undefined;
      if (isFwd(s.dir)) return { phase: 'bSegL', dir: s.dir, toD: s.toD, fromH: s.fromH, fromL: value };
      // BWD: a is the fresh segment's cell; its L is the destination digit.
      if (value !== s.toD) return undefined;
      return { phase: 'bSegL', dir: s.dir, fromH: s.fromH };
    }
    if (s.phase === 'bSegL') {
      if (value < 1 || value > 9) return undefined;
      if (isFwd(s.dir)) {
        if (value !== s.toD) return undefined;
        return { phase: 'aPrevH', dir: s.dir, fromH: s.fromH, fromL: s.fromL };
      }
      return { phase: 'aPrevH', dir: s.dir, fromH: s.fromH, fromL: value };
    }
    if (s.phase === 'aPrevH') {
      if (value < 1 || value > 7) return undefined;
      if (isFwd(s.dir)) {
        return { phase: 'bPrevH', dir: s.dir, fromH: s.fromH, fromL: s.fromL, fromPrevH: value };
      }
      // BWD: a is the fresh segment's cell; its stored prevH must record the
      // just-finished (source) segment's total.
      if (value !== s.fromH + 1) return undefined;
      return { phase: 'bPrevH', dir: s.dir, fromH: s.fromH, fromL: s.fromL };
    }
    if (s.phase === 'bPrevH') {
      if (value < 1 || value > 7) return undefined;
      if (isFwd(s.dir)) {
        if (value !== s.fromH + 1) return undefined;
        return { phase: 'aPrevL', dir: s.dir, fromH: s.fromH, fromL: s.fromL, fromPrevH: s.fromPrevH };
      }
      return { phase: 'aPrevL', dir: s.dir, fromH: s.fromH, fromL: s.fromL, fromPrevH: value };
    }
    if (s.phase === 'aPrevL') {
      if (value < 1 || value > 9) return undefined;
      if (isFwd(s.dir)) {
        // Now have the source's whole (segH,segL,prevH,prevL): the ordering
        // check itself -- this finished segment must beat the one before it.
        const fromSum = 9 * (s.fromH - 2) + s.fromL;
        const fromPrev = s.fromPrevH === NONE ? 0 : 9 * (s.fromPrevH - 3) + value;
        if (!(fromSum > fromPrev)) return undefined;
        return { phase: 'bPrevL', dir: s.dir, fromL: s.fromL };
      }
      if (value !== s.fromL) return undefined;
      return { phase: 'bPrevL', dir: s.dir, fromH: s.fromH, fromL: s.fromL, fromPrevH: s.fromPrevH };
    }
    if (s.phase === 'bPrevL') {
      if (value < 1 || value > 9) return undefined;
      if (isFwd(s.dir)) {
        if (value !== s.fromL) return undefined;
        return { phase: 'done' };
      }
      const fromSum = 9 * (s.fromH - 2) + s.fromL;
      const fromPrev = s.fromPrevH === NONE ? 0 : 9 * (s.fromPrevH - 3) + value;
      if (!(fromSum > fromPrev)) return undefined;
      return { phase: 'done' };
    }
    return undefined;
  },
  accept: s => s.phase === 'done',
}, NV));

const segmentOrder = steps.map(s => {
  const machine = boxOf(s.a) === boxOf(s.b) ? sameBoxMachine() : crossBoxMachine();
  return new NFA(machine, 'segment-order', s.id, s.a, s.b,
    segH.at(s.a), segH.at(s.b), segL.at(s.a), segL.at(s.b),
    prevH.at(s.a), prevH.at(s.b), prevL.at(s.a), prevL.at(s.b));
});

// The rat cell starts a fresh single-cell segment with no segment before it.
const ratBaseKey = cached('rat-base', () => NFA.encodeSpec({
  startState: { k: 0 },
  transition: (s, value) => {
    if (s.k === 0) return { k: 1, d: value };
    if (s.k === 1) return value === 2 ? { k: 2, d: s.d } : undefined;          // segH = encode(1)
    if (s.k === 2) return value === s.d ? { k: 3, d: s.d } : undefined;        // segL = digit
    if (s.k === 3) return value === NONE ? { k: 4 } : undefined;               // prevH = NONE
    if (s.k === 4) return value === 1 ? { done: true } : undefined;            // prevL = dummy
    return undefined;
  },
  accept: s => s.done === true,
}, NV));
const ratBase = new NFA(ratBaseKey, 'rat-start', RAT,
  segH.at(RAT), segL.at(RAT), prevH.at(RAT), prevL.at(RAT));

// Every segment but the last gets its ">previous segment" check when the path
// crosses out of its box (inside segmentOrder above). The last segment -- the
// one holding the cupcake -- never crosses out of anything, so it needs its
// own explicit check here: its running total must still beat the segment
// before it.
const cupcakeFinalKey = cached('cupcake-final', () => NFA.encodeSpec({
  startState: { k: 0 },
  transition: (s, value) => {
    if (s.k === 0) {
      if (value < 2 || value > 6) return undefined;
      return { k: 1, h: value };
    }
    if (s.k === 1) {
      if (value < 1 || value > 9) return undefined;
      return { k: 2, h: s.h, l: value };
    }
    if (s.k === 2) {
      if (value < 1 || value > 7) return undefined;
      return { k: 3, h: s.h, l: s.l, ph: value };
    }
    if (s.k !== 3) return undefined;
    if (value < 1 || value > 9) return undefined;
    const sum = 9 * (s.h - 2) + s.l;
    const prev = s.ph === NONE ? 0 : 9 * (s.ph - 3) + value;
    return sum > prev ? { done: true } : undefined;
  },
  accept: s => s.done === true,
}, NV));
const cupcakeFinal = new NFA(cupcakeFinalKey, 'segment-order-final',
  segH.at(CUPCAKE), segL.at(CUPCAKE), prevH.at(CUPCAKE), prevL.at(CUPCAKE));

// Every other cell's segH/prevH follow posA's OFF-ness; segL/prevL are parked
// at a dummy value off the path, since nothing reads them there.
const idleH = Pair.fnToKey((posAVal, v) => posAVal !== OFF || v === OFF, NV);
const idleL = Pair.fnToKey((posAVal, v) => posAVal !== OFF || v === 1, NV);
const idlePairs = gridCells.flatMap(cell => [
  new Pair(idleH, 'idle-seg', posA.at(cell), segH.at(cell)),
  new Pair(idleH, 'idle-seg', posA.at(cell), prevH.at(cell)),
  new Pair(idleL, 'idle-seg', posA.at(cell), segL.at(cell)),
  new Pair(idleL, 'idle-seg', posA.at(cell), prevL.at(cell)),
]);

// --- Blackcurrants: 1:2 ratio, drawn on the edge between two cells -----------
// Read from the four black edge-circles (size 0.26, colour #000000).
const BLACKCURRANTS = [
  ['R2C3', 'R3C3'], ['R7C6', 'R7C7'], ['R1C1', 'R1C2'], ['R5C9', 'R6C9'],
];
const blackcurrants = BLACKCURRANTS.map(([a, b]) => new BlackDot(a, b));

// --- Cages: shared deduced total; each cage's own shock cell gates entry ----
// Read from the four dashed cage borders (colour #10bfff). Each cage's own
// electricity-symbol underlay sits over one specific cell of that cage (not
// centred over the whole cage), so "the cage's shock value" is that cell's
// own digit -- a per-cage value -- while the *total* named in the same
// sentence is the separate, shared, deduced quantity. Reading shock as the
// shared total instead would force every cage to be simultaneously safe or
// simultaneously shocking, which cannot produce a mix -- but the source's
// completion message ("Deactivated cages entered: 1") only makes sense if
// cages can differ, so the per-cell reading is what the flavour text forces.
const CAGES = [
  { cells: ['R9C3', 'R9C4'], shockCell: 'R9C4' },
  { cells: ['R4C3'], shockCell: 'R4C3' },
  { cells: ['R5C5'], shockCell: 'R5C5' },
  { cells: ['R5C8', 'R5C9'], shockCell: 'R5C8' },
];
const cageSums = [new EqualSum(...CAGES.map(c => c.cells))];
const shockKey = Pair.fnToKey((shockDigit, posAVal) => shockDigit < 5 || posAVal === OFF, NV);
const shockCells = CAGES.flatMap(({ cells, shockCell }) =>
  cells.map(cell => new Pair(shockKey, 'shock', shockCell, posA.at(cell))));

// --- Domains -----------------------------------------------------------------
const range = (lo, hi) => Array.from({ length: hi - lo + 1 }, (_, n) => lo + n);
const domains = [
  graph.makeReplicate(new Given(gridCells[0], ...range(1, 9))),
  // VA needs no domain of its own: OFF plus the MOD_A=15 residues exactly
  // fills the 16-value alphabet.
  posB.makeReplicate(new Given(posB.at(gridCells[0]), ...range(1, MOD_B + 1))),
  segH.makeReplicate(new Given(segH.at(gridCells[0]), ...range(1, 6))),
  segL.makeReplicate(new Given(segL.at(gridCells[0]), ...range(1, 9))),
  prevH.makeReplicate(new Given(prevH.at(gridCells[0]), ...range(1, 7))),
  prevL.makeReplicate(new Given(prevL.at(gridCells[0]), ...range(1, 9))),
  // The step Vars need no domain of their own: every step feeds the per-cell
  // path-shape machine above, which accepts no value but unused/in/out.
];

return [
  shape,
  posA.toVar('path position mod ' + MOD_A),
  posB.toVar('path position mod ' + MOD_B),
  segH.toVar('current segment total, high part'),
  segL.toVar('current segment total, low part'),
  prevH.toVar('previous segment total, high part'),
  prevL.toVar('previous segment total, low part'),
  stepVar,
  ...domains,
  ...pathShape,
  ...counters,
  ...noCross,
  ...segmentOrder,
  ratBase,
  cupcakeFinal,
  ...idlePairs,
  ...blackcurrants,
  ...cageSums,
  ...shockCells,
];
