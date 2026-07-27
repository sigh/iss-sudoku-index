// Title: RAT RUN 16: Schrodinger's Rat
// Author: Marty Sears
// Video: https://www.youtube.com/watch?v=nAEKFUtC8x0
// Source: https://sudokupad.app/fi311m5b4u

// Normal sudoku, except each row/column/box holds all ten digits 0-9 across its
// nine cells: exactly one cell per row/column/box is a "Schrodinger cell" and
// holds two different digits, whose sum is that cell's value (an ordinary
// cell's value is its digit). Finkz the rat walks R9C1 -> R1C9 through a maze,
// visiting no cell twice, never crossing itself, never through a wall; a step
// is orthogonal or diagonal, and a diagonal step needs the 2x2 block's shared
// corner untouched by any wall (drawn walls have rounded corners/caps -- the
// rules' "round wall-spot" -- so a wall merely reaching a corner blocks a
// diagonal cut through it). Ten blackcurrants force a 1:2 value ratio
// unconditionally. Two one-way purple arrows always point to the smaller of
// the two values they sit between (unconditional), and the path may cross
// that specific edge only in the pointed direction.
//
// Omitted: TEST CONSTRAINT's requirement that no two path segments (segments
// are the path cut at every box-border crossing) share the same constant
// per-step value-difference. Within-segment consistency (a segment's
// consecutive value-differences are all equal) and the minimum segment length
// of 2 are both encoded below; the cross-segment uniqueness is not, since the
// number of segments is not bounded at authoring time and no sound native or
// composite ISS constraint expresses "all these variable-count,
// variably-located runs carry pairwise-distinct derived labels".

// Digits run 0-9 (ten of them), so the grid's own alphabet is given an offset
// (0-15, the solver's 16-value cap) rather than the usual 1-9: every literal
// value below is the real digit/state, not a 1-shifted symbol. Every Var
// overlay shares this same grid-wide alphabet, so each one is separately
// domain-restricted below to its own real sub-range.
const shape = new Shape('9x9', '0-15');
const S_NONE = 10;      // second-digit sentinel: one past the top real digit
const MAX_H = 1;         // cell value (0-17) splits as 9*VH + VL, VH in 0-1
const splitValue = (h, l) => 9 * h + l;

const UNUSED = 0, FWD = 1, BWD = 2;      // path step values
const OFF = 0, FIRST = 1;                // position-counter values
const MOD_A = 15, MOD_B = 11;            // coprime; lcm 165 > 81 cells

const RAT = 'R9C1';
const CUPCAKE = 'R1C9';

const range = (lo, hi) => Array.from({ length: hi - lo + 1 }, (_, n) => lo + n);
const memo = new Map();
const cached = (key, build) => {
  if (!memo.has(key)) memo.set(key, build());
  return memo.get(key);
};

const graph = cellGraph(shape);
const gridCells = graph.cells();
const VS = graph.makeOverlay('VS');   // second digit
const VH = graph.makeOverlay('VH');   // cell value, high part
const VL = graph.makeOverlay('VL');   // cell value, low part
const posA = graph.makeOverlay('VA'); // path position mod 15
const posB = graph.makeOverlay('VB'); // path position mod 11
const boxOf = cell => {
  const { row, col } = parseCellId(cell);
  return (Math.ceil(row / 3) - 1) * 3 + Math.ceil(col / 3);
};

