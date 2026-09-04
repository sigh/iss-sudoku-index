// Title: A Longer Snake in the Grass
// Author: Marty Sears
// Video: https://www.youtube.com/watch?v=-pN0-1lMBpw
// Source: https://sudokupad.app/bq3bqqtcix

// Normal sudoku. SNAKE: a one-cell-wide orthogonal path visits every cell
// except the rock in R5C5, enters no cell twice, and its two end cells are
// neighbouring cells inside one 3x3 box. INSECTS: the snake eats every insect
// (it crosses the border the insect sits on); the insects cut the snake into
// segments, adjacent segments have consecutive totals, and no two segments
// share a total. GREY PEBBLES: the snake never crosses a pebble's border, and
// the two digits either side of a pebble are consecutive or in a 1:2 ratio.
// EGGS: one of the four digits around an egg equals its number of spots.
//
// Nothing is omitted. Two readings fixed by arithmetic rather than by a class:
//
// - "Neighbouring" end cells are orthogonally adjacent. An 80-cell orthogonal
//   path alternates chessboard colours, so its ends differ in colour; diagonal
//   neighbours share one.
// - The two insect sentences are encoded as one rule: walking the snake from
//   the end whose segment total is smaller, each segment's total is one more
//   than the previous segment's. A chain of +-1 steps that never repeats a
//   value cannot change direction, and the same snake read from its other end
//   is the same snake, so this is the conjunction of the two sentences and
//   nothing stronger.

const range = (lo, hi) => Array.from({ length: hi - lo + 1 }, (_, n) => lo + n);
const memo = new Map();
const cached = (key, build) => {
  if (!memo.has(key)) memo.set(key, build());
  return memo.get(key);
};

// The alphabet is widened to 16 so the Var layers can carry snake state; the
// 81 grid cells are pinned back to 1-9 below.
const NV = 16;
const shape = new Shape('9x9', NV);
const graph = cellGraph(shape);
const ROCK = 'R5C5';
const snakeCells = graph.cells().filter(cell => cell !== ROCK);

// --- Drawn clues ------------------------------------------------------------
// The 18 beetle emoji, each straddling one cell border.
const INSECTS = [
  ['R1C3', 'R1C4'], ['R1C7', 'R1C8'], ['R2C5', 'R3C5'],
  ['R3C2', 'R3C3'], ['R3C7', 'R4C7'], ['R3C8', 'R3C9'],
  ['R4C2', 'R5C2'], ['R4C3', 'R5C3'], ['R5C4', 'R6C4'],
  ['R5C6', 'R5C7'], ['R5C8', 'R5C9'], ['R6C1', 'R7C1'],
  ['R6C5', 'R7C5'], ['R7C2', 'R7C3'], ['R7C6', 'R8C6'],
  ['R9C2', 'R9C3'], ['R9C5', 'R9C6'], ['R9C8', 'R9C9'],
];
// The 7 lavender discs, each centred on a cell border.
const PEBBLES = [
  ['R1C5', 'R2C5'], ['R3C1', 'R4C1'], ['R3C5', 'R4C5'], ['R4C7', 'R5C7'],
  ['R5C2', 'R5C3'], ['R6C6', 'R6C7'], ['R8C3', 'R8C4'],
];
// The 3 eggs: spot count, then the top-left cell of the 2x2 square around the
// lattice corner the egg sits on.
const EGGS = [[3, 'R1C4'], [4, 'R4C1'], [5, 'R8C2']];

