// Title: Building between
// Author: Paletron
// Video: https://www.youtube.com/watch?v=Sw-uVr5A1d4
// Source: https://app.crackingthecryptic.com/sudoku/JqgBdhMBbn

// Normal 9x9 sudoku, no given digits. Eight coloured circles form four colour
// pairs. Each pair is joined by a "between line" stepping orthogonally or
// diagonally between cell centres; every cell such a line visits other than its
// two circles holds a digit strictly between the two circle digits. Lines may
// not cross one another and may not share cells. A circle's own digit is also a
// minesweeper count: the number of cells its own line visits among the up to
// eight cells surrounding it, the circled cell itself excluded. Three signs on
// cell borders point at the smaller of the two digits they separate.
//
// Nothing is omitted. The rules also say the lines need not be unique -- the
// solver only has to be able to draw one valid line per colour -- which is a
// statement about what has to be proved, not a further constraint; the line
// layers below are existential in exactly that sense.

const NV = 9;
const MOD_A = 7, MOD_B = 8;          // position counters, lcm 56 (see below)
const UNUSED = 1, FWD = 2, BWD = 3;  // step Var: unused, a->b, b->a
const OFF = 1;                       // counter value for a cell no line visits
const START_POS = 2;                 // counter value of a line's first cell
const NOLINE = 1;                    // label Var: cell is on no line
const LABEL0 = 2;                    // label of the first colour

// The eight circles, read off the drawn overlay circles by fill colour; the two
// cells of each pair are the two ends of that colour's line. Which end is
// called `from` is this encoding's own choice -- it seams the position counters
// below -- and the rules do not distinguish the ends.
const LINES = [
  { colour: 'yellow-green', from: 'R1C1', to: 'R1C3' },
  { colour: 'purple',       from: 'R4C4', to: 'R2C7' },
  { colour: 'red',          from: 'R4C2', to: 'R2C5' },
  { colour: 'gold',         from: 'R6C7', to: 'R9C1' },
];
// The three inequality signs, as [larger, smaller]: two "<" glyphs on vertical
// borders and one chevron on the R4C3/R5C3 border, each pointing at the smaller
// digit.
const INEQUALITIES = [['R8C2', 'R8C1'], ['R2C9', 'R2C8'], ['R5C3', 'R4C3']];

const shape = new Shape('9x9');
const graph = cellGraph(shape);
const gridCells = graph.cells();
const label = graph.makeOverlay('VL');
const posA = graph.makeOverlay('VA');
const posB = graph.makeOverlay('VB');

const labelOf = n => LABEL0 + n;                  // line index -> label value
const LABELS = LINES.map((_, n) => labelOf(n));
const endpoints = new Map();                      // circle cell -> its line index
LINES.forEach((line, n) => {
  endpoints.set(line.from, n);
  endpoints.set(line.to, n);
});

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

// --- Custom machines ------------------------------------------------------
const memo = new Map();
const cached = (key, build) => {
  if (!memo.has(key)) memo.set(key, build());
  return memo.get(key);
};

const nextPos = (v, mod) => START_POS + ((v - START_POS + 1) % mod);

// Position counter: a step in use advances the counter by one along its
// direction of travel, so a closed loop of steps would need a length that is
// 0 mod the modulus. Reads [step, counter of a, counter of b].
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

// A step in use joins two cells of the same line, so their labels agree and are
// not NOLINE. This is also what makes "lines may not share cells" hold: a cell
// carries one label, so it belongs to at most one line.
// Reads [step, label of a, label of b].
const stepLabelNFA = cached('steplabel', () => NFA.encodeSpec({
  startState: { k: 0 },
  transition: (s, value) => {
    if (s.k === 0) return { k: 1, used: value !== UNUSED };
    if (s.k === 1) {
      if (!s.used) return { k: 2, used: false };
      return value === NOLINE ? undefined : { k: 2, used: true, lab: value };
    }
    if (s.k !== 2) return undefined;
    if (!s.used) return { k: 3 };
    return value === s.lab ? { k: 3 } : undefined;
  },
  accept: s => s.k === 3,
}, NV));

