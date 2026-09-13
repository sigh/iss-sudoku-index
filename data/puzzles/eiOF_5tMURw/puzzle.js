// Title: Out of Touch
// Author: Varepsilon
// Video: https://www.youtube.com/watch?v=eiOF_5tMURw
// Source: https://sudokupad.app/y0rmb0d1m1

// Normal sudoku. Draw a single closed loop through cell centres, orthogonal
// steps only, visiting every cell exactly once except nine unvisited cells
// (one per row, column and box, holding 1-9 once each). A cell is unvisited
// exactly when its digit equals its position within its own box (reading
// order, top-left = 1). The loop splits into nine consecutive 8-cell
// sections, each holding eight different digits; the unvisited cell holding
// a section's missing digit may not orthogonally touch that section.
//
// The rules never say the loop cannot run alongside itself, so touching is
// permitted: cells are wired with directed per-edge step Vars (unused / a->b
// / b->a) and an in/out-degree NFA per cell, not a naive on-neighbour count,
// so a cell merely adjacent to two different loop segments is never mistaken
// for one with degree > 2. Two coprime-modulus position counters (mod 8 and
// mod 9, lcm 72) then force the on-loop cells into a single cycle rather
// than a disjoint union: any sub-cycle shorter than 72 could not return to
// its own counter value, and 72 is forced below to be the exact on-loop
// count. A "seam" at R1C1 pins the otherwise-free choice of numbering start
// and direction, so the search does not recount one loop shape once per
// rotation/direction of its own numbering.
//
// "Unvisited" is derived, not chosen: a cell's own box-position is a fixed
// board fact (K below), and Pair/NFA constraints tie loop membership to
// digit === K rather than adding a free membership Var.
//
// "Exactly one cell per row/column/box has digit === its own box position"
// is not automatic (a box's digit permutation need not have exactly one
// fixed point), so it is asserted directly; each row's NFA also reads that
// row's unvisited digit off into an RV cell, and AllDifferent(RV) is the
// rule's "the nine unvisited cells hold 1-9 once each" (the row/column/box
// exactly-one clauses already give "no two share a row/column/box").
//
// Sections: since the on-loop count is pinned to exactly 72 = 8*9, the mod-8
// counter's value is exactly (absolute loop position mod 8), where absolute
// position (0-71) is recovered from the two counters by the Chinese
// Remainder theorem (baked into a lookup table, CRT below -- never stored as
// a Var, which would need a 72-value domain past the 16-value hard limit).
// "The loop CAN be divided" is existential over which of the 8 possible cut
// phases is used: a single shared ROT cell (1-8) picks the phase, read by a
// per-cell NFA (secIdx below) that assigns each on-loop cell a section label
// 1-9 (or the sentinel 10 when off-loop). ROT is a genuine solver choice, so
// if more than one phase happens to satisfy the digit rule for a given grid,
// the auxiliary state is not fully pinned by the grid alone.
//
// Per section label, one NFA checks the eight digits are pairwise different
// (an accumulated bitmask that lives only in the NFA's own internal state,
// never a stored Var, so it costs no cell budget) and a second sums them to
// read the missing digit off into an MS cell -- kept separate from the
// distinctness NFA because carrying the target digit through the whole scan
// alongside a 512-value mask would multiply that NFA's state count past the
// 4096-state cap; the running sum alone does not. "No two sections share a
// missing digit" needs no separate constraint: sudoku fixes each digit at
// exactly 9 occurrences in the grid, exactly one of which is the digit's own
// unvisited cell, so each digit occurs exactly 8 times on-loop; once every
// section is internally distinct, a digit missing from more than one
// section would occur fewer than 8 times on-loop, which is already excluded.
//
// Finally, one small NFA per grid edge and per direction reads the
// would-be-unvisited cell's digit against the neighbour's section label and
// that section's missing digit, rejecting a match -- the rule's adjacency
// ban, checked both ways since either side of an edge could be the
// unvisited one.
//
// Nothing is omitted.

