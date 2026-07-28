// Title: NOT ON
// Author: Marty Sears
// Video: https://www.youtube.com/watch?v=ZsqBqEUYnpk
// Source: https://sudokupad.app/9rwnig6n8g

// Normal sudoku, no givens. The solver must find one snaking line through cell
// centres joining two cells; it steps orthogonally or diagonally, never
// branches, and never crosses itself. An arrow digit counts the cells in its
// ray, excluding its own cell, that are NOT on the line. A cage clue totals
// only the cage digits that are NOT on the line, and cage digits do not repeat.
//
// OMITTED: the line's digits must read as a palindrome. That relates the cells
// at mirrored positions along a route the solver is still discovering, and no
// ISS construction pairs two arbitrary cells by their positions along an
// unknown path. Everything else above is encoded.
//
// The value range is widened to 16 so the Var layers can carry line state; the
// 81 grid cells are pinned back to 1-9 below. Two position counters with
// coprime moduli (lcm 165 > 81 cells) are what forbid a closed loop of steps
// beside the line: in/out degree alone admits one.
const NV = 16;
const MOD_A = 15, MOD_B = 11;
const OFF_POS = 1;                   // counter value for a cell the line misses
const START_POS = 2;                 // counter value of the line's first cell
const UNUSED = 1, FWD = 2, BWD = 3;  // step values: unused, a->b, b->a
const OFF = 1, START = 2, MID = 3, END = 4;  // a cell's role on the line

const shape = new Shape('9x9', NV);
const graph = cellGraph(shape);
const gridCells = graph.cells();
const role = graph.makeOverlay('VR');
const posA = graph.makeOverlay('VA');
const posB = graph.makeOverlay('VB');

// --- Step variables -------------------------------------------------------
// One Var per king-move adjacency, recording whether the line uses that step
// and in which direction. Sharing one variable between the two cells is what
// makes the two ends agree; the direction is what the counters need.
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

const memo = new Map();
const cached = (key, build) => {
  if (!memo.has(key)) memo.set(key, build());
  return memo.get(key);
};

// --- Line shape -----------------------------------------------------------
// Per-cell machine: reads the cell's role, its two counters, then every step it
// is an endpoint of. The role fixes the degrees -- an off-line cell touches no
// step, an endpoint is left or entered but not both, an interior cell is
// entered once and left once -- and ties the counters to membership, pinning
// the line's first cell to START_POS so the numbering cannot rotate freely.
function cellNFA(incident) {
  const sig = 'cell|' + incident.map(s => s.in + '/' + s.out).join(',');
  return cached(sig, () => NFA.encodeSpec({
    startState: { k: 0 },
    transition: (s, value) => {
      if (s.k === 0) {
        if (value > END) return undefined;
        return { k: 1, role: value };
      }
      if (s.k === 1 || s.k === 2) {
        if (s.role === OFF) { if (value !== OFF_POS) return undefined; }
        else if (s.role === START) { if (value !== START_POS) return undefined; }
        else if (value === OFF_POS) return undefined;
        return { ...s, k: s.k + 1, in: 0, out: 0 };
      }
      const step = incident[s.k - 3];
      if (step === undefined) return undefined;
      let { in: nIn, out: nOut } = s;
      if (value === step.in) nIn++;
      else if (value === step.out) nOut++;
      else if (value !== UNUSED) return undefined;
      if (nIn > 1 || nOut > 1) return undefined;
      return { ...s, k: s.k + 1, in: nIn, out: nOut };
    },
    accept: s => {
      if (s.k !== 3 + incident.length) return false;
      if (s.role === OFF) return s.in === 0 && s.out === 0;
      if (s.role === START) return s.in === 0 && s.out === 1;
      if (s.role === END) return s.in === 1 && s.out === 0;
      return s.in === 1 && s.out === 1;
    },
  }, NV));
}
const lineShape = gridCells.map(cell => new NFA(
  cellNFA(stepsAt.get(cell)), 'line-cell',
  role.at(cell), posA.at(cell), posB.at(cell),
  ...stepsAt.get(cell).map(s => s.id)));

// One line, not several: exactly one cell is the first. Every other on-line
// cell is entered exactly once, so the number of last cells matches it.
const oneStart = new NFA(NFA.encodeSpec({
  startState: { count: 0 },
  transition: (s, value) =>
    value === START ? (s.count === 1 ? undefined : { count: 1 }) : s,
  accept: s => s.count === 1,
}, NV), 'one line', ...role.at(gridCells));

// A used step advances both counters by one along the direction of travel, so
// any closed loop of steps would have to have length 0 mod 15 and mod 11.
const nextPos = (v, mod) => 2 + ((v - 2 + 1) % mod);
const counterNFA = mod => cached('counter' + mod, () => NFA.encodeSpec({
  startState: { k: 0 },
  transition: (s, value) => {
    if (s.k === 0) return { k: 1, dir: value };
    if (s.k === 1) return { k: 2, dir: s.dir, a: value };
    if (s.k !== 2) return undefined;
    if (s.dir === UNUSED) return { done: true };
    if (s.a === OFF_POS || value === OFF_POS) return undefined;
    if (s.dir === FWD) return value === nextPos(s.a, mod) ? { done: true } : undefined;
    return s.a === nextPos(value, mod) ? { done: true } : undefined;
  },
  accept: s => s.done === true,
}, NV));
const counters = steps.flatMap(s => [
  new NFA(counterNFA(MOD_A), 'line-order', s.id, posA.at(s.a), posA.at(s.b)),
  new NFA(counterNFA(MOD_B), 'line-order', s.id, posB.at(s.a), posB.at(s.b)),
]);

