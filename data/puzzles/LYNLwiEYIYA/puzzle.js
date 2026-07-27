// Title: Lupin's Loop 2 - Space Invasion
// Author: Rab3aron
// Video: https://www.youtube.com/watch?v=LYNLwiEYIYA
// Source: https://sudokupad.app/l00604nlbr

// Normal sudoku, no givens. Digits separated by a white dot are consecutive.
// A single route travels orthogonally from cell to cell, never branching,
// crossing, or overlapping, and closes into a loop; it passes through every
// planet and never crosses a thick black border (a black hole). A digit in a
// satellite dish equals the number of loop cells in the 3x3 box centred on that
// dish. Along the loop one parity forces a 90 degree turn and the other forces
// the route straight through, and which parity does which is the solver's to
// find. Two cells adjacent along the loop hold non-consecutive digits, unless
// the loop passes through a white dot. Nothing is omitted.

// The loop lives in one Var layer of *directed* shape codes: either OFF, or the
// side the route enters a cell from paired with the side it leaves by. So an
// on-loop cell uses exactly two of its four edges, and no code branches or
// crosses. Edge-agreement `Pair`s orient each used edge the same way from both
// ends, which gives every on-loop cell in-degree 1 and out-degree 1: the used
// edges form a disjoint union of directed cycles.
//
// Two position counters, modulo the coprime MOD_A and MOD_B, then cut that down
// to one cycle. Each advances by one along every used edge except the single
// edge that runs *into* the seam cell, so a cycle that avoids the seam would
// have to close on itself after L steps with L divisible by both moduli, i.e. by
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
const isStraight = code =>
  isOnLoop(code) && CODES[code].exit === OPPOSITE[CODES[code].entry];
const isTurn = code => isOnLoop(code) && !isStraight(code);

const ODD_TURNS = 1;
const EVEN_TURNS = 2;

const gridShape = new Shape('9x9', NV);
const graph = cellGraph(gridShape);
const geometry = graph.gridGeometry();
const gridCells = graph.cells();
const loop = graph.makeOverlay('VS');
const posA = graph.makeOverlay('VA');
const posB = graph.makeOverlay('VB');

// The three white dots, as the cell pairs they sit between.
const whiteDotEdges = [
  ['R5C6', 'R5C7'],
  ['R3C3', 'R4C3'],
  ['R3C7', 'R3C8'],
];

// The thick black borders (black holes), as the cell pairs they separate.
const blockedEdges = [
  ['R2C7', 'R2C8'],
  ['R3C1', 'R4C1'],
  ['R3C8', 'R4C8'],
  ['R4C5', 'R5C5'],
  ['R5C4', 'R6C4'],
  ['R5C8', 'R6C8'],
  ['R6C2', 'R7C2'],
  ['R6C6', 'R6C7'],
  ['R6C8', 'R7C8'],
  ['R7C3', 'R8C3'],
  ['R8C2', 'R8C3'],
  ['R8C7', 'R8C8'],
];

// The cells holding a planet, then the two holding a satellite dish.
const planets = [
  'R9C9', 'R9C8', 'R9C7', 'R9C6', 'R9C5',
  'R7C9', 'R6C9', 'R2C9', 'R7C8', 'R4C8', 'R2C7',
  'R9C4', 'R9C3', 'R9C2', 'R9C1', 'R8C2', 'R6C1', 'R1C4',
];
const satelliteDishes = ['R4C3', 'R5C5'];

// R9C1 holds a planet, so the loop runs through it, and it is the bottom-left
// corner, so the two edges it uses can only be up and right. That makes it a
// safe seam: the numbering below starts there, and pinning its exit side fixes
// only which of the two directions the route is traversed in.
const SEAM = 'R9C1';

const edgeKey = (a, b) => [a, b].sort().join('|');
const whiteDotKeys = new Set(whiteDotEdges.map(([a, b]) => edgeKey(a, b)));
const blockedKeys = new Set(blockedEdges.map(([a, b]) => edgeKey(a, b)));

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

