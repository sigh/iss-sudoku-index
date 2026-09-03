// Title: Parity Loop
// Author: Paletron
// Video: https://www.youtube.com/watch?v=UL39uNRa6xs
// Source: https://app.crackingthecryptic.com/sudoku/LqdQnHfdnM

// Normal sudoku rules apply. Draw a single closed loop (without branching or
// crossing) moving orthogonally through centres of some cells in the grid. The
// loop travels on cells of the same parity, and when it crosses a box border,
// the parity switches. The loop passes through each circle and the number in
// the circle counts the number of cells around it which are visited by the loop
// (including itself, maximum of 9). Cells connected by V sum to 5. Cells
// connected by X sum to 10. Nothing is omitted.
//
// No circle in the source carries printed text, so "the number in the circle"
// is the sudoku digit of the circled cell, and "the cells around it" is the 3x3
// neighbourhood centred on that cell -- the reading the rules' "maximum of 9"
// describes. A circle on the grid edge has only the in-grid part of that
// neighbourhood (R1C1: 4 cells, R1C5: 6 cells).
//
// The loop lives in one Var layer of *directed* shape codes: either OFF, or the
// side the route enters a cell from paired with the side it leaves by. An
// on-loop cell therefore uses exactly two of its four edges, and no code
// branches or crosses. Edge-agreement `Pair`s orient each used edge the same way
// from both ends, giving every on-loop cell in-degree 1 and out-degree 1: the
// used edges form a disjoint union of directed cycles.
//
// Two position counters, modulo the coprime MOD_A and MOD_B, cut that down to a
// single cycle. Each advances by one along every used edge except the single
// edge running *into* the seam cell, so a cycle avoiding the seam would have to
// close on itself after L steps with L divisible by both moduli, i.e. by
// lcm(9, 10) = 90 -- impossible for the at most 80 cells such a cycle could
// occupy. Only the cycle through the seam can close, so there is exactly one
// loop. ISS has no single-loop primitive, and `ConnectedValues` cannot supply
// this: it sees only cell adjacency, and two loops running alongside each other
// are one connected set of cells while sharing no used edge.
//
// The alphabet is widened to 13 to hold the codes and the counters; the 81 grid
// cells are pinned back to 1-9.

const NV = 13;
const MOD_A = 9, MOD_B = 10;  // coprime; lcm 90 > 81 cells
const OFF = 1;                // shape code, and counter value, of a cell the loop misses
const POS0 = 2;               // counter value of the seam cell (position 0)

const SIDES = ['U', 'D', 'L', 'R'];
const STEP = { U: [-1, 0], D: [1, 0], L: [0, -1], R: [0, 1] };
const OPPOSITE = { U: 'D', D: 'U', L: 'R', R: 'L' };

// Shape codes: OFF, then one code per ordered (entry side, exit side) pair.
const CODES = [null, null];
for (const entry of SIDES) {
  for (const exit of SIDES) {
    if (entry !== exit) CODES.push({ entry, exit });
  }
}
const ALL_CODES = CODES.map((_, code) => code).slice(OFF);
const ON_LOOP_CODES = ALL_CODES.filter(code => code !== OFF);
const codeFor = (entry, exit) =>
  CODES.findIndex(c => c !== null && c.entry === entry && c.exit === exit);

const isOnLoop = code => code !== OFF;
const entersFrom = (code, side) => isOnLoop(code) && CODES[code].entry === side;
const exitsTo = (code, side) => isOnLoop(code) && CODES[code].exit === side;
const usesSide = (code, side) => entersFrom(code, side) || exitsTo(code, side);

const gridShape = new Shape('9x9', NV);
const graph = cellGraph(gridShape);
const geometry = graph.gridGeometry();
const gridCells = graph.cells();
const loop = graph.makeOverlay('VS');
const posA = graph.makeOverlay('VA');
const posB = graph.makeOverlay('VB');

