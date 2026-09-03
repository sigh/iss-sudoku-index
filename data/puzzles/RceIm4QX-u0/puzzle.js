// Title: Twelve Spots
// Author: Marty Sears
// Video: https://www.youtube.com/watch?v=RceIm4QX-u0
// Source: https://sudokupad.app/7m4vgf6l3t

// Normal 6x6 sudoku. Six lines are drawn, each with a turquoise spot at both
// ends; there are twelve spots and six lines, so every spot is the end of
// exactly one line. Each line occupies at least 3 cells and steps orthogonally
// or diagonally between cell centres. Lines may not branch, cross each other,
// or share cells. Along a line every pair of adjacent cells has the same
// difference, the line's 'difference value', and the six lines all have
// different difference values. Digits in a cage sum to the total printed in the
// cage's top left corner.
//
// Nothing is omitted. Two readings the prose fixes by arithmetic or by the art
// are stated where they are encoded: which difference values exist, and what
// "cross" can mean for lines drawn between cell centres.

// The alphabet is widened to 7 so the Var layers can carry line state; the 36
// grid cells are pinned back to 1-6 below. Degree alone does not make a chosen
// edge set six lines -- it also admits closed loops of steps alongside them --
// so two position counters with coprime moduli number every line from its first
// cell. A loop's length would have to be a multiple of lcm(5, 6) = 30, and six
// lines of at least 3 cells already occupy 18 of the 36 cells, leaving at most
// 18 for anything else.
const NV = 7;
const MOD_A = 5, MOD_B = 6;
const UNUSED = 1, FWD = 2, BWD = 3;  // step Var: unused, a->b, b->a
const OFF = 1;                       // counter value for a cell no line uses
const START_POS = 2;                 // counter value of a line's first cell
const NOLINE = 1;                    // label Var: cell is on no line
const LABEL0 = 2;                    // label of the difference-0 line
const START = 2, END = 3;            // which end of its line a spot is

// Digits run 1-6, so a difference between adjacent cells is one of 0..5: six
// values for six lines that must all differ, hence each value is used exactly
// once and a difference of 0 (a line of equal digits) is one of the six. A
// line's label is 2 + its difference value, so labels run LABEL0..LABEL0+5.
const LABELS = Array.from({ length: 6 }, (_, d) => LABEL0 + d);

// The twelve turquoise discs drawn in the grid, in reading order.
const SPOTS = ['R1C3', 'R1C6', 'R2C3', 'R2C5', 'R4C1', 'R4C6',
  'R5C2', 'R5C3', 'R5C4', 'R6C2', 'R6C3', 'R6C5'];
// The three cages, each as [total, ...cells]; the total is printed in the
// cage's top left cell.
const CAGES = [[11, 'R1C3', 'R2C3'], [8, 'R1C4', 'R2C4'],
  [6, 'R6C3', 'R6C4', 'R6C5']];

const shape = new Shape('6x6', NV);
const graph = cellGraph(shape);
const gridCells = graph.cells();
const label = graph.makeOverlay('VL');
const posA = graph.makeOverlay('VA');
const posB = graph.makeOverlay('VB');

const isSpot = new Set(SPOTS);
const roleVar = cell => 'VR' + (SPOTS.indexOf(cell) + 1);

// --- Step variables -------------------------------------------------------
// One Var per king-move adjacency, recording whether a line uses it and in
// which direction; the direction is what the position counters need.
const STEP_DIRS = [[0, 1], [1, 0], [1, 1], [1, -1]];
const steps = [];
const stepsAt = new Map(gridCells.map(cell => [cell, []]));
for (const cell of gridCells) {
  for (const [dR, dC] of STEP_DIRS) {
    const other = graph.step(cell, dR, dC);
    if (!other) continue;
    const id = 'VS' + (steps.length + 1);
    steps.push({ id, a: cell, b: other });
    stepsAt.get(cell).push({ id, out: FWD, in: BWD });
    stepsAt.get(other).push({ id, out: BWD, in: FWD });
  }
}
const stepIndex = new Map(steps.map(s => [s.a + '|' + s.b, s]));
const stepBetween = (p, q) => stepIndex.get(p + '|' + q) || stepIndex.get(q + '|' + p);

