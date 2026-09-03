// Title: Rockingham
// Author: damo_89
// Video: https://www.youtube.com/watch?v=wZps_EnRcNE
// Source: https://sudokupad.app/9o9qq364b1

// Rules encoded here, in full:
//  - Normal sudoku: 1 to 9 once each in every row, column and 3x3 box.
//  - Mid Loop: a single 1-cell-wide loop of orthogonally connected cells that
//    does not branch and enters no cell more than once. It must pass through
//    every grey dot -- a dot sits on the border between two cells, so the loop
//    steps across that border -- and every dot must lie in the middle of a
//    straight loop segment: the distance from the dot to the next turn along the
//    loop is the same in both directions.
//  - Ambiguous Kropki: two digits either side of a grey dot are consecutive or
//    one is double the other; two digits in cells consecutive along the loop
//    whose shared border carries no dot are neither.
// Nothing is omitted. "1-cell-wide" describes the loop as a single chain of
// cells and adds nothing beyond "does not branch or enter any cell more than
// once": read instead as "no 2x2 block of the grid lies wholly on the loop" it
// leaves the Mid Loop dots with no loop at all in this grid, so the loop is free
// to run alongside itself.

// The alphabet is widened so the position counters below fit; the 81 grid cells
// are pinned back to 1-9 with the domains.
const NV = 11;

// Coprime moduli for the two position counters: a cycle of steps beside the loop
// would need a length divisible by both, i.e. by 90, and the grid holds 81 cells.
const MOD_A = 10, MOD_B = 9;
const OFF = 1;      // counter value of a cell the loop misses
const FIRST = 2;    // counter value of the seam cell

// Step values. A step is stored once, on the (a, b) pair built below, where a is
// always the left or upper cell; FWD means the loop runs a->b and BWD b->a.
const UNUSED = 1, FWD = 2, BWD = 3;

// The fourteen drawn grey dots, each named by the two cells whose shared border
// carries it (payload overlay circles, fill #dadada, centred on a cell border).
const ROW_DOTS = [                    // on a vertical border, within one row
  ['R1C8', 'R1C9'], ['R2C3', 'R2C4'], ['R3C1', 'R3C2'], ['R4C4', 'R4C5'],
  ['R4C7', 'R4C8'], ['R5C7', 'R5C8'], ['R7C3', 'R7C4'], ['R9C3', 'R9C4'],
  ['R9C7', 'R9C8'],
];
const COL_DOTS = [                    // on a horizontal border, within one column
  ['R1C1', 'R2C1'], ['R3C2', 'R4C2'], ['R3C9', 'R4C9'], ['R6C1', 'R7C1'],
  ['R7C7', 'R8C7'],
];

// The nine given digits.
const GIVENS = [['R1C5', 2], ['R2C2', 1], ['R2C8', 9], ['R3C8', 3],
['R4C3', 4], ['R4C6', 7], ['R5C9', 5], ['R7C2', 8], ['R7C8', 6]];

const shape = new Shape('9x9', NV);
const graph = cellGraph(shape);
const gridCells = graph.cells();
const posA = graph.makeOverlay('VA');     // loop position mod MOD_A
const posB = graph.makeOverlay('VB');     // loop position mod MOD_B

// --- Step variables -------------------------------------------------------
// One Var per orthogonal grid border, recording whether the loop uses it and in
// which direction. There is no separate membership layer: a cell is on the loop
// exactly when its counters are not OFF.
const steps = [];
const stepsAt = new Map(gridCells.map(cell => [cell, []]));
const stepIndex = new Map();
for (const cell of gridCells) {
  for (const [dRow, dCol] of [[0, 1], [1, 0]]) {
    const other = graph.step(cell, dRow, dCol);
    if (!other) continue;
    const id = 'VS' + (steps.length + 1);
    steps.push({ id, a: cell, b: other });
    stepIndex.set(cell + '|' + other, id);
    stepsAt.get(cell).push({ id, out: FWD, in: BWD });
    stepsAt.get(other).push({ id, out: BWD, in: FWD });
  }
}
const rowSteps = r => Array.from({ length: 8 },
  (_, n) => stepIndex.get(makeCellId(r, n + 1) + '|' + makeCellId(r, n + 2)));
const colSteps = c => Array.from({ length: 8 },
  (_, n) => stepIndex.get(makeCellId(n + 1, c) + '|' + makeCellId(n + 2, c)));