// A code is available only if every side it uses leads to an in-grid cell
// across a border the route is allowed to cross.
const availableCodes = cell => ALL_CODES.filter(code => SIDES.every(side => {
  if (!usesSide(code, side)) return true;
  const other = graph.step(cell, ...STEP[side]);
  return other !== null && !blockedKeys.has(edgeKey(cell, other));
}));

const codeDomains = gridCells.map(
  cell => new Given(loop.at(cell), ...availableCodes(cell)));
const planetConstraints = planets.map(
  cell => new Given(loop.at(cell), ...ON_LOOP_CODES));

const whiteDots = whiteDotEdges.map(([a, b]) => new WhiteDot(a, b));

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
  new Given(loop.at(SEAM), codeFor('U', 'R')),
  new Given(posA.at(SEAM), POS0),
  new Given(posB.at(SEAM), POS0),
];

// Reads a cell's shape code, then that cell's digit and its `side` neighbour's
// digit; the digits must be non-consecutive when the loop uses the edge between
// them, unless a white dot sits on that edge.
const nonConsecutiveSpec = (side, isWhiteDot) => cached(
  ['nc', side, isWhiteDot].join('|'), () => NFA.encodeSpec({
    startState: { k: 0 },
    transition: (state, value) => {
      if (state.k === 0) return { k: 1, joined: usesSide(value, side) };
      if (state.k === 1) return { k: 2, joined: state.joined, a: value };
      if (state.k !== 2) return undefined;
      if (!state.joined || isWhiteDot) return { done: true };
      return Math.abs(state.a - value) === 1 ? undefined : { done: true };
    },
    accept: state => state.done === true,
  }, geometry));

const nonConsecutive = edges.map(({ a, b, side }) => new NFA(
  nonConsecutiveSpec(side, whiteDotKeys.has(edgeKey(a, b))),
  side === 'R' ? 'loop-nc-h' : 'loop-nc-v', loop.at(a), a, b));

// The parity-to-behaviour mapping is one global choice, so the whole grid sits
// inside an Or of the two readings; each branch relates a cell's shape code to
// its own digit.
const parityKey = selector => Pair.fnToKey((code, value) => {
  if (!isOnLoop(code)) return true;
  const digitIsOdd = value % 2 === 1;
  return selector === ODD_TURNS
    ? (isTurn(code) && digitIsOdd) || (isStraight(code) && !digitIsOdd)
    : (isTurn(code) && !digitIsOdd) || (isStraight(code) && digitIsOdd);
}, geometry);
const parity = [new Or([
  new And(gridCells.map(
    cell => new Pair(parityKey(ODD_TURNS), 'odd-turns', loop.at(cell), cell))),
  new And(gridCells.map(
    cell => new Pair(parityKey(EVEN_TURNS), 'even-turns', loop.at(cell), cell))),
])];

// Reads the dish's digit, then the shape codes of the 3x3 block centred on it,
// counting the cells that are on the loop.
const satelliteSpec = NFA.encodeSpec({
  startState: { target: null, count: 0 },
  transition: ({ target, count }, value) => {
    if (target === null) return { target: value, count: 0 };
    const next = count + (isOnLoop(value) ? 1 : 0);
    return next > target ? undefined : { target, count: next };
  },
  accept: ({ target, count }) => target !== null && count === target,
}, geometry);

const centredBlock = cell => {
  const { row, col } = parseCellId(cell);
  return graph.block(makeCellId(row - 1, col - 1), 3, 3);
};
const satellites = satelliteDishes.map(cell => new NFA(
  satelliteSpec, 'satellite', cell, ...loop.at(centredBlock(cell))));

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
  ...codeDomains,
  ...planetConstraints,
  ...seam,
  ...whiteDots,
  ...agreement,
  ...numbered,
  ...counters,
  ...nonConsecutive,
  ...parity,
  ...satellites,
];
