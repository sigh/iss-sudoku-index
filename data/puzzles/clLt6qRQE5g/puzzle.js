// Title: Spot the Difference
// Author: Marty Sears
// Video: https://www.youtube.com/watch?v=clLt6qRQE5g
// Source: https://sudokupad.app/atbh8bj6bp

// Normal sudoku. Each pair of matching coloured spots is joined by a snake: a
// self-avoiding orthogonal path through cell centres whose two ends are that
// colour's two spots. Snakes may touch each other and themselves, but no cell is
// used by more than one snake. Each pair of adjacent digits along a snake has the
// same difference; the difference value belongs to the snake and may differ
// between snakes. A grey square holds an even digit. A black dot sits between two
// digits in ratio 1:2. Cells no snake visits carry no snake rule, and the snakes
// need not cover the grid.
//
// Nothing is omitted.
//
// The routes are what the solver must find, so the snakes are modelled as an
// unknown directed graph. Because a snake may run alongside itself, membership
// plus a neighbour-count degree rule would be unsound -- a self-touching cell has
// three on-path neighbours -- so the model carries one Var per orthogonal
// adjacency saying whether a snake steps across it and in which direction, and
// each cell's degree is read from its own incident steps.
//
// The alphabet is widened to 11 so the Var layers can carry that state; the 81
// grid cells are pinned back to 1-9 below.
const NV = 11;

// Step values: the adjacency is unused, or stepped from a to b, or from b to a.
const UNUSED = 1, FWD = 2, BWD = 3;

// Per-cell layers. Value 1 is the "no snake here" sentinel in each of them.
// VL: which snake owns the cell (OFF, or 2..6 for the five colours).
// VD: that snake's difference value, stored as difference + 1 (so 2..9).
// VA, VB: two position counters, described at the counter machine below.
const OFF = 1;
const MOD_A = 9, MOD_B = 10;
const START_POS = 2;                  // counter value of a snake's first cell
// A directed cycle of steps advances each counter once per step, so its length
// would have to be 0 mod 9 and 0 mod 10, i.e. a multiple of 90. The grid holds 81
// cells, so no cycle fits and every component of the step graph is a path. This
// is what stops a snake's cells from carrying a detached loop beside the route.
const nextPos = (v, mod) => START_POS + ((v - START_POS + 1) % mod);

// Drawn data, transcribed from the ten coloured spot circles: each colour's two
// spots are the two ends of one snake. Which end is called `start` is arbitrary
// -- a snake has no direction -- and fixing it orients the position counters.
const SNAKES = [
  { colour: 'blue', start: 'R1C8', end: 'R9C1' },
  { colour: 'green', start: 'R2C3', end: 'R2C7' },
  { colour: 'orange', start: 'R2C4', end: 'R6C2' },
  { colour: 'yellow', start: 'R6C1', end: 'R8C1' },
  { colour: 'purple', start: 'R8C8', end: 'R9C5' },
];
// Drawn data: the four grey squares, and the two black dots as the cell pairs
// they straddle.
const GREY_CELLS = ['R1C5', 'R2C8', 'R3C9', 'R9C2'];
const BLACK_DOTS = [['R4C6', 'R5C6'], ['R2C7', 'R2C8']];

const shape = new Shape('9x9', NV);
const graph = cellGraph(shape);
const gridCells = graph.cells();
const label = graph.makeOverlay('VL');
const diff = graph.makeOverlay('VD');
const posA = graph.makeOverlay('VA');
const posB = graph.makeOverlay('VB');
// The two step layers: VH at RxCy is the adjacency between RxCy and its right
// neighbour, VV at RxCy the adjacency to the cell below. The last column of VH
// and the last row of VV have no adjacency and are pinned unused.
const hStep = graph.makeOverlay('VH');
const vStep = graph.makeOverlay('VV');

const snakeOf = new Map();            // spot cell -> { value, role }
SNAKES.forEach((snake, i) => {
  snakeOf.set(snake.start, { value: i + 2, role: 'start' });
  snakeOf.set(snake.end, { value: i + 2, role: 'end' });
});