const shape = new Shape('9x9', 10);
const graph = cellGraph(shape);
const geometry = graph.gridGeometry();
const gridCells = graph.cells();
const NV = geometry.numValues; // 10: digits 1-9 plus the section sentinel

const OFF_SEC = 10; // secIdx value for an off-loop cell

// A cell's fixed position (1-9) within its own 3x3 box, reading order.
const boxPosAt = (row, col) => ((row - 1) % 3) * 3 + ((col - 1) % 3) + 1;
const boxPosOf = cell => { const { row, col } = parseCellId(cell); return boxPosAt(row, col); };

// --- Loop: steps, degree, position counters (mirrors the "loop through all
// but nine cells" pattern, with the fixed hole-digit replaced by each cell's
// own box position) ---------------------------------------------------------
const UNUSED = 1, FWD = 2, BWD = 3;
const MOD_A = 8, MOD_B = 9;   // coprime; lcm 72 = the exact on-loop cell count
const OFF_POS = 1;

const posA = graph.makeOverlay('VA');
const posB = graph.makeOverlay('VB');

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

// Reads a cell's digit (on-loop iff digit !== K), then each step it is an
// endpoint of, requiring in-degree/out-degree 1 when on-loop and 0 when off.
const degreeNFA = (incident, K) => NFA.encodeSpec({
  startState: { k: 0 },
  transition: (s, value) => {
    if (s.k === 0) return { k: 1, on: value !== K, in: 0, out: 0 };
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
}, NV);
const degrees = gridCells.map(cell => {
  const incident = stepsAt.get(cell);
  return new NFA(degreeNFA(incident, boxPosOf(cell)), 'loop-degree',
    cell, ...incident.map(s => s.id));
});

// Position along the loop, mod 8 and mod 9; incrementing along every used
// step forces any closed sub-cycle to a length divisible by lcm(8, 9) = 72.
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
}, NV);
const counterA = counterNFA(MOD_A), counterB = counterNFA(MOD_B);
const counters = steps.flatMap(s => [
  new NFA(counterA, 'loop-position', s.id, posA.at(s.a), posA.at(s.b)),
  new NFA(counterB, 'loop-position', s.id, posB.at(s.a), posB.at(s.b)),
]);

// An off-loop cell carries no position; pin it to OFF_POS rather than
// leaving nine spare assignments. Cached per box-position value K.
const offPosKeyCache = new Map();
const offPosKeyFor = K => {
  if (!offPosKeyCache.has(K)) offPosKeyCache.set(
    K, Pair.fnToKey((digit, pos) => digit !== K || pos === OFF_POS, NV));
  return offPosKeyCache.get(K);
};
const offPositions = gridCells.flatMap(cell => {
  const key = offPosKeyFor(boxPosOf(cell));
  return [new Pair(key, 'off-loop-position', cell, posA.at(cell)),
          new Pair(key, 'off-loop-position', cell, posB.at(cell))];
});

// Seam: R1C1's own box position is 1 (it is box 1's top-left cell), so both
// counters are pinned there -- position 0 when R1C1 is on-loop, and its
// natural off-loop value otherwise. Row 1 has exactly one unvisited cell
// (enforced below), so R1C1 and R1C2 cannot both be off-loop, which is what
// lets R1C2 safely inherit the seam when R1C1 is off.
const seamStarts = [
  new Given(posA.at('R1C1'), OFF_POS),
  new Given(posB.at('R1C1'), OFF_POS),
  new Pair(offPosKeyFor(1), 'loop-seam', 'R1C1', posA.at('R1C2')),
  new Pair(offPosKeyFor(1), 'loop-seam', 'R1C1', posB.at('R1C2')),
];
// Direction: if R1C1 is on-loop, its step to R1C2 runs forward; if it is
// off-loop, R1C2's only other neighbours are R1C3 and R2C2, so its step to
// R1C3 is used, and that direction runs forward instead.
const seamDirection = new NFA(NFA.encodeSpec({
  startState: { k: 0 },
  transition: (s, value) => {
    if (s.k === 0) return { k: 1, on: value !== 1 };
    if (s.k === 1) return (s.on && value !== FWD) ? undefined : { k: 2, on: s.on };
    if (s.k !== 2) return undefined;
    return (!s.on && value !== FWD) ? undefined : { k: 3 };
  },
  accept: s => s.k === 3,
}, NV), 'loop-seam',
  'R1C1', stepBetween('R1C1', 'R1C2').id, stepBetween('R1C2', 'R1C3').id);