// Drawn clues, transcribed from the source artwork.
// The nine white circles, as the cells they are drawn on.
const circles = [
  'R1C1', 'R1C5', 'R2C7', 'R2C8', 'R6C3', 'R7C3', 'R7C4', 'R7C5', 'R7C7',
];
// The X and V letters, as the cell pairs whose shared border they sit on.
const xEdges = [
  ['R4C2', 'R4C3'],
  ['R3C5', 'R3C6'],
  ['R5C1', 'R6C1'],
];
const vEdges = [
  ['R3C7', 'R3C8'],
];

// R1C1 holds a circle, so the loop runs through it, and it is the top-left
// corner, so the two edges it uses can only be down and right. That makes it a
// safe seam: the numbering below starts there, and pinning its exit side fixes
// only which of the two directions the single loop is traversed in.
const SEAM = 'R1C1';

// Each orthogonal edge once, as (a, b) with `side` the direction a -> b.
const edges = gridCells.flatMap(cell => ['D', 'R'].flatMap(side => {
  const other = graph.step(cell, ...STEP[side]);
  return other ? [{ a: cell, b: other, side }] : [];
}));

const cache = new Map();
const cached = (key, build) => {
  if (!cache.has(key)) cache.set(key, build());
  return cache.get(key);
};

const boxOf = cell => {
  const { row, col } = parseCellId(cell);
  return ((row - 1) / 3 | 0) * 3 + ((col - 1) / 3 | 0);
};

// A code is available only if every side it uses leads to an in-grid cell.
const availableCodes = cell => ALL_CODES.filter(
  code => SIDES.every(
    side => !usesSide(code, side) || graph.step(cell, ...STEP[side]) !== null));

const codeDomains = gridCells.map(
  cell => new Given(loop.at(cell), ...availableCodes(cell)));
const circleOnLoop = circles.map(
  cell => new Given(loop.at(cell), ...ON_LOOP_CODES));

// Edge agreement across the shared border of a cell and its neighbour on
// `side`: a's exit that way is b's entry back, and a's entry that way is b's
// exit back. Applied to every edge, this orients each used edge consistently.
const agreementKey = side => Pair.fnToKey(
  (codeA, codeB) => exitsTo(codeA, side) === entersFrom(codeB, OPPOSITE[side])
    && entersFrom(codeA, side) === exitsTo(codeB, OPPOSITE[side]),
  geometry);
const agreement = [
  loop.makeReplicate(
    new Pair(agreementKey('R'), 'edge-h', loop.at('R1C1'), loop.at('R1C2')),
    loop.at(gridCells.filter(cell => graph.step(cell, 0, 1)))),
  loop.makeReplicate(
    new Pair(agreementKey('D'), 'edge-v', loop.at('R1C1'), loop.at('R2C1')),
    loop.at(gridCells.filter(cell => graph.step(cell, 1, 0)))),
];

// Counter values run POS0, POS0+1, ... POS0+mod-1 and wrap.
const nextPos = (value, mod) => POS0 + ((value - POS0 + 1) % mod);

// Reads a cell's shape code, then its counter and its `side` neighbour's
// counter. If the loop leaves the first cell towards the second, the second
// counter is one further on, and vice versa; an unused edge says nothing.
// `intoBSeam` / `intoASeam` mark an edge whose target is the seam cell, which is
// the one edge exempted so that the loop through the seam can close.
const counterSpec = (side, mod, intoBSeam, intoASeam) => cached(
  ['cnt', side, mod, intoBSeam, intoASeam].join('|'), () => NFA.encodeSpec({
    startState: { k: 0 },
    transition: (state, value) => {
      if (state.k === 0) return { k: 1, code: value };
      if (state.k === 1) return { k: 2, code: state.code, a: value };
      if (state.k !== 2) return undefined;
      const forward = exitsTo(state.code, side);
      const backward = entersFrom(state.code, side);
      if (!forward && !backward) return { done: true };
      if (state.a === OFF || value === OFF) return undefined;
      if (forward) {
        return intoBSeam || value === nextPos(state.a, mod)
          ? { done: true } : undefined;
      }
      return intoASeam || state.a === nextPos(value, mod)
        ? { done: true } : undefined;
    },
    accept: state => state.done === true,
  }, geometry));