// The dot on the R3C1/R3C2 border puts R3C1 on the loop whatever the loop turns
// out to be, so it can carry the counter seam: numbering starts there, and runs
// out of it eastward along the border the dot forces onto the loop. Pinning that
// direction leaves only one of the two numberings of the same loop.
const SEAM = 'R3C1';
const SEAM_OUT = stepIndex.get('R3C1|R3C2');

const memo = new Map();
const cached = (key, build) => {
  if (!memo.has(key)) memo.set(key, build());
  return memo.get(key);
};
const isStepValue = v => v === UNUSED || v === FWD || v === BWD;

// --- Loop shape -----------------------------------------------------------
// Per-cell machine: reads the cell's two counters, then every step it is an end
// of. A cell off the loop takes OFF in both layers and uses no step; every other
// cell is entered exactly once and left exactly once, which is degree two with
// no branching and no revisiting. The step values a cell sees depend on whether
// it is that step's a or b end, so the machine is keyed on that pattern.
function cellNFA(incident) {
  const sig = 'cell|' + incident.map(s => s.out).join(',');
  return cached(sig, () => NFA.encodeSpec({
    startState: { k: 0 },
    transition: (s, value) => {
      if (s.k === 0) return { k: 1, vis: value !== OFF, ins: 0, outs: 0 };
      if (s.k === 1) {
        if ((value !== OFF) !== s.vis) return undefined;
        return { k: 2, vis: s.vis, ins: 0, outs: 0 };
      }
      const n = s.k - 2;
      if (n >= incident.length) return undefined;
      const next = { k: s.k + 1, vis: s.vis, ins: s.ins, outs: s.outs };
      if (value === incident[n].in) next.ins++;
      else if (value === incident[n].out) next.outs++;
      else if (value !== UNUSED) return undefined;
      if (next.ins > 1 || next.outs > 1) return undefined;
      return next;
    },
    accept: s => s.k === 2 + incident.length &&
      (s.vis ? (s.ins === 1 && s.outs === 1) : (s.ins === 0 && s.outs === 0)),
  }, NV));
}
const loopShape = gridCells.map(cell => {
  const incident = stepsAt.get(cell);
  return new NFA(cellNFA(incident), 'loop-cell',
    posA.at(cell), posB.at(cell), ...incident.map(s => s.id));
});

// Position counters. Reads a step and then the two counters it joins: a used
// step makes the arriving cell's counter one more than the leaving cell's,
// modulo MOD. `skipFwd` / `skipBwd` are the seam exemption -- the single step
// that arrives back at the seam is left free in whichever direction that is, so
// the real loop can be numbered 1, 2, 3, ... around from the seam. The degree
// rules above otherwise admit a disjoint union of cycles; a second cycle misses
// the seam, so every one of its steps is constrained and its length would have
// to be divisible by MOD_A and MOD_B alike.
const nextPos = (v, mod) => FIRST + ((v - FIRST + 1) % mod);
const counterNFA = (mod, skipFwd, skipBwd) => cached(
  `counter|${mod}|${skipFwd}|${skipBwd}`, () => NFA.encodeSpec({
    startState: { k: 0 },
    transition: (s, value) => {
      if (s.k === 0) return isStepValue(value) ? { k: 1, dir: value } : undefined;
      if (s.k === 1) return { k: 2, dir: s.dir, a: value };
      if (s.k !== 2) return undefined;
      if (s.dir === UNUSED) return { done: true };
      if (s.a === OFF || value === OFF) return undefined;
      if (s.dir === FWD) {
        return (skipFwd || value === nextPos(s.a, mod)) ? { done: true } : undefined;
      }
      return (skipBwd || s.a === nextPos(value, mod)) ? { done: true } : undefined;
    },
    accept: s => s.done === true,
  }, NV));
const counters = steps.flatMap(s => [
  [posA, MOD_A], [posB, MOD_B],
].map(([layer, mod]) => new NFA(
  counterNFA(mod, s.b === SEAM, s.a === SEAM), 'loop-order',
  s.id, layer.at(s.a), layer.at(s.b))));

// "of orthogonally connected cells": the loop's cells are one orthogonally
// connected group. It says less than the counters above -- two strands running
// side by side are cell-connected without sharing a used border, so this alone
// would not make them one loop -- but it is the sentence's own words.
const connected = new ConnectedValues('VA', Array.from(
  { length: NV - 1 }, (_, n) => n + 2));   // every value but OFF: on the loop