const posDomains = [
  posA.makeReplicate(new Given(posA.at(gridCells[0]), 1, 2, 3, 4, 5, 6, 7, 8)),
  posB.makeReplicate(new Given(posB.at(gridCells[0]), 1, 2, 3, 4, 5, 6, 7, 8, 9)),
];

// --- "Exactly one unvisited cell per row/column/box", and the row's own
// unvisited digit (RV), read off in the same scan ---------------------------
const rvVar = new Var('RV', "each row's unvisited-cell digit", 9);
const rvCells = rvVar.cells();
const rvDomains = rvCells.map(c => new Given(c, 1, 2, 3, 4, 5, 6, 7, 8, 9));

// Scans nine digits against a fixed per-position box-position sequence,
// requiring exactly one match, and reads that cell's digit into a final
// (row-only) output cell.
const rowSpecCache = new Map();
const rowSpec = seq => {
  const key = seq.join(',');
  if (!rowSpecCache.has(key)) rowSpecCache.set(key, NFA.encodeSpec({
    startState: { k: 0, matchCount: 0, matchDigit: null },
    transition: (s, value) => {
      if (s.k < 9) {
        const match = value === seq[s.k];
        if (match && s.matchCount >= 1) return undefined;
        return {
          k: s.k + 1, matchCount: s.matchCount + (match ? 1 : 0),
          matchDigit: match ? value : s.matchDigit,
        };
      }
      if (s.k === 9) {
        if (s.matchCount !== 1) return undefined;
        return value === s.matchDigit ? { k: 10, done: true } : undefined;
      }
      return undefined;
    },
    accept: s => s.done === true,
  }, NV));
  return rowSpecCache.get(key);
};
// Exactly-one check with no output, reused for columns and boxes.
const countSpecCache = new Map();
const countSpec = seq => {
  const key = seq.join(',');
  if (!countSpecCache.has(key)) countSpecCache.set(key, NFA.encodeSpec({
    startState: { k: 0, matchCount: 0 },
    transition: (s, value) => {
      if (s.k >= 9) return undefined;
      const match = value === seq[s.k];
      if (match && s.matchCount >= 1) return undefined;
      return { k: s.k + 1, matchCount: s.matchCount + (match ? 1 : 0) };
    },
    accept: s => s.k === 9 && s.matchCount === 1,
  }, NV));
  return countSpecCache.get(key);
};

const rowConstraints = Array.from({ length: 9 }, (_, i) => {
  const r = i + 1, seq = Array.from({ length: 9 }, (_, c) => boxPosAt(r, c + 1));
  return new NFA(rowSpec(seq), 'unvisited-row', ...graph.row(r), rvCells[i]);
});
const colConstraints = Array.from({ length: 9 }, (_, i) => {
  const c = i + 1, seq = Array.from({ length: 9 }, (_, r) => boxPosAt(r + 1, c));
  return new NFA(countSpec(seq), 'unvisited-col', ...graph.column(c));
});
// Every box's own cells are numbered 1-9 by definition, so one sequence
// serves all nine boxes.
const boxSeq = [1, 2, 3, 4, 5, 6, 7, 8, 9];
const boxConstraints = Array.from({ length: 9 }, (_, i) =>
  new NFA(countSpec(boxSeq), 'unvisited-box', ...graph.box(i + 1)));

const unvisitedAllDifferent = new AllDifferent(...rvCells);

// --- Sections: existence of a valid 8-cell division, as a shared rotation
// choice ---------------------------------------------------------------------
const rotVar = new Var('ROT', 'section cut phase (1-8)', 1);
const ROT = rotVar.cells()[0];
const rotDomain = new Given(ROT, 1, 2, 3, 4, 5, 6, 7, 8);