// --- Custom keys and machines --------------------------------------------
const memo = new Map();
const cached = (key, build) => {
  if (!memo.has(key)) memo.set(key, build());
  return memo.get(key);
};

// Between cell centres the only way two lines can pass through one another is
// as the two diagonals of the same 2x2 block, which meet at its centre point.
const noCrossKey = Pair.fnToKey((x, y) => x === UNUSED || y === UNUSED, NV);

const nextPos = (v, mod) => START_POS + ((v - START_POS + 1) % mod);

// Position counter: a step in use advances the counter by one along its
// direction of travel, so a closed loop of steps would need a length that is
// 0 mod the modulus.
const counterNFA = mod => cached('cnt' + mod, () => NFA.encodeSpec({
  startState: { k: 0 },
  transition: (s, value) => {
    if (s.k === 0) return { k: 1, dir: value };
    if (s.k === 1) return { k: 2, dir: s.dir, a: value };
    if (s.k !== 2) return undefined;
    if (s.dir === UNUSED) return { k: 3 };
    if (s.a === OFF || value === OFF) return undefined;
    if (s.dir === FWD) return value === nextPos(s.a, mod) ? { k: 3 } : undefined;
    return s.a === nextPos(value, mod) ? { k: 3 } : undefined;
  },
  accept: s => s.k === 3,
}, NV));

// A step in use joins two cells of one line: same label, and digits differing
// by exactly that label's difference value.
const stepLineNFA = cached('stepline', () => NFA.encodeSpec({
  startState: { k: 0 },
  transition: (s, value) => {
    if (s.k === 0) return { k: 1, used: value !== UNUSED, lab: 0, da: 0 };
    if (!s.used) return s.k < 4 ? { k: s.k + 1, used: false, lab: 0, da: 0 } : { k: 5 };
    if (s.k === 1) {
      if (value === NOLINE) return undefined;
      return { k: 2, used: true, lab: value, da: 0 };
    }
    if (s.k === 2) {
      if (value !== s.lab) return undefined;
      return { k: 3, used: true, lab: s.lab, da: 0 };
    }
    if (s.k === 3) return { k: 4, used: true, lab: s.lab, da: value };
    if (s.k === 4) {
      return Math.abs(s.da - value) === s.lab - LABEL0 ? { k: 5 } : undefined;
    }
    return undefined;
  },
  accept: s => s.k === 5,
}, NV));

// Per-cell line shape. A spot reads which end of its line it is, then its
// label and both counters, then every step it is an endpoint of. A spot is
// entered once and never left, or left once and never entered; the cell a line
// is left from but never entered is the line's first cell, whose counters are
// pinned to START_POS so the numbering cannot rotate -- and so a closed loop,
// which has no such cell, is left with no consistent numbering at all. An
// ordinary cell is either off every line (no steps, both counters OFF) or is
// entered once and left once.
const cellNFA = (incident, spot) => cached(
  'cell|' + (spot ? 'S' : '-') + '|' + incident.map(s => s.out).join(''),
  () => NFA.encodeSpec({
    startState: { k: 0 },
    transition: (s, value) => {
      let k = s.k;
      if (spot && k === 0) {
        if (value !== START && value !== END) return undefined;
        return { k: 1, on: true, role: value, in: 0, out: 0 };
      }
      const base = spot ? 1 : 0;
      if (k === base) {
        if (spot) {
          // A spot is the end of a line, so it is always on one.
          if (value === NOLINE) return undefined;
          return { k: k + 1, on: true, role: s.role, in: 0, out: 0 };
        }
        return { k: k + 1, on: value !== NOLINE, role: 0, in: 0, out: 0 };
      }
      if (k === base + 1 || k === base + 2) {
        if (s.role === START) {
          if (value !== START_POS) return undefined;
        } else if ((value !== OFF) !== s.on) return undefined;
        return { k: k + 1, on: s.on, role: s.role, in: s.in, out: s.out };
      }
      const idx = k - base - 3;
      if (idx >= incident.length) return undefined;
      const step = incident[idx];
      let nIn = s.in, nOut = s.out;
      if (value === step.in) nIn++;
      else if (value === step.out) nOut++;
      else if (value !== UNUSED) return undefined;
      if (nIn > 1 || nOut > 1) return undefined;
      return { k: k + 1, on: s.on, role: s.role, in: nIn, out: nOut };
    },
    accept: s => {
      if (s.k !== (spot ? 1 : 0) + 3 + incident.length) return false;
      if (s.role === START) return s.in === 0 && s.out === 1;
      if (s.role === END) return s.in === 1 && s.out === 0;
      return s.on ? (s.in === 1 && s.out === 1) : (s.in === 0 && s.out === 0);
    },
  }, NV));

