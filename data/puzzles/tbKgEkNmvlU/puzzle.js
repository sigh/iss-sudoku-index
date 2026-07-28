// Title: The Mysterious Loop
// Author: Die Hard
// Video: https://www.youtube.com/watch?v=tbKgEkNmvlU
// Source: https://sudokupad.app/y5u0ncu31x

// Normal sudoku. A closed loop steps between cell centres, orthogonally or
// diagonally, through no more than 23 cells. It visits every box except box 5,
// the shaded one, and no cell of box 5. Counting only loop cells: digit 1
// appears once, the digit in the circle (R5C5) appears twice, and every other
// digit N that appears at all appears N times. Two cells joined by a loop step
// hold different digits. The box borders cut the loop into arcs and every arc
// has the same digit sum.
//
// Nothing is omitted. The rules never forbid the loop from crossing itself, and
// two diagonal steps of one 2x2 square cross at a shared corner without sharing
// a cell, so no anti-crossing constraint is added.

// The alphabet is widened to 16 so the Var layers can carry loop state; the 81
// grid cells are pinned back to 1-9 below. Four whole-grid layers plus one step
// Var per king-move adjacency model the loop:
//   VA, VB  position along the loop, modulo MOD_A and MOD_B
//   VC      running sum of the current arc, offset by 1 (value 1 = off-loop)
//   VD      the cell's digit when it is on the loop, LD_OFF when it is not
//   VS..    one per adjacency: unused, or used in one of the two directions
//   VP      the common arc sum, offset by 1 to match VC
const NV = 16;
const MAX_LEN = 23;                  // "no more than 23 cells"
// Two position counters with coprime moduli. A cycle of steps that avoids the
// seam cell (below) must have length divisible by both, i.e. by 35, and no more
// than MAX_LEN cells are on the loop at all -- so the only cycle that survives
// is the one through the seam. In/out degree alone would admit extra cycles:
// a king-move grid has 3-cycles everywhere.
const MOD_A = 5, MOD_B = 7;
const OFF = 1, SEAM = 2, FIRST = 3;  // position-layer values
const UNUSED = 1, FWD = 2, BWD = 3;  // step values: unused, a->b, b->a
const LD_OFF = 10;                   // loop-digit layer: cell is off the loop
// VC and VP hold (arc sum + 1), so the widened alphabet caps an arc sum at 15.
// The rules bound the common arc sum below that on their own: the loop's digit
// multiset is fixed by the count rules, its total is the number of arcs times
// the common sum, and there are at least 8 arcs (one per visited box), which
// leaves 12 as the largest sum any legal loop can reach.
const CIRCLE = 'R5C5';               // the circle covers this cell alone
const SHADED_BOX = 5;

const shape = new Shape('9x9', NV);
const graph = cellGraph(shape);
const gridCells = graph.cells();
const posA = graph.makeOverlay('VA');
const posB = graph.makeOverlay('VB');
const arcSum = graph.makeOverlay('VC');
const loopDigit = graph.makeOverlay('VD');
const SUM_VAR = 'VP';

const cellIndex = new Map(gridCells.map((cell, n) => [cell, n]));
const boxOf = cell => {
  const { row, col } = parseCellId(cell);
  return (Math.ceil(row / 3) - 1) * 3 + Math.ceil(col / 3);
};
const offShadedBox = cell => boxOf(cell) !== SHADED_BOX;

// --- Step variables -------------------------------------------------------
// One Var per king-move adjacency. Steps touching the shaded box are left out
// entirely: a used step needs both its cells on the loop, and no cell of box 5
// is on the loop.
const STEP_DIRS = [[0, 1], [1, 0], [1, 1], [1, -1]];
const steps = [];
const stepsAt = new Map(gridCells.map(cell => [cell, []]));
for (const cell of gridCells) {
  if (!offShadedBox(cell)) continue;
  for (const [dR, dC] of STEP_DIRS) {
    const other = graph.step(cell, dR, dC);
    if (!other || !offShadedBox(other)) continue;
    const id = 'VS' + (steps.length + 1);
    steps.push({ id, a: cell, b: other });
    stepsAt.get(cell).push({ id, out: FWD, in: BWD, other });
    stepsAt.get(other).push({ id, out: BWD, in: FWD, other: cell });
  }
}
// Incident steps are read in order of the neighbour's row-major index, which is
// what lets the seam pin a direction of travel below.
for (const list of stepsAt.values()) {
  list.sort((p, q) => cellIndex.get(p.other) - cellIndex.get(q.other));
}
const loopCells = gridCells.filter(offShadedBox);
const sameBoxAt = cell =>
  stepsAt.get(cell).filter(s => boxOf(s.other) === boxOf(cell));