// Chinese-remainder lookup: CRT[posA-1][posB-1] = the unique absolute loop
// position 0-71 with that residue pair. Never stored as a Var (72 values
// would exceed the 16-value hard limit) -- purely a compile-time table baked
// into the section-index NFA below.
const CRT = Array.from({ length: MOD_A }, () => Array(MOD_B).fill(null));
for (let x = 0; x < MOD_A * MOD_B; x++) CRT[x % MOD_A][x % MOD_B] = x;
// Section label 1-9 for absolute position `pos` when the cut phase is `rot`
// (rot 1-8, cutting the loop into sections right after residue rot - 1).
const secLabel = (pos, rot) =>
  Math.floor((((pos - (rot - 1)) % 72) + 72) % 72 / 8) + 1;

const secIdx = graph.makeOverlay('VC');

// Reads a cell's digit (off-loop iff digit === K), its posA/posB, and the
// shared ROT, and pins its section label (or OFF_SEC when off-loop).
const secSpecCache = new Map();
const secSpecFor = K => {
  if (!secSpecCache.has(K)) secSpecCache.set(K, NFA.encodeSpec({
    startState: { k: 0 },
    transition: (s, value) => {
      if (s.k === 0) return { k: 1, off: value === K };
      if (s.k === 1) return { k: 2, off: s.off, pA: value };
      if (s.k === 2) return { k: 3, off: s.off, pA: s.pA, pB: value };
      if (s.k === 3) return { k: 4, off: s.off, pA: s.pA, pB: s.pB, rot: value };
      if (s.k !== 4) return undefined;
      if (!s.off) {
        // pA/pB/rot range over the whole widened alphabet while this spec is
        // compiled; only the in-range combination the domain Givens allow
        // elsewhere is ever reachable when actually solving.
        if (s.pA < 1 || s.pA > MOD_A || s.pB < 1 || s.pB > MOD_B ||
          s.rot < 1 || s.rot > 8) return undefined;
      }
      const expected = s.off ? OFF_SEC : secLabel(CRT[s.pA - 1][s.pB - 1], s.rot);
      return value === expected ? { done: true } : undefined;
    },
    accept: s => s.done === true,
  }, NV));
  return secSpecCache.get(K);
};
const secDefs = gridCells.map(cell => new NFA(
  secSpecFor(boxPosOf(cell)), 'section-index',
  cell, posA.at(cell), posB.at(cell), ROT, secIdx.at(cell)));

// --- Per section: eight different digits, and the missing one --------------
const msVar = new Var('MS', "each section's missing digit", 9);
const msCells = msVar.cells();
const msDomains = msCells.map(c => new Given(c, 1, 2, 3, 4, 5, 6, 7, 8, 9));

const secDigitTokens = gridCells.flatMap(cell => [secIdx.at(cell), cell]);
const popcount = m => { let c = 0; while (m) { c += m & 1; m >>= 1; } return c; };

// Distinctness: an accumulated bitmask of digits seen under this label, kept
// out of any stored Var (it would need up to 512 values) -- it lives only in
// the NFA's own internal state, which the 4096-state cap allows.
const distinctFor = label => NFA.encodeSpec({
  startState: { atLabel: 0, mask: 0 },
  transition: (s, value) => (s.atLabel === 0)
    ? { atLabel: 1, mask: s.mask, pending: value === label }
    : { atLabel: 0, mask: s.pending ? (s.mask | (1 << (value - 1))) : s.mask },
  accept: s => s.atLabel === 0 && popcount(s.mask) === 8,
}, NV);
const distinctness = Array.from({ length: 9 }, (_, i) =>
  new NFA(distinctFor(i + 1), 'section-distinct', ...secDigitTokens));