// Per-cell line shape. Reads the cell's label, both counters, then every step
// it is an endpoint of. A cell off every line uses no step and holds OFF in
// both counters; a cell a line passes through is entered once and left once.
// A circle is an end of its own line, so it is entered once and never left, or
// left once and never entered. The cell each line is left from but never
// entered has both counters pinned to START_POS, which fixes the numbering; a
// closed loop of steps has no such cell, so the counters must run all the way
// round it and its length must be 0 mod MOD_A and mod MOD_B. Every cell of such
// a loop would be a line cell that is not a circle, so its digit is strictly
// between that line's two circle digits; every circle digit is a count over at
// most eight neighbours, hence at most 8, so those interior digits come from at
// most the six values 2..7 and the loop has at most 54 cells -- fewer than
// lcm(MOD_A, MOD_B) = 56.
const cellNFA = (incident, role) => cached(
  'cell|' + role + '|' + incident.map(s => s.out).join(''),
  () => NFA.encodeSpec({
    startState: { k: 0 },
    transition: (s, value) => {
      if (s.k === 0) {
        const on = value !== NOLINE;
        if (role !== 'none' && !on) return undefined;
        return { k: 1, on };
      }
      if (s.k === 1 || s.k === 2) {
        if (role === 'from') {
          if (value !== START_POS) return undefined;
        } else if ((value !== OFF) !== s.on) return undefined;
        return { k: s.k + 1, on: s.on, in: 0, out: 0 };
      }
      const idx = s.k - 3;
      if (idx >= incident.length) return undefined;
      const step = incident[idx];
      let nIn = s.in, nOut = s.out;
      if (value === step.in) nIn++;
      else if (value === step.out) nOut++;
      else if (value !== UNUSED) return undefined;
      if (nIn > 1 || nOut > 1) return undefined;
      return { k: s.k + 1, on: s.on, in: nIn, out: nOut };
    },
    accept: s => {
      if (s.k !== 3 + incident.length) return false;
      if (role === 'from') return s.in === 0 && s.out === 1;
      if (role === 'to') return s.in === 1 && s.out === 0;
      return s.on ? (s.in === 1 && s.out === 1) : (s.in === 0 && s.out === 0);
    },
  }, NV));

// "between line": a cell carrying this line's label holds a digit strictly
// between the line's two circle digits. Reads [label of the cell, the cell,
// the line's two circle cells]; a cell carrying any other label is unaffected.
const betweenNFA = lab => cached('between' + lab, () => NFA.encodeSpec({
  startState: { k: 0 },
  transition: (s, value) => {
    if (s.k === 0) return value === lab ? { k: 1, on: true } : { k: 1, on: false };
    if (s.k === 1) return s.on ? { k: 2, on: true, d: value } : { k: 2, on: false };
    if (s.k === 2) return s.on ? { k: 3, on: true, d: s.d, a: value } : { k: 3, on: false };
    if (s.k !== 3) return undefined;
    if (!s.on) return { k: 4 };
    const lo = Math.min(s.a, value), hi = Math.max(s.a, value);
    return lo < s.d && s.d < hi ? { k: 4 } : undefined;
  },
  accept: s => s.k === 4,
}, NV));

// Minesweeper count: the circle's own digit equals how many of its king
// neighbours carry its line's label. Reads [the circle cell, then the label of
// each neighbour]. The count is clamped one past the target, which is all the
// machine ever needs to distinguish.
const countNFA = lab => cached('count' + lab, () => NFA.encodeSpec({
  startState: { k: 0 },
  transition: (s, value) => {
    if (s.k === 0) return { k: 1, t: value, c: 0 };
    const c = s.c + (value === lab ? 1 : 0);
    return { k: 1, t: s.t, c: Math.min(c, s.t + 1) };
  },
  accept: s => s.k === 1 && s.c === s.t,
}, NV));