// --- Snake steps ------------------------------------------------------------
// One Var per orthogonal adjacency between two non-rock cells, read as the pair
// (a, b) in reading order. FWD/BWD: the snake moves a->b / b->a across this
// border. CLOSE_FWD/CLOSE_BWD: the snake does not cross this border, but a and
// b are its two end cells, the snake ending at a and starting at b (or the
// reverse). Closing the path with that one virtual edge turns it into a cycle
// in which every cell is entered once and left once, so the ends need no
// special-cased cell machine, and "the ends are neighbours inside one box" is
// just which borders may hold a CLOSE value.
const UNUSED = 1, FWD = 2, BWD = 3, CLOSE_FWD = 4, CLOSE_BWD = 5;
const boxOf = cell => {
  const { row, col } = parseCellId(cell);
  return Math.floor((row - 1) / 3) * 3 + Math.floor((col - 1) / 3);
};
const borderKey = (p, q) => p + '|' + q;
const insectBorders = new Set(INSECTS.map(([p, q]) => borderKey(p, q)));
const pebbleBorders = new Set(PEBBLES.map(([p, q]) => borderKey(p, q)));
const steps = [];
const stepsAt = new Map(snakeCells.map(cell => [cell, []]));
for (const a of snakeCells) {
  for (const [dR, dC] of [[0, 1], [1, 0]]) {
    const b = graph.step(a, dR, dC);
    if (!b || b === ROCK) continue;
    const key = borderKey(a, b);
    const step = {
      id: 'VS' + (steps.length + 1), a, b,
      insect: insectBorders.has(key),
      pebble: pebbleBorders.has(key),
      closable: boxOf(a) === boxOf(b),
    };
    steps.push(step);
    stepsAt.get(a).push({ id: step.id, isA: true, closable: step.closable });
    stepsAt.get(b).push({ id: step.id, isA: false, closable: step.closable });
  }
}

// Every non-rock cell is entered exactly once and left exactly once, counting
// the virtual closing edge. Seen from cell a, FWD and CLOSE_FWD leave it and
// BWD and CLOSE_BWD enter it; seen from b the reverse. CLOSE values are only
// accepted on a border inside a box.
const degreeStep = (incident, s, value) => {
  if (s.k >= incident.length) return undefined;
  const step = incident[s.k];
  let { in: nIn, out: nOut } = s;
  if (value !== UNUSED) {
    const closing = value === CLOSE_FWD || value === CLOSE_BWD;
    if (closing && !step.closable) return undefined;
    if (!closing && value !== FWD && value !== BWD) return undefined;
    const forward = value === FWD || value === CLOSE_FWD;
    if (forward === step.isA) nOut++; else nIn++;
    if (nIn > 1 || nOut > 1) return undefined;
  }
  return { k: s.k + 1, in: nIn, out: nOut };
};
const degreeDone = (incident, s) => s.k === incident.length && s.in === 1 && s.out === 1;
const degreeSig = incident =>
  incident.map(s => (s.isA ? 'a' : 'b') + (s.closable ? 'c' : '')).join(',');
const degreeSpec = incident => cached('deg|' + degreeSig(incident), () => NFA.encodeSpec({
  startState: { k: 0, in: 0, out: 0 },
  transition: (s, value) => degreeStep(incident, s, value),
  accept: s => degreeDone(incident, s),
}, NV));
// A corner cell has two borders, so its machine is a plain pairwise relation.
const degreeKey = incident => cached('degpair|' + degreeSig(incident), () => Pair.fnToKey(
  (x, y) => {
    const s = degreeStep(incident, { k: 0, in: 0, out: 0 }, x);
    const t = s && degreeStep(incident, s, y);
    return !!t && degreeDone(incident, t);
  }, NV));
const degrees = snakeCells.map(cell => {
  const incident = stepsAt.get(cell);
  const ids = incident.map(s => s.id);
  return incident.length === 2
    ? new Pair(degreeKey(incident), 'snake-cell', ...ids)
    : new NFA(degreeSpec(incident), 'snake-cell', ...ids);
});

// Exactly one border carries the closing edge. Together with the segment
// arithmetic below this is what makes the snake a single path: every directed
// cycle the degree rule admits needs a CLOSE edge, because along real moves the
// segment sum strictly grows within a segment and the segment total strictly
// grows at every insect, so neither can return to its value round a cycle.
const oneClosingSpec = NFA.encodeSpec({
  startState: { n: 0 },
  transition: (s, value) => {
    if (value !== CLOSE_FWD && value !== CLOSE_BWD) return s;
    return s.n === 0 ? { n: 1 } : undefined;
  },
  accept: s => s.n === 1,
}, NV);
const oneClosing = [new NFA(oneClosingSpec, 'one-snake',
  ...steps.filter(s => s.closable).map(s => s.id))];