// === Schrodinger cells ======================================================
// Recipe: keep the single grid digit in the main grid (giving 9 distinct
// primaries per house automatically via the built-in row/column/box
// all-different), add a second-digit overlay with a "none" sentinel, and scan
// each house's interleaved [primary, second] cells with a seen-digit bitmask;
// requiring all 10 bits set forces exactly one non-sentinel second digit per
// house by pigeonhole (a second non-sentinel would need an 11th distinct
// value, which does not exist; fewer than one leaves a bit unset).
const HFULL = (1 << 10) - 1;
const houseSpec = cached('house', () => NFA.encodeSpec({
  startState: { mask: 0, second: false },
  transition: (s, value) => {
    if (!s.second) {
      if (value > 9) return undefined; // primary is always a real digit
      const bit = 1 << value;
      if (s.mask & bit) return undefined;
      return { mask: s.mask | bit, second: true };
    }
    if (value === S_NONE) return { mask: s.mask, second: false };
    if (value > 9) return undefined;
    const bit = 1 << value;
    if (s.mask & bit) return undefined;
    return { mask: s.mask | bit, second: false };
  },
  accept: s => !s.second && s.mask === HFULL,
}, shape));
const schrodingerHouses = graph.houses().map(house =>
  new NFA(houseSpec, 'schrodinger-house', ...house.flatMap(c => [c, VS.at(c)])));

// Per-cell value: the digit, or the sum of both digits when a second digit is
// present; read out split as VH/VL (see the shape comment above).
const valueSpec = cached('value', () => NFA.encodeSpec({
  startState: { k: 0 },
  transition: (s, value) => {
    if (s.k === 0) return value > 9 ? undefined : { k: 1, p: value };
    if (s.k === 1) {
      if (value !== S_NONE && value > 9) return undefined;
      const want = value === S_NONE ? s.p : s.p + value;
      return { k: 2, want };
    }
    if (s.k === 2) {
      if (value > MAX_H) return undefined;
      return { k: 3, wantL: s.want - splitValue(value, 0) };
    }
    if (s.k !== 3) return undefined;
    return value === s.wantL ? { done: true } : undefined;
  },
  accept: s => s.done === true,
}, shape));
const cellValues = gridCells.map(cell =>
  new NFA(valueSpec, 'cell-value', cell, VS.at(cell), VH.at(cell), VL.at(cell)));

// === The maze ================================================================
// Corner (i, j), i/j = 0..9, is the top-left corner of cell R(i+1)C(j+1), matching
// the source's own coordinates directly. Transcribed from the drawn thick
// turquoise wall polylines; a second, much denser thin grey line layer forms an
// unrelated fine crosshatch (background texture, not a maze) and is not used.
const WALLS = [
  [[1, 1], [5, 1]],
  [[3, 1], [3, 3], [5, 3]],
  [[7, 1], [6, 1], [6, 3], [9, 3], [9, 9], [0, 9], [0, 5], [2, 5]],
  [[6, 2], [4, 2]],
  [[6, 3], [6, 4]],
  [[9, 3], [9, 0], [8, 0], [8, 2], [7, 2]],
  [[9, 6], [8, 6]],
  [[5, 9], [5, 8]],
  [[0, 5], [0, 3], [1, 3]],
  [[8, 0], [0, 0], [0, 3]],
  [[2, 2], [2, 4], [1, 4]],
  [[1, 6], [3, 6], [3, 7]],
  [[3, 6], [3, 4]],
  [[4, 5], [5, 5]],
  [[6, 5], [6, 6], [7, 6]],
  [[6, 6], [5, 6]],
  [[7, 4], [8, 4]],
  [[7, 5], [8, 5]],
  [[4, 6], [4, 7], [5, 7]],
  [[4, 7], [4, 8], [3, 8]],
];
const wallSegments = new Set(); // 'H|i|j' = corner(i,j)-(i,j+1); 'V|i|j' = corner(i,j)-(i+1,j)
for (const line of WALLS) {
  for (let n = 1; n < line.length; n++) {
    const [r0, c0] = line[n - 1], [r1, c1] = line[n];
    if (r0 === r1) {
      for (let c = Math.min(c0, c1); c < Math.max(c0, c1); c++) wallSegments.add(`H|${r0}|${c}`);
    } else {
      for (let r = Math.min(r0, r1); r < Math.max(r0, r1); r++) wallSegments.add(`V|${r}|${c0}`);
    }
  }
}
// A diagonal step passes through the one lattice corner its two cells share;
// it is blocked when any of the four unit segments meeting that corner is a
// wall, matching the family's rounded-wall-corner reading above (a wall
// merely touching the corner blocks it, not only a wall crossing it).
const cornerOpen = (i, j) => !wallSegments.has(`V|${i - 1}|${j}`) && !wallSegments.has(`V|${i}|${j}`) &&
  !wallSegments.has(`H|${i}|${j - 1}`) && !wallSegments.has(`H|${i}|${j}`);