const crossBoxAt = cell =>
  stepsAt.get(cell).filter(s => boxOf(s.other) !== boxOf(cell));

// --- State machines -------------------------------------------------------
const memo = new Map();
const cached = (key, build) => {
  if (!memo.has(key)) memo.set(key, build());
  return memo.get(key);
};

// Reads VA, VB, VC, the digit, then VD. The four layers must agree on whether
// the cell is on the loop, both position layers must mark the same seam cell,
// and VD mirrors the digit exactly when the cell is on the loop.
const cellStateNFA = cached('cell-state', () => NFA.encodeSpec({
  startState: { k: 0 },
  transition: (s, value) => {
    if (s.k === 0) {
      if (value > SEAM + MOD_A) return undefined;
      return { k: 1, off: value === OFF, seam: value === SEAM };
    }
    if (s.k === 1) {
      if (value > SEAM + MOD_B) return undefined;
      if ((value === OFF) !== s.off || (value === SEAM) !== s.seam) return undefined;
      return { k: 2, off: s.off };
    }
    if (s.k === 2) {
      if ((value === 1) !== s.off) return undefined;   // VC 1 == arc sum 0
      return { k: 3, off: s.off };
    }
    if (s.k === 3) {
      if (value > 9) return undefined;
      return { k: 4, off: s.off, d: value };
    }
    if (s.k === 4) return value === (s.off ? LD_OFF : s.d) ? { done: true } : undefined;
    return undefined;
  },
  accept: s => s.done === true,
}, NV));

// Reads VA, then every step the cell is an endpoint of. A cell off the loop
// uses none of them; a cell on the loop is entered once and left once. The seam
// cell must be left along its first incident step, which fixes the loop's
// direction of travel and so rules out the mirror image of every solution.
const degreeNFA = incident => cached(
  'deg|' + incident.map(s => s.in + '/' + s.out).join(','),
  () => NFA.encodeSpec({
    startState: { k: 0 },
    transition: (s, value) => {
      if (s.k === 0) {
        if (value > SEAM + MOD_A) return undefined;
        return { k: 1, on: value !== OFF, seam: value === SEAM, in: 0, out: 0 };
      }
      const i = s.k - 1;
      if (i >= incident.length) return undefined;
      const st = incident[i];
      let { in: nIn, out: nOut } = s;
      if (value === st.out) nOut++;
      else if (value === st.in) {
        if (s.seam && nOut === 0) return undefined;
        nIn++;
      } else if (value !== UNUSED) return undefined;
      if (nIn > 1 || nOut > 1) return undefined;
      return { k: s.k + 1, on: s.on, seam: s.seam, in: nIn, out: nOut };
    },
    accept: s => s.k === incident.length + 1 &&
      (s.on ? (s.in === 1 && s.out === 1) : (s.in === 0 && s.out === 0)),
  }, NV));

// Reads a step and the positions of its two cells. A used step advances the
// counter by one along the direction of travel. The step into the seam cell is
// exempt -- the seam is where the cycle's numbering wraps -- and the step out of
// it lands on FIRST, which pins the numbering itself.
const nextPos = (v, mod) => FIRST + ((v - FIRST + 1) % mod);
const counterNFA = mod => cached('cnt' + mod, () => NFA.encodeSpec({
  startState: { k: 0 },
  transition: (s, value) => {
    if (s.k === 0) {
      if (value > BWD) return undefined;
      return { k: 1, step: value };
    }
    if (s.k === 1) {
      if (value > SEAM + mod) return undefined;
      return { k: 2, step: s.step, pa: value };
    }
    if (s.k !== 2) return undefined;
    if (value > SEAM + mod) return undefined;
    if (s.step === UNUSED) return { done: true };
    const pa = s.pa, pb = value;
    if (pa === OFF || pb === OFF) return undefined;
    const src = s.step === FWD ? pa : pb;
    const tgt = s.step === FWD ? pb : pa;
    if (tgt === SEAM) return { done: true };
    if (src === SEAM) return tgt === FIRST ? { done: true } : undefined;
    return tgt === nextPos(src, mod) ? { done: true } : undefined;
  },
  accept: s => s.done === true,
}, NV));

// Digits joined by a step of the loop are different.
const differNFA = cached('differ', () => NFA.encodeSpec({
  startState: { k: 0 },
  transition: (s, value) => {
    if (s.k === 0) return { k: 1, used: value !== UNUSED };
    if (s.k === 1) return { k: 2, used: s.used, a: value };
    if (s.k !== 2) return undefined;
    if (!s.used) return { done: true };
    return s.a !== value ? { done: true } : undefined;
  },
  accept: s => s.done === true,
}, NV));