const counters = edges.flatMap(({ a, b, side }) => [
  new NFA(counterSpec(side, MOD_A, b === SEAM, a === SEAM), 'loop-order',
    loop.at(a), posA.at(a), posA.at(b)),
  new NFA(counterSpec(side, MOD_B, b === SEAM, a === SEAM), 'loop-order',
    loop.at(a), posB.at(a), posB.at(b)),
]);

// A cell is numbered exactly when it is on the loop, so the counters carry no
// choice of their own on cells the loop misses.
const numberedKey = Pair.fnToKey(
  (code, pos) => isOnLoop(code) === (pos !== OFF), geometry);
const numbered = gridCells.flatMap(cell => [
  new Pair(numberedKey, 'loop-cell', loop.at(cell), posA.at(cell)),
  new Pair(numberedKey, 'loop-cell', loop.at(cell), posB.at(cell)),
]);

const seam = [
  new Given(loop.at(SEAM), codeFor('D', 'R')),
  new Given(posA.at(SEAM), POS0),
  new Given(posB.at(SEAM), POS0),
];

// Reads a cell's shape code, then that cell's digit and its `side` neighbour's
// digit. When the loop uses the edge between them the two digits share parity
// if the step stays inside one box, and differ in parity if it crosses a box
// border; an unused edge says nothing about the digits.
const paritySpec = (side, sameBox) => cached(
  ['par', side, sameBox].join('|'), () => NFA.encodeSpec({
    startState: { k: 0 },
    transition: (state, value) => {
      if (state.k === 0) return { k: 1, joined: usesSide(value, side) };
      if (state.k === 1) return { k: 2, joined: state.joined, a: value };
      if (state.k !== 2) return undefined;
      if (!state.joined) return { done: true };
      const same = (state.a % 2) === (value % 2);
      return same === sameBox ? { done: true } : undefined;
    },
    accept: state => state.done === true,
  }, geometry));

const parity = edges.map(({ a, b, side }) => new NFA(
  paritySpec(side, boxOf(a) === boxOf(b)),
  side === 'R' ? 'loop-parity-h' : 'loop-parity-v', loop.at(a), a, b));

// Reads the circled cell's digit, then the shape codes of the in-grid cells of
// the 3x3 neighbourhood centred on it, counting the ones the loop visits.
const circleSpec = NFA.encodeSpec({
  startState: { target: null, count: 0 },
  transition: ({ target, count }, value) => {
    if (target === null) return { target: value, count: 0 };
    const next = count + (isOnLoop(value) ? 1 : 0);
    return next > target ? undefined : { target, count: next };
  },
  accept: ({ target, count }) => target !== null && count === target,
}, geometry);

const neighbourhood = cell => [-1, 0, 1].flatMap(
  dR => [-1, 0, 1].flatMap(dC => {
    const other = graph.step(cell, dR, dC);
    return other ? [other] : [];
  }));
const circleCounts = circles.map(cell => new NFA(
  circleSpec, 'circle-count', cell, ...loop.at(neighbourhood(cell))));

const xv = [
  ...xEdges.map(pair => new X(...pair)),
  ...vEdges.map(pair => new V(...pair)),
];

const domains = [
  graph.makeReplicate(new Given(gridCells[0], 1, 2, 3, 4, 5, 6, 7, 8, 9)),
  posA.makeReplicate(new Given(posA.at(gridCells[0]),
    ...Array.from({ length: MOD_A + 1 }, (_, n) => n + 1))),
  posB.makeReplicate(new Given(posB.at(gridCells[0]),
    ...Array.from({ length: MOD_B + 1 }, (_, n) => n + 1))),
];

return [
  gridShape,
  loop.toVar('loop shape'),
  posA.toVar('loop position mod ' + MOD_A),
  posB.toVar('loop position mod ' + MOD_B),
  ...domains,
  new Given('R1C9', 8),
  new Given('R5C6', 5),
  new Given('R8C5', 7),
  new Given('R9C2', 8),
  new Given('R9C9', 7),
  ...codeDomains,
  ...circleOnLoop,
  ...seam,
  ...agreement,
  ...numbered,
  ...counters,
  ...parity,
  ...circleCounts,
  ...xv,
];