// Each line may be numbered from either of its two ends, which the rules do not
// distinguish. This picks one: reading the twelve spots in order as
// (label, end-role) pairs, a label's START must come before its END. `seen` is
// the bitmask of labels whose START has been read.
const orderNFA = cached('order', () => NFA.encodeSpec({
  startState: { seen: 0, pend: 0 },
  transition: (s, value) => {
    if (s.pend === 0) {
      if (value < LABEL0) return undefined;
      return { seen: s.seen, pend: value };
    }
    const bit = 1 << (s.pend - LABEL0);
    if (value === START) {
      return (s.seen & bit) ? undefined : { seen: s.seen | bit, pend: 0 };
    }
    if (value === END) {
      return (s.seen & bit) ? { seen: s.seen, pend: 0 } : undefined;
    }
    return undefined;
  },
  accept: s => s.pend === 0,
}, NV));

// --- Constraints ----------------------------------------------------------
const layers = [
  label.toVar('which line each cell is on'),
  posA.toVar('position along its line, mod ' + MOD_A),
  posB.toVar('position along its line, mod ' + MOD_B),
  new Var('S', 'line steps', steps.length),
  new Var('R', 'which end of its line each spot is', SPOTS.length),
];
const domains = [
  graph.makeReplicate(new Given(gridCells[0], 1, 2, 3, 4, 5, 6)),
  posA.makeReplicate(new Given(posA.at(gridCells[0]),
    ...Array.from({ length: MOD_A + 1 }, (_, n) => n + 1))),
  // posB spans the whole 1..7 alphabet (MOD_B + 1 = NV), and the label layer
  // spans NOLINE plus the six labels, so neither needs a domain constraint.
  // The step Vars are restricted by the per-cell machines, which accept no
  // value on them but unused / entered / left.
];

const cages = CAGES.map(([total, ...cells]) => new Sum(total, ...cells));

// A step joining two spots would be a whole line of 2 cells.
const tooShort = steps
  .filter(s => isSpot.has(s.a) && isSpot.has(s.b))
  .map(s => new Given(s.id, UNUSED));

const lineShape = gridCells.map(cell => {
  const incident = stepsAt.get(cell);
  const spot = isSpot.has(cell);
  const cells = [...(spot ? [roleVar(cell)] : []), label.at(cell),
    posA.at(cell), posB.at(cell), ...incident.map(s => s.id)];
  return new NFA(cellNFA(incident, spot), 'line-cell', ...cells);
});

const lineSteps = steps.map(s => new NFA(stepLineNFA, 'line-step',
  s.id, label.at(s.a), label.at(s.b), s.a, s.b));

const counters = steps.flatMap(s => [
  new NFA(counterNFA(MOD_A), 'line-order', s.id, posA.at(s.a), posA.at(s.b)),
  new NFA(counterNFA(MOD_B), 'line-order', s.id, posB.at(s.a), posB.at(s.b)),
]);

// The two diagonals of each 2x2 block cross at its centre.
const noCross = gridCells.flatMap(cell => {
  const block = graph.block(cell, 2, 2);
  if (!block) return [];
  const [tl, tr, bl, br] = block;
  return [new Pair(noCrossKey, 'no-crossing',
    stepBetween(tl, br).id, stepBetween(tr, bl).id)];
});

// Six lines with six different difference values, out of six possible values:
// each label is the label of exactly one line, so exactly two spots carry it.
const allDifferences = [new ContainExact(
  LABELS.flatMap(l => [l, l]).join('_'), ...label.at(SPOTS))];

const orientation = [new NFA(orderNFA, 'line-orientation',
  ...SPOTS.flatMap(cell => [label.at(cell), roleVar(cell)]))];

return [
  shape,
  ...layers,
  ...domains,
  ...cages,
  ...tooShort,
  ...lineShape,
  ...lineSteps,
  ...counters,
  ...noCross,
  ...allDifferences,
  ...orientation,
];