// The two diagonal steps of a 2x2 square cross at its centre corner, and the
// line may not cross itself.
const noCrossKey = Pair.fnToKey((x, y) => x === UNUSED || y === UNUSED, NV);
const noCross = gridCells.flatMap(topLeft => {
  const topRight = graph.step(topLeft, 0, 1);
  const bottomLeft = graph.step(topLeft, 1, 0);
  const bottomRight = graph.step(topLeft, 1, 1);
  return bottomRight ? [new Pair(noCrossKey, 'no-crossing',
    stepBetween(topLeft, bottomRight).id, stepBetween(topRight, bottomLeft).id)] : [];
});

// --- Arrows ---------------------------------------------------------------
// Transcribed from the ten small arrows drawn inside cells; each gives the cell
// it sits in and the direction it points.
const ARROWS = [
  ['R7C5', 0, 1], ['R7C6', 0, 1], ['R7C3', 0, 1], ['R8C3', 0, 1],
  ['R4C3', 1, 0], ['R1C2', 1, 0], ['R7C8', 0, -1], ['R7C9', 0, -1],
  ['R1C7', 0, -1], ['R1C1', 1, 0],
];
// Reads the arrow digit, then the role of every cell of its ray, and counts the
// off-line ones. "Sees" is the whole ray to the grid edge: nothing in the rules
// blocks the view, and the only stated exclusion is the arrow cell itself.
const arrowNFA = cached('arrow', () => NFA.encodeSpec({
  startState: { k: 0 },
  transition: (s, value) => {
    if (s.k === 0) return { k: 1, target: value, count: 0 };
    const count = s.count + (value === OFF ? 1 : 0);
    return count > s.target ? undefined : { ...s, count };
  },
  accept: s => s.k === 1 && s.count === s.target,
}, NV));
const arrows = ARROWS.map(([cell, dR, dC]) => new NFA(
  arrowNFA, 'arrow off-line count',
  cell, ...role.at(graph.ray(cell, dR, dC).slice(1))));

// --- Cages ----------------------------------------------------------------
// Transcribed from the thirteen drawn cages and their top-left totals.
const CAGES = [
  [43, ['R4C7', 'R4C8', 'R4C9', 'R5C7', 'R5C8', 'R5C9', 'R6C7', 'R6C8', 'R6C9']],
  [15, ['R7C5', 'R7C6', 'R8C6']],
  [19, ['R7C3', 'R8C3', 'R9C3']],
  [41, ['R5C3', 'R5C4', 'R5C5', 'R5C6', 'R6C3', 'R6C4', 'R6C5', 'R6C6']],
  [8, ['R4C4', 'R4C5', 'R4C6']],
  [22, ['R1C3', 'R2C3', 'R3C2', 'R3C3']],
  [13, ['R3C5', 'R3C6', 'R3C7']],
  [8, ['R1C6', 'R2C6']],
  [6, ['R1C7', 'R1C8']],
  [8, ['R5C1', 'R6C1']],
  [4, ['R5C2', 'R6C2', 'R7C2']],
  [12, ['R8C8', 'R8C9', 'R9C8']],
  [11, ['R9C1', 'R9C2']],
];
// Reads each cage cell as a (digit, role) pair and totals the off-line digits.
const cageNFA = target => cached('cage' + target, () => NFA.encodeSpec({
  startState: { k: 0, sum: 0 },
  transition: (s, value) => {
    if (s.k === 0) return { ...s, k: 1, digit: value };
    const sum = s.sum + (value === OFF ? s.digit : 0);
    return sum > target ? undefined : { k: 0, sum };
  },
  accept: s => s.k === 0 && s.sum === target,
}, NV));
const cageSums = CAGES.map(([target, cells]) => new NFA(
  cageNFA(target), 'off-line cage total ' + target,
  ...cells.flatMap(cell => [cell, role.at(cell)])));

// Only the 41 cage holds cells that no single row, column or box already keeps
// distinct; the other twelve cages get their non-repeat rule from sudoku.
const cageDistinct = new AllDifferent(...CAGES[3][1]);

return [
  shape,
  role.toVar('cell role on the line'),
  posA.toVar('line position mod ' + MOD_A),
  posB.toVar('line position mod ' + MOD_B),
  new Var('S', 'line steps', steps.length),
  graph.makeReplicate(new Given(gridCells[0], 1, 2, 3, 4, 5, 6, 7, 8, 9)),
  role.makeReplicate(new Given(role.at(gridCells[0]), OFF, START, MID, END)),
  posB.makeReplicate(new Given(posB.at(gridCells[0]),
    ...Array.from({ length: MOD_B + 1 }, (_, n) => n + 1))),
  // posA needs no domain constraint: 1 sentinel + 15 positions is the whole
  // 16-value range. The step Vars need none either -- the per-cell machine
  // accepts no value on them but unused / in / out.
  ...lineShape,
  oneStart,
  ...counters,
  ...noCross,
  ...arrows,
  ...cageSums,
  cageDistinct,
];
