// Title: Sloopoku
// Author: Piatato
// Video: https://www.youtube.com/watch?v=uBc80Z91uK4
// Source: https://app.crackingthecryptic.com/sudoku/6mBf9mr992

// Normal sudoku. A clue outside the grid is the sum of the digits sandwiched
// between the 1 and the 9 of that row or column. A loop is drawn through every
// cell except the cells containing a 1, and it may not branch, intersect or
// cross itself.
//
// The loop is taken to travel between the centres of orthogonally adjacent
// cells. The rules text grants the route no movement of its own -- it names no
// diagonal, king or jumping step -- so the loop is the unqualified cell loop.
// Nothing forbids the loop from running alongside itself, and with 72 of the 81
// cells on it that is unavoidable: no no-touch rule is encoded.
//
// Nothing is omitted.

const UNUSED = 1, FWD = 2, BWD = 3;  // a step is unused, or runs a->b or b->a
const MOD_A = 8, MOD_B = 9;          // the two loop-position moduli
const OFF_POS = 1;                   // position value pinned on cells off the loop

const graph = cellGraph('9x9');
const geometry = graph.gridGeometry();
const gridCells = graph.cells();

// Position along the loop, mod 8 and mod 9. Value v means position v-1.
const posA = graph.makeOverlay('VA');
const posB = graph.makeOverlay('VB');

// --- Steps ---------------------------------------------------------------
// One Var per orthogonally adjacent pair of cells, recording whether the loop
// uses that pair and in which direction. Direction is what the position
// counters below need; right/down steps from each cell cover every pair once.
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

// --- Loop membership and degree ------------------------------------------
// Reads a cell's digit, then each step it is an endpoint of. A cell holding 1
// is off the loop and uses no step; every other cell is entered once and left
// once, which is what makes the route non-branching and self-intersection-free.
const degreeNFA = incident => NFA.encodeSpec({
  startState: { k: 0 },
  transition: (s, value) => {
    if (s.k === 0) return { k: 1, on: value !== 1, in: 0, out: 0 };
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
}, geometry.numValues);
const degrees = gridCells.map(cell => {
  const incident = stepsAt.get(cell);
  return new NFA(degreeNFA(incident), 'loop-degree',
    cell, ...incident.map(s => s.id));
});

// --- Position counters ----------------------------------------------------
// Degree alone leaves the used steps as any disjoint union of directed cycles
// covering the non-1 cells. Numbering the loop 0, 1, 2, ... along its direction
// of travel is always possible, so requiring the arriving cell's position to be
// the leaving cell's plus one (mod m) adds nothing; but it forces every cycle's
// length to be divisible by m. lcm(8, 9) = 72 and the non-1 cells number exactly
// 72 (one 1 per row), so a second cycle would have to be 72 cells long as well.
// One cycle is all that survives.
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
}, geometry.numValues);
const counterA = counterNFA(MOD_A), counterB = counterNFA(MOD_B);
const counters = steps.flatMap(s => [
  new NFA(counterA, 'loop-position', s.id, posA.at(s.a), posA.at(s.b)),
  new NFA(counterB, 'loop-position', s.id, posB.at(s.a), posB.at(s.b)),
]);

// A cell off the loop carries no position, so pin it to one value rather than
// leaving nine spare assignments per omitted cell. Key: digit 1 forces OFF_POS.
const offPosKey = Pair.fnToKey(
  (digit, pos) => digit !== 1 || pos === OFF_POS, geometry.numValues);
const offPositions = gridCells.flatMap(cell => [
  new Pair(offPosKey, 'off-loop-position', cell, posA.at(cell)),
  new Pair(offPosKey, 'off-loop-position', cell, posB.at(cell)),
]);

// --- Seam -----------------------------------------------------------------
// Numbering a closed loop is free to start anywhere and run either way, an
// artifact of the counters above rather than of the puzzle. Both are pinned at
// the first cell of the grid that is on the loop: R1C1, or R1C2 when R1C1 holds
// the row's 1. R1C1 takes position 0 either way -- as the seam when it is on the
// loop, and as an off-loop cell otherwise.
const seamStarts = [
  new Given(posA.at('R1C1'), OFF_POS),
  new Given(posB.at('R1C1'), OFF_POS),
  new Pair(offPosKey, 'loop-seam', 'R1C1', posA.at('R1C2')),
  new Pair(offPosKey, 'loop-seam', 'R1C1', posB.at('R1C2')),
];
// Direction: the seam cell leaves along its rightward step. R1C1 is a corner, so
// when it is on the loop both of its steps are used and one of the two
// directions runs R1C1 -> R1C2; when it is off, R1C2's only other neighbours are
// R1C3 and R2C2, so the step to R1C3 is used and one direction runs that way.
const seamDirection = new NFA(NFA.encodeSpec({
  startState: { k: 0 },
  transition: (s, value) => {
    if (s.k === 0) return { k: 1, on: value !== 1 };
    if (s.k === 1) return (s.on && value !== FWD) ? undefined : { k: 2, on: s.on };
    if (s.k !== 2) return undefined;
    return (!s.on && value !== FWD) ? undefined : { k: 3 };
  },
  accept: s => s.k === 3,
}, geometry.numValues), 'loop-seam',
  'R1C1', stepBetween('R1C1', 'R1C2').id, stepBetween('R1C2', 'R1C3').id);

// --- Sandwich clues -------------------------------------------------------
// The twelve text clues above columns 2, 4, 5, 6, 7, 8 and left of rows 2, 3, 6,
// 7, 8, 9.
const sandwiches = [
  [32, graph.column(2)], [20, graph.column(4)], [10, graph.column(5)],
  [9, graph.column(6)], [10, graph.column(7)], [6, graph.column(8)],
  [31, graph.row(2)], [21, graph.row(3)], [29, graph.row(6)],
  [7, graph.row(7)], [25, graph.row(8)], [13, graph.row(9)],
].map(([total, cells]) => Sandwich.fromCells(total, cells, geometry));

return [
  new Shape('9x9'),
  new Var('S', 'loop steps', steps.length),
  posA.toVar('loop position mod ' + MOD_A),
  posB.toVar('loop position mod ' + MOD_B),
  // Position values run 1..MOD; the mod 9 layer already spans the whole range.
  posA.makeReplicate(new Given(posA.at(gridCells[0]), 1, 2, 3, 4, 5, 6, 7, 8)),
  ...degrees,
  ...counters,
  ...offPositions,
  ...seamStarts,
  seamDirection,
  ...sandwiches,
];