// Every adjacency, and for each cell the step values meaning "a snake leaves this
// cell" and "a snake enters this cell".
const steps = [];
const unusedSteps = [];
const stepsAt = new Map(gridCells.map(cell => [cell, []]));
for (const cell of gridCells) {
  for (const [layer, dR, dC] of [[hStep, 0, 1], [vStep, 1, 0]]) {
    const id = layer.at(cell);
    const other = graph.step(cell, dR, dC);
    if (!other) { unusedSteps.push(id); continue; }
    steps.push({ id, a: cell, b: other });
    stepsAt.get(cell).push({ id, out: FWD, in: BWD });
    stepsAt.get(other).push({ id, out: BWD, in: FWD });
  }
}

// --- Domains. Each layer's whole-group domain is stamped with one Replicate;
// the narrower givens that follow -- a grey square's even digits, a spot's snake,
// a snake's first counter value -- intersect with the stamp.
const range = (lo, hi) => Array.from({ length: hi - lo + 1 }, (_, i) => lo + i);
const stamp = (layer, values) =>
  layer.makeReplicate(new Given(layer.cells()[0], ...values));

const digitDomain = [
  stamp(graph, range(1, 9)),
  ...GREY_CELLS.map(cell => new Given(cell, 2, 4, 6, 8)),
];
const spotCells = [...snakeOf.keys()];
const labelDomain = [
  stamp(label, range(OFF, 6)),
  ...spotCells.map(cell => new Given(label.at(cell), snakeOf.get(cell).value)),
];
const diffDomain = [stamp(diff, range(OFF, 9))];
// A snake's first cell is pinned to START_POS: every later cell's counter is then
// forced by the steps, so the layers add no freedom of their own.
const startCells = SNAKES.map(s => s.start);
const counterDomain = [[posA, MOD_A], [posB, MOD_B]].flatMap(([layer, mod]) => [
  stamp(layer, range(OFF, START_POS + mod - 1)),
  ...startCells.map(cell => new Given(layer.at(cell), START_POS)),
]);
const stepDomain = [
  stamp(hStep, [UNUSED, FWD, BWD]),
  stamp(vStep, [UNUSED, FWD, BWD]),
  ...unusedSteps.map(id => new Given(id, UNUSED)),
];

// --- A cell is on a snake exactly when its label says so, and the three other
// per-cell layers agree with it: both values are the OFF sentinel or neither is.
const offAgreeKey = Pair.fnToKey((x, y) => (x === OFF) === (y === OFF), NV);
const layerAgreement = gridCells.flatMap(cell => [
  new Pair(offAgreeKey, 'on-snake', label.at(cell), diff.at(cell)),
  new Pair(offAgreeKey, 'on-snake', label.at(cell), posA.at(cell)),
  new Pair(offAgreeKey, 'on-snake', label.at(cell), posB.at(cell)),
]);

const memo = new Map();
const cached = (key, build) => {
  if (!memo.has(key)) memo.set(key, build());
  return memo.get(key);
};

// --- Degree. Reads the cell's label and then each adjacency it is an endpoint
// of, counting steps that leave the cell and steps that enter it. A cell off
// every snake uses no step; a spot is left once and never entered (start) or
// entered once and never left (end); any other snake cell is entered once and
// left once. That is what makes each snake's cells a simple path running from
// its start spot to its end spot.
const degreeNFA = (incident, role) => cached(
  'deg|' + role + '|' + incident.map(s => s.out).join(','),
  () => NFA.encodeSpec({
    startState: { k: 0, on: false, outs: 0, ins: 0 },
    transition: (s, value) => {
      if (s.k === 0) {
        const on = value !== OFF;
        if (role !== 'plain' && !on) return undefined;
        return { k: 1, on, outs: 0, ins: 0 };
      }
      const spec = incident[s.k - 1];
      if (!spec) return undefined;
      const outs = s.outs + (value === spec.out ? 1 : 0);
      const ins = s.ins + (value === spec.in ? 1 : 0);
      if (outs > 1 || ins > 1) return undefined;
      return { k: s.k + 1, on: s.on, outs, ins };
    },
    accept: (s) => {
      if (s.k !== incident.length + 1) return false;
      const wantOut = role === 'end' ? 0 : (s.on ? 1 : 0);
      const wantIn = role === 'start' ? 0 : (s.on ? 1 : 0);
      return s.outs === wantOut && s.ins === wantIn;
    },
  }, NV));