const stepAllowed = (cell, dRow, dCol) => {
  const { row, col } = parseCellId(cell);
  const gr = row - 1, gc = col - 1; // 0-indexed grid cell
  if (dRow === 0) return !wallSegments.has(`V|${gr}|${dCol > 0 ? gc + 1 : gc}`);
  if (dCol === 0) return !wallSegments.has(`H|${dRow > 0 ? gr + 1 : gr}|${gc}`);
  return cornerOpen(dRow > 0 ? gr + 1 : gr, dCol > 0 ? gc + 1 : gc);
};

// === Path step variables =====================================================
const STEP_DIRS = [[0, 1], [1, 0], [1, 1], [1, -1]];
const steps = [];
const stepsAt = new Map(gridCells.map(cell => [cell, []]));
for (const cell of gridCells) {
  for (const [dRow, dCol] of STEP_DIRS) {
    const other = graph.step(cell, dRow, dCol);
    if (!other || !stepAllowed(cell, dRow, dCol)) continue;
    const id = 'VE' + (steps.length + 1);
    steps.push({ id, a: cell, b: other });
    stepsAt.get(cell).push({ id, in: BWD, out: FWD, other });
    stepsAt.get(other).push({ id, in: FWD, out: BWD, other: cell });
  }
}
const stepVarCount = steps.length;
const stepIndex = new Map(steps.map(s => [s.a + '|' + s.b, s]));

// Per-cell machine: reads the two position counters (a visited cell's counters
// are both off, or both on -- this is what lets the counter machinery below
// pin a value only for visited cells), then every incident step. Finkz's start
// only leaves, the cupcake only arrives, any other visited cell does both once.
function cellNFA(incident, role) {
  const sig = 'cell|' + role + '|' + incident.map(s => s.in + '/' + s.out).join(',');
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
      if (role === 'rat') return s.vis && s.out === 1 && s.in === 0;
      if (role === 'cupcake') return s.vis && s.in === 1 && s.out === 0;
      return s.vis ? (s.in === 1 && s.out === 1) : (s.in === 0 && s.out === 0);
    },
  }, shape));
}
const pathShape = gridCells.map(cell => {
  const incident = stepsAt.get(cell);
  const role = cell === RAT ? 'rat' : cell === CUPCAKE ? 'cupcake' : 'plain';
  return new NFA(cellNFA(incident, role), 'path-cell',
    posA.at(cell), posB.at(cell), ...incident.map(s => s.id));
});

// Position counters: an in-use step advances the counter by one along its
// direction of travel, forbidding a stray closed loop of steps beside the
// path (its length would need to be a multiple of both 15 and 11, i.e. 165,
// more than the 81 cells available).
const nextPos = (v, mod) => FIRST + ((v - FIRST + 1) % mod);
const counterNFA = mod => cached('counter' + mod, () => NFA.encodeSpec({
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
}, shape));
const counters = steps.flatMap(s => [
  new NFA(counterNFA(MOD_A), 'path-order', s.id, posA.at(s.a), posA.at(s.b)),
  new NFA(counterNFA(MOD_B), 'path-order', s.id, posB.at(s.a), posB.at(s.b)),
]);

// The two diagonals of a 2x2 block cross each other; the path may not cross
// itself.
const noCrossKey = cached('noCross', () => Pair.fnToKey((x, y) => x === UNUSED || y === UNUSED, shape));
const noCross = [];
for (const cell of gridCells) {
  const right = graph.step(cell, 0, 1);
  const down = graph.step(cell, 1, 0);
  const diag = graph.step(cell, 1, 1);
  if (!right || !down || !diag) continue;
  const d1 = stepIndex.get(cell + '|' + diag);
  const d2 = stepIndex.get(right + '|' + down);
  if (d1 && d2) noCross.push(new Pair(noCrossKey, 'no-crossing', d1.id, d2.id));
}