// --- Insect segments --------------------------------------------------------
// Two per-cell quantities, each split over two layers as 16*(hi-1) + (lo-1):
//   run(cell)   the sum of the digits of the cell's segment from the segment's
//               first cell up to and including this cell;
//   total(cell) the total of the cell's whole segment.
// 19 totals rising by 1 sum to at most 404 (80 digits, at most 9 each), so the
// first is at most 12 and none exceeds 30; hi in {1, 2} covers 0..31 and cuts
// off nothing.
const MAX_SUM = 31;
const value = (hi, lo) => (hi - 1) * 16 + (lo - 1);
const runHi = graph.makeOverlay('VA');
const runLo = graph.makeOverlay('VB');
const totHi = graph.makeOverlay('VC');
const totLo = graph.makeOverlay('VD');

// Across a used border, reads: step, digit(a), digit(b), run(a), run(b).
// Moving into a cell continues its predecessor's sum, or starts afresh at the
// cell's own digit when the border carries an insect; the snake's first cell
// (the far side of the closing edge) also starts afresh.
const runSpec = insect => cached('run|' + insect, () => NFA.encodeSpec({
  startState: { k: 0 },
  transition: (s, v) => {
    if (s.k === 0) {
      if (v === UNUSED) return { k: 'skip', left: 6 };
      if (v < FWD || v > CLOSE_BWD) return undefined;
      const fwd = v === FWD || v === CLOSE_FWD;
      return { k: 1, fwd, fresh: insect || v >= CLOSE_FWD };
    }
    if (s.k === 'skip') return s.left > 1 ? { k: 'skip', left: s.left - 1 } : { k: 'done' };
    if (v > 9 && s.k <= 2) return undefined;
    if (s.k === 1) return { ...s, k: 2, da: s.fwd ? 0 : v };
    if (s.k === 2) return { ...s, k: 3, db: s.fwd ? v : 0 };
    if ((s.k === 3 || s.k === 5) && v > 2) return undefined;  // hi layer is 1 or 2
    if (s.k === 3) return { ...s, k: 4, hi: v };
    if (s.k === 4) {
      const runA = value(s.hi, v);
      if (s.fwd) {
        // Arriving at b: run(b) is d(b) on a fresh segment, else run(a) + d(b).
        const want = s.fresh ? s.db : runA + s.db;
        return want > MAX_SUM ? undefined : { k: 5, want };
      }
      // Arriving at a from b: run(a) is d(a) on a fresh segment, else
      // run(b) + d(a), i.e. run(b) must be run(a) - d(a).
      if (s.fresh) return runA === s.da ? { k: 5 } : undefined;
      return runA > s.da ? { k: 5, want: runA - s.da } : undefined;
    }
    if (s.k === 5) return { ...s, k: 6, hi: v };
    if (s.k === 6) {
      const runB = value(s.hi, v);
      if (s.want !== undefined) return runB === s.want ? { k: 'done' } : undefined;
      return { k: 'done' };
    }
    return undefined;
  },
  accept: s => s.k === 'done',
}, NV));
const runs = steps.map(s => new NFA(runSpec(s.insect), 'segment-sum', s.id, s.a, s.b,
  runHi.at(s.a), runLo.at(s.a), runHi.at(s.b), runLo.at(s.b)));