// Scans VA over the whole grid in row-major order: the first cell on the loop
// is the seam, and no other cell is. That makes the seam a function of the loop
// rather than a free choice, so it adds no solutions of its own.
const seamNFA = cached('seam', () => NFA.encodeSpec({
  startState: { seen: false },
  transition: (s, value) => {
    if (value > SEAM + MOD_A) return undefined;
    if (!s.seen) {
      if (value === OFF) return { seen: false };
      return value === SEAM ? { seen: true } : undefined;
    }
    return value === SEAM ? undefined : { seen: true };
  },
  accept: s => s.seen === true,
}, NV));

// The running arc sum. Reads the cell's digit and its own VC, then each step to
// a cell of the same box paired with that cell's VC, then the steps that leave
// the box. `t` is the VC value the arc's previous cell must hold: t == 1 means
// the arc sum before this cell was 0, i.e. this cell starts an arc and so must
// be entered from another box.
const accNFA = (sameBox, crossBox) => cached(
  'acc|' + sameBox.map(s => s.in).join(',') + '|' + crossBox.map(s => s.in).join(','),
  () => {
    const total = 2 + 2 * sameBox.length + crossBox.length;
    return NFA.encodeSpec({
      startState: { k: 0 },
      transition: (s, value) => {
        if (s.k === 0) {
          if (value > 9) return undefined;
          return { k: 1, d: value };
        }
        if (s.k === 1) {
          if (value === 1) return { k: 2, t: 0, found: 0, pend: 0 };  // off-loop
          const t = value - s.d;
          if (t < 1) return undefined;
          return { k: 2, t, found: 0, pend: 0 };
        }
        const i = s.k - 2;
        if (i < 2 * sameBox.length) {
          if (i % 2 === 0) {
            const st = sameBox[i / 2];
            if (value === st.in) {
              if (s.t < 2 || s.found) return undefined;
              return { k: s.k + 1, t: s.t, found: 1, pend: 1 };
            }
            if (value === st.out || value === UNUSED) {
              return { k: s.k + 1, t: s.t, found: s.found, pend: 0 };
            }
            return undefined;
          }
          if (s.pend && value !== s.t) return undefined;
          return { k: s.k + 1, t: s.t, found: s.found, pend: 0 };
        }
        const j = i - 2 * sameBox.length;
        if (j >= crossBox.length) return undefined;
        const st = crossBox[j];
        if (value === st.in) {
          if (s.t !== 1 || s.found) return undefined;
          return { k: s.k + 1, t: s.t, found: 1, pend: 0 };
        }
        if (value === st.out || value === UNUSED) {
          return { k: s.k + 1, t: s.t, found: s.found, pend: 0 };
        }
        return undefined;
      },
      accept: s => s.k === total && (s.t === 0 ? s.found === 0 : s.found === 1),
    }, NV);
  });

// Closes an arc: reads the common sum VP and the cell's own VC, then the steps
// that leave the cell's box. If one of them is the step out, this cell is the
// arc's last cell and its running sum must already be the common total.
const segEndNFA = crossBox => cached(
  'end|' + crossBox.map(s => s.out).join(','),
  () => NFA.encodeSpec({
    startState: { k: 0 },
    transition: (s, value) => {
      if (s.k === 0) {
        if (value < 2) return undefined;     // the common arc sum is at least 1
        return { k: 1, p: value };
      }
      if (s.k === 1) return { k: 2, off: value === 1, eq: value === s.p };
      const j = s.k - 2;
      if (j >= crossBox.length) return undefined;
      const st = crossBox[j];
      if (value === st.out) {
        if (s.off || !s.eq) return undefined;
      } else if (value !== st.in && value !== UNUSED) return undefined;
      return { k: s.k + 1, off: s.off, eq: s.eq };
    },
    accept: s => s.k === 2 + crossBox.length,
  }, NV));

// Counts loop cells over VD, rejecting as soon as the limit is passed.
const lengthNFA = cached('length', () => NFA.encodeSpec({
  startState: { n: 0 },
  transition: (s, value) => {
    const n = value === LD_OFF ? s.n : s.n + 1;
    return n > MAX_LEN ? undefined : { n };
  },
  accept: () => true,
}, NV));

// Reads the circled cell's digit, then VD over the whole grid. If the circle
// holds this digit it must be on the loop exactly twice; digit 1 must be on the
// loop exactly once (so the circle cannot hold a 1, which would demand both);
// any other digit is on the loop either not at all or exactly N times.
const countNFA = d => cached('count' + d, () => NFA.encodeSpec({
  startState: { k: 0 },
  transition: (s, value) => {
    if (s.k === 0) return { circ: value === d, n: 0 };
    const n = value === d ? s.n + 1 : s.n;
    const cap = s.circ ? 2 : d;
    return n > cap ? undefined : { circ: s.circ, n };
  },
  accept: s => s.k !== 0 &&
    (s.circ ? (d !== 1 && s.n === 2)
      : (d === 1 ? s.n === 1 : (s.n === 0 || s.n === d))),
}, NV));