// === TEST CONSTRAINT: segments cut at box borders ===========================
// A segment is a maximal run of the path confined to one box; a box border is
// crossed whenever a used step's two cells are in different boxes. Both local
// clauses below only need to look at one cell and its two path neighbours, so
// neither needs the segments to be identified or counted explicitly:
//   - minimum length 2: no cell may have both its path-neighbours in a
//     different box from itself (that would make it a length-1 segment by
//     itself); this also covers the rat's and cupcake's own first/last step,
//     forbidden below from crossing a box border directly.
//   - constant difference within a segment: for a cell with both path
//     neighbours in its own box, the value-difference on the way in must
//     equal the value-difference on the way out.
// (Not encoded: that this constant differs between every pair of segments --
// see the top of the file.)
const crossForbidKey = (inMark, outMark) => cached('crossForbid|' + inMark + '|' + outMark,
  () => Pair.fnToKey((v1, v2) => !(v1 === inMark && v2 === outMark), shape));
// Reads the two step markers, then the three cells' split values (A, B, C in
// path order); active only when the markers show this cell entered via s1 and
// left via s2, in which case the value-step into B must equal the value-step
// out of B.
const localDiffSpec = (inMark, outMark) => cached('localDiff|' + inMark + '|' + outMark, () => NFA.encodeSpec({
  startState: { k: 0 },
  transition: (s, value) => {
    if (s.k === 0) return { k: 1, active: value === inMark };
    if (s.k === 1) return { k: 2, active: s.active && value === outMark };
    if (s.k === 2) return value > MAX_H ? undefined : { k: 3, active: s.active, ah: value };
    if (s.k === 3) return { k: 4, active: s.active, a: splitValue(s.ah, value) };
    if (s.k === 4) return value > MAX_H ? undefined : { k: 5, active: s.active, a: s.a, bh: value };
    if (s.k === 5) return { k: 6, active: s.active, a: s.a, b: splitValue(s.bh, value) };
    if (s.k === 6) return value > MAX_H ? undefined : { k: 7, active: s.active, a: s.a, b: s.b, ch: value };
    if (s.k !== 7) return undefined;
    if (!s.active) return { done: true };
    const c = splitValue(s.ch, value);
    return Math.abs(s.b - s.a) === Math.abs(c - s.b) ? { done: true } : undefined;
  },
  accept: s => s.done === true,
}, shape));
const segmentLocal = [];
for (const cell of gridCells) {
  const inc = stepsAt.get(cell);
  for (const s1 of inc) {
    for (const s2 of inc) {
      if (s1 === s2) continue;
      const sameA = boxOf(s1.other) === boxOf(cell);
      const sameC = boxOf(s2.other) === boxOf(cell);
      if (!sameA && !sameC) {
        segmentLocal.push(new Pair(crossForbidKey(s1.in, s2.out), 'segment-min-length', s1.id, s2.id));
      } else if (sameA && sameC) {
        segmentLocal.push(new NFA(localDiffSpec(s1.in, s2.out), 'segment-difference',
          s1.id, s2.id, VH.at(s1.other), VL.at(s1.other), VH.at(cell), VL.at(cell),
          VH.at(s2.other), VL.at(s2.other)));
      }
    }
  }
}
// Finkz's own first step and the cupcake's own last step must stay inside
// their box too (they are otherwise a length-1 segment with no path-neighbour
// on the far side to pair against above).
const boundaryGivens = [
  ...stepsAt.get(RAT).filter(s => boxOf(s.other) !== boxOf(RAT)).map(s => new Given(s.id, UNUSED)),
  ...stepsAt.get(CUPCAKE).filter(s => boxOf(s.other) !== boxOf(CUPCAKE)).map(s => new Given(s.id, UNUSED)),
];