// Across a used border, reads: step, run(a), total(a), run(b), total(b).
// A plain move keeps the total; an insect move ends the segment behind it (that
// cell's run is its total) and the next segment's total is one more; the closing
// edge ends the snake's last segment on its far side and leaves the first
// segment's total free.
const totalSpec = insect => cached('total|' + insect, () => NFA.encodeSpec({
  startState: { k: 0 },
  transition: (s, v) => {
    if (s.k === 0) {
      if (v === UNUSED) return { k: 'skip', left: 8 };
      if (v < FWD || v > CLOSE_BWD) return undefined;
      const fwd = v === FWD || v === CLOSE_FWD;
      const closing = v >= CLOSE_FWD;
      return {
        k: 1,
        endA: (insect && fwd) || v === CLOSE_FWD,   // a is the last cell of its segment
        endB: (insect && !fwd) || v === CLOSE_BWD,  // b is the last cell of its segment
        delta: closing ? null : insect ? (fwd ? 1 : -1) : 0,  // total(b) - total(a)
      };
    }
    if (s.k === 'skip') return s.left > 1 ? { k: 'skip', left: s.left - 1 } : { k: 'done' };
    if (s.k % 2 === 1 && v > 2) return undefined;  // hi layers are 1 or 2
    if (s.k === 1) return { ...s, k: 2, hi: v };
    if (s.k === 2) return { ...s, k: 3, runA: s.endA ? value(s.hi, v) : null };
    if (s.k === 3) return { ...s, k: 4, hi: v };
    if (s.k === 4) {
      const totA = value(s.hi, v);
      if (s.runA !== null && s.runA !== totA) return undefined;
      const wantB = s.delta === null ? null : totA + s.delta;
      if (wantB !== null && (wantB < 0 || wantB > MAX_SUM)) return undefined;
      return { k: 5, endB: s.endB, wantB };
    }
    if (s.k === 5) return { ...s, k: 6, hi: v };
    if (s.k === 6) {
      const runB = value(s.hi, v);
      if (!s.endB) return { k: 7, wantB: s.wantB };
      if (s.wantB !== null) return runB === s.wantB ? { k: 7, wantB: s.wantB } : undefined;
      return { k: 7, wantB: runB };
    }
    if (s.k === 7) return { ...s, k: 8, hi: v };
    if (s.k === 8) {
      const totB = value(s.hi, v);
      return (s.wantB === null || totB === s.wantB) ? { k: 'done' } : undefined;
    }
    return undefined;
  },
  accept: s => s.k === 'done',
}, NV));
const totals = steps.map(s => new NFA(totalSpec(s.insect), 'segment-total', s.id,
  runHi.at(s.a), runLo.at(s.a), totHi.at(s.a), totLo.at(s.a),
  runHi.at(s.b), runLo.at(s.b), totHi.at(s.b), totLo.at(s.b)));

// --- Insects, pebbles, eggs -------------------------------------------------
const insects = steps.filter(s => s.insect).map(s => new Given(s.id, FWD, BWD));
const pebbleSteps = steps.filter(s => s.pebble).map(s =>
  new Given(s.id, UNUSED, ...(s.closable ? [CLOSE_FWD, CLOSE_BWD] : [])));
const pebbleKey = Pair.fnToKey(
  (x, y) => x <= 9 && y <= 9 && (Math.abs(x - y) === 1 || x === 2 * y || y === 2 * x), NV);
const pebbleDigits = PEBBLES.map(([a, b]) => new Pair(pebbleKey, 'pebble', a, b));
const eggs = EGGS.map(([spots, topLeft]) => new Quad(topLeft, spots));

// --- Layers and domains -----------------------------------------------------
const layers = [
  runHi.toVar('segment sum so far, sixteens'),
  runLo.toVar('segment sum so far, units'),
  totHi.toVar('segment total, sixteens'),
  totLo.toVar('segment total, units'),
  new Var('S', 'snake steps', steps.length),
];
const domains = [
  graph.makeReplicate(new Given('R1C1', ...range(1, 9))),
  runHi.makeReplicate(new Given(runHi.at('R1C1'), 1, 2)),
  totHi.makeReplicate(new Given(totHi.at('R1C1'), 1, 2)),
  // The rock is on no segment; its layer cells carry a fixed 0.
  ...[runHi, runLo, totHi, totLo].map(layer => new Given(layer.at(ROCK), 1)),
  // The step Vars need no domain of their own: the snake-cell machines accept
  // nothing on them but the five step codes.
];

return [
  shape,
  ...layers,
  ...domains,
  ...degrees,
  ...oneClosing,
  ...runs,
  ...totals,
  ...insects,
  ...pebbleSteps,
  ...pebbleDigits,
  ...eggs,
];