// At least one cell of the box is on the loop.
const boxCoverNFA = cached('box-cover', () => NFA.encodeSpec({
  startState: { seen: false },
  transition: (s, value) => ({ seen: s.seen || value !== LD_OFF }),
  accept: s => s.seen === true,
}, NV));

// --- Constraint groups ----------------------------------------------------
const layers = [
  posA.toVar('loop position mod ' + MOD_A),
  posB.toVar('loop position mod ' + MOD_B),
  arcSum.toVar('running arc sum + 1'),
  loopDigit.toVar('digit when on the loop'),
  new Var('S', 'loop steps', steps.length),
  new Var('P', 'the common arc sum + 1', 1),
];
const range = (from, to) =>
  Array.from({ length: to - from + 1 }, (_, n) => from + n);
const domains = [
  graph.makeReplicate(new Given(gridCells[0], ...range(1, 9))),
  posA.makeReplicate(new Given(posA.at(gridCells[0]), ...range(1, SEAM + MOD_A))),
  posB.makeReplicate(new Given(posB.at(gridCells[0]), ...range(1, SEAM + MOD_B))),
  loopDigit.makeReplicate(new Given(loopDigit.at(gridCells[0]), ...range(1, LD_OFF))),
  new Given(SUM_VAR, ...range(2, NV)),
];
// VC needs no domain constraint (it uses the whole widened range), and the step
// Vars are held to unused/in/out by the degree machine at each of their cells.

// The 13 printed digits.
const givens = [
  new Given('R1C2', 6), new Given('R1C8', 9), new Given('R2C9', 6),
  new Given('R3C5', 8), new Given('R4C1', 4), new Given('R4C4', 1),
  new Given('R5C3', 2), new Given('R5C7', 3), new Given('R7C5', 6),
  new Given('R8C1', 6), new Given('R9C4', 3), new Given('R9C8', 6),
  new Given('R9C9', 8),
];

// The loop passes through no cell of the shaded box, and at least one cell of
// each of the other eight.
const shadedBox = graph.box(SHADED_BOX).map(cell => new Given(posA.at(cell), OFF));
const boxCover = graph.boxes()
  .filter((_, n) => n + 1 !== SHADED_BOX)
  .map(cells => new NFA(boxCoverNFA, 'loop-box', ...loopDigit.at(cells)));

const cellState = gridCells.map(cell => new NFA(
  cellStateNFA, 'loop-cell',
  posA.at(cell), posB.at(cell), arcSum.at(cell), cell, loopDigit.at(cell)));

const degrees = loopCells.map(cell => new NFA(
  degreeNFA(stepsAt.get(cell)), 'loop-degree',
  posA.at(cell), ...stepsAt.get(cell).map(s => s.id)));

const order = [
  new NFA(seamNFA, 'loop-seam', ...posA.at(gridCells)),
  ...steps.flatMap(s => [
    new NFA(counterNFA(MOD_A), 'loop-order', s.id, posA.at(s.a), posA.at(s.b)),
    new NFA(counterNFA(MOD_B), 'loop-order', s.id, posB.at(s.a), posB.at(s.b)),
  ]),
];

const differences = steps.map(s =>
  new NFA(differNFA, 'loop-differ', s.id, s.a, s.b));

const arcSums = loopCells.flatMap(cell => {
  const sameBox = sameBoxAt(cell), crossBox = crossBoxAt(cell);
  const running = new NFA(
    accNFA(sameBox, crossBox), 'loop-arc-sum',
    cell, arcSum.at(cell),
    ...sameBox.flatMap(s => [s.id, arcSum.at(s.other)]),
    ...crossBox.map(s => s.id));
  // A cell with no step out of its box can never end an arc.
  if (!crossBox.length) return [running];
  return [running, new NFA(
    segEndNFA(crossBox), 'loop-arc-end',
    SUM_VAR, arcSum.at(cell), ...crossBox.map(s => s.id))];
});

const counts = [
  new NFA(lengthNFA, 'loop-length', ...loopDigit.at(gridCells)),
  ...range(1, 9).map(d => new NFA(
    countNFA(d), 'loop-digit-count', CIRCLE, ...loopDigit.at(gridCells))),
];

return [
  shape,
  ...layers,
  ...domains,
  ...givens,
  ...shadedBox,
  ...cellState,
  ...degrees,
  ...order,
  ...differences,
  ...arcSums,
  ...boxCover,
  ...counts,
];