// === Blackcurrants (unconditional 1:2 value ratio) ==========================
// Cell pairs transcribed from the drawn edge marks.
const BLACKCURRANTS = [
  ['R1C1', 'R2C1'], ['R5C2', 'R6C2'], ['R4C4', 'R5C4'], ['R4C5', 'R4C6'],
  ['R2C7', 'R2C8'], ['R3C8', 'R3C9'], ['R3C9', 'R4C9'], ['R7C7', 'R7C8'],
  ['R7C9', 'R8C9'], ['R9C5', 'R9C6'],
];
// Reads both cells' split values and checks that one is double the other.
const blackcurrantSpec = cached('blackcurrant', () => NFA.encodeSpec({
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
}, shape));
const blackcurrants = BLACKCURRANTS.map(([x, y]) => new NFA(blackcurrantSpec, 'blackcurrant',
  VH.at(x), VL.at(x), VH.at(y), VL.at(y)));

// === One-way doors ============================================================
// tail/tip transcribed from each arrow's drawn direction (tail = larger value
// / arrow's tail end, tip = smaller value / the end the arrowhead touches).
const ARROWS = [
  { tail: 'R2C2', tip: 'R3C2' },
  { tail: 'R3C6', tip: 'R2C6' },
];
// Reads both cells' split values and checks the tail is strictly greater.
const arrowSpec = cached('arrow', () => NFA.encodeSpec({
  startState: { k: 0 },
  transition: (s, value) => {
    if (s.k === 0) return value > MAX_H ? undefined : { k: 1, h: value };
    if (s.k === 1) return { k: 2, tail: splitValue(s.h, value) };
    if (s.k === 2) return value > MAX_H ? undefined : { k: 3, tail: s.tail, h: value };
    if (s.k !== 3) return undefined;
    return s.tail > splitValue(s.h, value) ? { done: true } : undefined;
  },
  accept: s => s.done === true,
}, shape));
const arrowValues = ARROWS.map(({ tail, tip }) =>
  new NFA(arrowSpec, 'one-way-door', VH.at(tail), VL.at(tail), VH.at(tip), VL.at(tip)));
const arrowDirections = ARROWS.map(({ tail, tip }) => {
  const step = stepIndex.get(tail + '|' + tip) || stepIndex.get(tip + '|' + tail);
  const wantFwd = step.a === tail;
  return new Given(step.id, UNUSED, wantFwd ? FWD : BWD);
});

// === Domains and assembly =====================================================
const domains = [
  graph.makeReplicate(new Given(gridCells[0], ...range(0, 9))),
  VS.makeReplicate(new Given(VS.at(gridCells[0]), ...range(0, S_NONE))),
  VH.makeReplicate(new Given(VH.at(gridCells[0]), ...range(0, MAX_H))),
  VL.makeReplicate(new Given(VL.at(gridCells[0]), ...range(0, 8))),
  // posA needs no domain restriction: OFF plus its 15 residues is exactly the
  // full 0-15 alphabet.
  posB.makeReplicate(new Given(posB.at(gridCells[0]), ...range(0, MOD_B))),
  new Given(posA.at(RAT), FIRST),
  new Given(posB.at(RAT), FIRST),
  // Step Vars need no domain of their own: the path-cell machines above accept
  // no value on them but unused/in/out.
];

return [
  shape,
  VS.toVar('second digit'),
  VH.toVar('cell value, high part'),
  VL.toVar('cell value, low part'),
  posA.toVar('path position mod ' + MOD_A),
  posB.toVar('path position mod ' + MOD_B),
  new Var('E', 'path steps', stepVarCount),
  ...domains,
  ...schrodingerHouses,
  ...cellValues,
  ...pathShape,
  ...counters,
  ...noCross,
  ...segmentLocal,
  ...boundaryGivens,
  ...blackcurrants,
  ...arrowValues,
  ...arrowDirections,
];