const degreeRules = gridCells.map(cell => {
  const incident = stepsAt.get(cell);
  const spot = snakeOf.get(cell);
  return new NFA(degreeNFA(incident, spot ? spot.role : 'plain'), 'snake-degree',
    label.at(cell), ...incident.map(s => s.id));
});

// --- What a used step says about the two cells it joins. Reads
// [step, digitA, digitB, diffA, diffB, labelA, labelB]: when the step is used the
// two digits differ by the snake's difference value -- held as difference + 1 in
// both cells, which is what carries one difference value along a whole snake --
// and the two cells belong to the same snake. An unused step says nothing.
const stepRuleNFA = cached('step-rule', () => NFA.encodeSpec({
  startState: { k: 0 },
  transition: (s, value) => {
    if (s.k === 0) return { k: 1, used: value !== UNUSED, d: 0 };
    if (s.k === 1) return { k: 2, used: s.used, d: s.used ? value : 0 };
    if (s.k === 2) {
      if (!s.used) return { k: 3, used: false, d: 0 };
      const d = Math.abs(s.d - value);
      return d >= 1 ? { k: 3, used: true, d } : undefined;
    }
    if (s.k === 3 || s.k === 4) {
      if (!s.used) return { k: s.k + 1, used: false, d: 0 };
      return value === s.d + 1 ? { k: s.k + 1, used: true, d: s.d } : undefined;
    }
    if (s.k === 5) {
      if (!s.used) return { k: 6, used: false, d: 0 };
      return value !== OFF ? { k: 6, used: true, d: value } : undefined;
    }
    if (s.k === 6) {
      if (!s.used) return { k: 7, used: false, d: 0 };
      return value === s.d ? { k: 7, used: true, d: 0 } : undefined;
    }
    return undefined;
  },
  accept: (s) => s.k === 7,
}, NV));

// --- Position counters. Reads [step, aA, bA, aB, bB]: a used step advances both
// counters by one in the direction of travel. See nextPos above for what that
// forbids.
const counterRuleNFA = cached('counters', () => NFA.encodeSpec({
  startState: { k: 0 },
  transition: (s, value) => {
    if (s.k === 0) return { k: 1, dir: value, prev: 0 };
    if (s.k === 1 || s.k === 3) return { k: s.k + 1, dir: s.dir, prev: value };
    if (s.k === 2 || s.k === 4) {
      const mod = s.k === 2 ? MOD_A : MOD_B;
      if (s.dir === UNUSED) return { k: s.k + 1, dir: s.dir, prev: 0 };
      if (s.prev === OFF || value === OFF) return undefined;
      const ok = s.dir === FWD
        ? value === nextPos(s.prev, mod)
        : s.prev === nextPos(value, mod);
      return ok ? { k: s.k + 1, dir: s.dir, prev: 0 } : undefined;
    }
    return undefined;
  },
  accept: (s) => s.k === 5,
}, NV));

const stepRules = steps.flatMap(s => [
  new NFA(stepRuleNFA, 'snake-step', s.id, s.a, s.b,
    diff.at(s.a), diff.at(s.b), label.at(s.a), label.at(s.b)),
  new NFA(counterRuleNFA, 'snake-position', s.id,
    posA.at(s.a), posA.at(s.b), posB.at(s.a), posB.at(s.b)),
]);

const dotRules = BLACK_DOTS.map(pair => new BlackDot(...pair));

return [
  shape,
  label.toVar('snake'),
  diff.toVar('difference'),
  posA.toVar('position-a'),
  posB.toVar('position-b'),
  hStep.toVar('step-right'),
  vStep.toVar('step-down'),
  ...digitDomain,
  ...labelDomain,
  ...diffDomain,
  ...counterDomain,
  ...stepDomain,
  ...layerAgreement,
  ...degreeRules,
  ...stepRules,
  ...dotRules,
];