// "they can't cross ... with each other": between cell centres the only way two
// king steps can pass through one another without sharing a cell is as the two
// diagonals of one 2x2 block, and the sentence forbids it between two lines.
// It is read reciprocally, as its "nor share cells with each other" half must
// be, so two diagonals belonging to the same line are left alone; that is the
// weaker of the two readings and cannot reject a legal grid. Reads the two
// diagonal steps and then the labels of the block's two top cells, which are
// one cell of each diagonal.
const noCrossNFA = cached('nocross', () => NFA.encodeSpec({
  startState: { k: 0 },
  transition: (s, value) => {
    if (s.k === 0) return { k: 1, u: value !== UNUSED };
    if (s.k === 1) return { k: 2, both: s.u && value !== UNUSED };
    if (s.k === 2) {
      return s.both ? { k: 3, both: true, lab: value } : { k: 3, both: false };
    }
    if (s.k !== 3) return undefined;
    if (!s.both) return { k: 4 };
    return value === s.lab ? { k: 4 } : undefined;
  },
  accept: s => s.k === 4,
}, NV));

// --- Constraints ----------------------------------------------------------
const layers = [
  label.toVar('which line each cell is on'),
  posA.toVar('position along its line, mod ' + MOD_A),
  posB.toVar('position along its line, mod ' + MOD_B),
  new Var('S', 'line steps', steps.length),
];
const domains = [
  // NOLINE plus one label per line.
  label.makeReplicate(new Given(label.at(gridCells[0]), NOLINE, ...LABELS)),
  // OFF plus MOD_A positions. posB spans OFF plus MOD_B positions, which is the
  // whole 1-9 alphabet, and the step Vars are restricted by the per-cell
  // machines, which accept no value on them but unused / entered / left.
  posA.makeReplicate(new Given(posA.at(gridCells[0]),
    ...Array.from({ length: MOD_A + 1 }, (_, n) => n + 1))),
];

// Each circle is on its own colour's line.
const circleLabels = [...endpoints].map(
  ([cell, n]) => new Given(label.at(cell), labelOf(n)));

const lineShape = gridCells.map(cell => {
  const incident = stepsAt.get(cell);
  const n = endpoints.get(cell);
  const role = n === undefined ? 'none'
    : (LINES[n].from === cell ? 'from' : 'to');
  return new NFA(cellNFA(incident, role), 'line-cell',
    label.at(cell), posA.at(cell), posB.at(cell), ...incident.map(s => s.id));
});

const stepLabels = steps.map(s => new NFA(stepLabelNFA, 'line-step',
  s.id, label.at(s.a), label.at(s.b)));

const counters = steps.flatMap(s => [
  new NFA(counterNFA(MOD_A), 'line-order', s.id, posA.at(s.a), posA.at(s.b)),
  new NFA(counterNFA(MOD_B), 'line-order', s.id, posB.at(s.a), posB.at(s.b)),
]);

const noCross = gridCells.flatMap(cell => {
  const block = graph.block(cell, 2, 2);
  if (!block) return [];
  const [tl, tr, bl, br] = block;
  return [new NFA(noCrossNFA, 'no-crossing', stepBetween(tl, br).id,
    stepBetween(tr, bl).id, label.at(tl), label.at(tr))];
});

// The circles are the ends of their line, not cells "along" it, so they are not
// themselves required to lie between the two circle digits.
const betweens = gridCells.filter(cell => !endpoints.has(cell)).flatMap(
  cell => LINES.map((line, n) => new NFA(betweenNFA(labelOf(n)), 'between-line',
    label.at(cell), cell, line.from, line.to)));

const minesweeper = [...endpoints].map(([cell, n]) =>
  new NFA(countNFA(labelOf(n)), 'circle-count',
    cell, ...label.at(graph.kingNeighbours(cell))));

const inequalities = INEQUALITIES.map(
  ([larger, smaller]) => new GreaterThan(larger, smaller));

return [
  shape,
  ...layers,
  ...domains,
  ...circleLabels,
  ...lineShape,
  ...stepLabels,
  ...counters,
  ...noCross,
  ...betweens,
  ...minesweeper,
  ...inequalities,
];