// Missing digit: a running sum over the same scan, kept in a separate NFA
// (not fused with the bitmask above) because carrying the target digit
// through 162 tokens alongside a 512-value mask would exceed the state cap;
// a 73-value running sum does not. Reads the section's own MS cell first
// (as the target), then the interleaved scan, and checks sum + target = 45
// at the end.
const sumFor = label => NFA.encodeSpec({
  startState: { k: 0 },
  transition: (s, value) => {
    if (s.k === 0) return { k: 1, target: value, atLabel: 0, sum: 0 };
    if (s.atLabel === 0) {
      return { k: 1, target: s.target, atLabel: 1, sum: s.sum, pending: value === label };
    }
    // Cap the running sum: a valid section sum is at most 44 (45 minus a
    // real 1-9 target), and the compiler otherwise explores paths where
    // every one of the 81 scanned cells is "pending", which would carry the
    // sum past any useful bound and blow the state cap.
    const sum = s.sum + (s.pending ? value : 0);
    if (sum > 44) return undefined;
    return { k: 1, target: s.target, atLabel: 0, sum };
  },
  accept: s => s.k === 1 && s.atLabel === 0 && s.sum + s.target === 45,
}, NV);
const missingDigits = Array.from({ length: 9 }, (_, i) =>
  new NFA(sumFor(i + 1), 'section-missing', msCells[i], ...secDigitTokens));

// --- Adjacency ban: the unvisited cell holding a section's missing digit
// may not touch that section -------------------------------------------------
// Reads the candidate unvisited cell's digit (off-loop iff digit === K),
// then the neighbour's section label, then all nine MS cells in order,
// rejecting if the candidate is off-loop, the neighbour is on some section
// s, and MS[s] equals the candidate's digit.
const adjSpecCache = new Map();
const adjSpecFor = K => {
  if (!adjSpecCache.has(K)) adjSpecCache.set(K, NFA.encodeSpec({
    startState: { k: 0 },
    transition: (s, value) => {
      if (s.k === 0) return { k: 1, off: value === K, digit: value };
      if (s.k === 1) {
        const active = s.off && value !== OFF_SEC;
        return { k: 2, active, label: value, digit: s.digit, mIdx: 0 };
      }
      const mIdx = s.mIdx + 1;
      if (s.active && mIdx === s.label && value === s.digit) return undefined;
      if (mIdx === 9) return { k: 3, done: true };
      return { k: 2, active: s.active, label: s.label, digit: s.digit, mIdx };
    },
    accept: s => s.done === true,
  }, NV));
  return adjSpecCache.get(K);
};
const adjacency = steps.flatMap(({ a, b }) => [
  new NFA(adjSpecFor(boxPosOf(a)), 'section-touch', a, secIdx.at(b), ...msCells),
  new NFA(adjSpecFor(boxPosOf(b)), 'section-touch', b, secIdx.at(a), ...msCells),
]);

// --- Givens ------------------------------------------------------------------
const givens = [
  new Given('R1C1', 1), new Given('R1C7', 6),
  new Given('R5C8', 7), new Given('R5C9', 4),
  new Given('R6C3', 1),
  new Given('R7C2', 2), new Given('R7C5', 4), new Given('R7C9', 7),
  new Given('R8C8', 9),
];

const gridDomain = graph.makeReplicate(
  new Given(gridCells[0], 1, 2, 3, 4, 5, 6, 7, 8, 9));

return [
  shape,
  new Var('S', 'loop steps', steps.length),
  posA.toVar('loop position mod ' + MOD_A),
  posB.toVar('loop position mod ' + MOD_B),
  secIdx.toVar('section label (1-9; 10 = off-loop)'),
  rvVar,
  rotVar,
  msVar,
  gridDomain,
  ...posDomains,
  ...rvDomains,
  rotDomain,
  ...msDomains,
  ...givens,
  ...degrees,
  ...counters,
  ...offPositions,
  ...seamStarts,
  seamDirection,
  ...rowConstraints,
  ...colConstraints,
  ...boxConstraints,
  unvisitedAllDifferent,
  ...secDefs,
  ...distinctness,
  ...missingDigits,
  ...adjacency,
];