// --- Mid Loop: a dot sits at the middle of its straight segment ------------
// Scans the eight borders of one row (or column) in order. Before the dotted
// border it carries the run of consecutively used borders ending at the current
// one; the dotted border itself must be used, which is how the loop is made to
// pass through the dot; after it, exactly that many further borders must be used
// and then one unused (or the grid edge), which is where the loop turns. So the
// straight run reaches the same distance either side of the dot.
const midNFA = (pos) => cached(`mid|${pos}`, () => NFA.encodeSpec({
  startState: { i: 0, phase: 'pre', run: 0, need: 0 },
  transition: (s, value) => {
    if (!isStepValue(value)) return undefined;
    const used = value !== UNUSED;
    const i = s.i + 1;
    if (s.phase === 'done') return { i, phase: 'done', run: 0, need: 0 };
    if (s.phase === 'post') {
      if (s.need > 0) {
        return used ? { i, phase: 'post', run: 0, need: s.need - 1 } : undefined;
      }
      return used ? undefined : { i, phase: 'done', run: 0, need: 0 };
    }
    if (i < pos) {
      return { i, phase: 'pre', run: used ? s.run + 1 : 0, need: 0 };
    }
    if (!used) return undefined;
    return { i, phase: 'post', run: 0, need: s.run };
  },
  accept: s => s.i === 8 &&
    (s.phase === 'done' || (s.phase === 'post' && s.need === 0)),
  maxDepth: 8,   // the eight borders of one row or column
}, NV));
const midLoop = [
  ...ROW_DOTS.map(([left, right]) => {
    const { row, col } = parseCellId(left);
    return new NFA(midNFA(col), 'mid-loop', ...rowSteps(row));
  }),
  ...COL_DOTS.map(([above]) => {
    const { row, col } = parseCellId(above);
    return new NFA(midNFA(row), 'mid-loop', ...colSteps(col));
  }),
];

// --- Ambiguous Kropki -----------------------------------------------------
// The two relations the grey dots assert, and the negative rule denies.
const kropki = (x, y) => Math.abs(x - y) === 1 || x === 2 * y || y === 2 * x;
const dotKey = Pair.fnToKey(kropki, NV);
const greyDots = [...ROW_DOTS, ...COL_DOTS].map(
  ([x, y]) => new Pair(dotKey, 'grey-dot', x, y));

// Reads a step then the two digits it joins; an unused step says nothing, so the
// negative rule bites only on cells consecutive along the loop.
const negativeNFA = cached('negative', () => NFA.encodeSpec({
  startState: { k: 0 },
  transition: (s, value) => {
    if (s.k === 0) {
      return isStepValue(value) ? { k: 1, used: value !== UNUSED } : undefined;
    }
    if (s.k === 1) return { k: 2, used: s.used, a: value };
    if (s.k !== 2) return undefined;
    if (!s.used) return { done: true };
    return kropki(s.a, value) ? undefined : { done: true };
  },
  accept: s => s.done === true,
}, NV));
const dotted = new Set([...ROW_DOTS, ...COL_DOTS].map(([x, y]) => x + '|' + y));
const negativeKropki = steps.filter(s => !dotted.has(s.a + '|' + s.b)).map(
  s => new NFA(negativeNFA, 'no-dot', s.id, s.a, s.b));

// --- Variables and domains ------------------------------------------------
const range = (lo, hi) => Array.from({ length: hi - lo + 1 }, (_, n) => lo + n);
return [
  shape,
  posA.toVar('loop position mod ' + MOD_A),
  posB.toVar('loop position mod ' + MOD_B),
  new Var('S', 'loop steps', steps.length),
  graph.makeReplicate(new Given(gridCells[0], ...range(1, 9))),
  // VA needs no domain of its own: the OFF sentinel plus the MOD_A residues is
  // exactly the widened alphabet. The step Vars need none either -- the loop-cell
  // machines accept nothing on them but unused / in / out.
  posB.makeReplicate(new Given(posB.at(gridCells[0]), ...range(1, MOD_B + 1))),
  new Given(posA.at(SEAM), FIRST),
  new Given(posB.at(SEAM), FIRST),
  new Given(SEAM_OUT, FWD),
  ...GIVENS.map(([cell, value]) => new Given(cell, value)),
  ...loopShape,
  connected,
  ...counters,
  ...midLoop,
  ...greyDots,
  ...negativeKropki,
];
