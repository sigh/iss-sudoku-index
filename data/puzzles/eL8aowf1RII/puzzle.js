// Title: Shining Loop
// Author: ElChiglia
// Video: https://www.youtube.com/watch?v=eL8aowf1RII
// Source: https://app.crackingthecryptic.com/sudoku/jfrf3mHRbN

// Normal sudoku rules apply; there are no given digits. Draw a single
// non-intersecting loop by connecting the centres of orthogonally adjacent
// cells. i) The loop enters every cage exactly once. ii) Within a cage the loop
// only passes through cells of the same parity, but when the loop crosses a cage
// border the parity of the loop switches. iii) Within each cage the loop must
// pass through at least one moon or sun; each symbol stands for a different
// parity and every cell containing that symbol has the respective parity, with
// the solver deciding which symbol is which. Digits within a cage cannot repeat
// and must sum to the small clue in its top left corner when one is given.
// Nothing is omitted.

// The eighteen cages partition the grid, so every cell lies in exactly one cage.
//
// The loop lives in one Var layer of *directed* shape codes: either OFF, or the
// side the route enters a cell from paired with the side it leaves by. Edge
// agreement Pairs orient each used edge the same way from both ends, so every
// on-loop cell has in-degree 1 and out-degree 1 and the used edges form a
// disjoint union of directed cycles; one code per cell is also what makes the
// loop non-intersecting. Two position counters, modulo the coprime MOD_A and
// MOD_B, cut that down to a single cycle: each advances by one along every used
// edge except the one running *into* the seam cell, so a cycle avoiding the seam
// would have to close after L steps with L divisible by lcm(8, 11) = 88, while
// at most 80 cells (81 less the seam) are available to it.
//
// The seam is R9C1. Cage E is R8C1 + R9C1 and R9C1 carries its only symbol, so
// rule iii puts the loop through R9C1; as the bottom-left corner cell it can then
// only use its up and right edges. Pinning which of those two is the entry
// removes the arbitrary direction of travel and nothing else.
//
// The alphabet is widened to 13 to hold the thirteen shape codes and the mod-11
// counter values; the 81 grid cells are pinned back to 1-9.

const NV = 13;
const MOD_A = 8, MOD_B = 11;  // coprime; lcm 88 > the 80 cells a seam-free cycle could use
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
const ALL_CODES = CODES.map((_, code) => code).slice(OFF);   // OFF and the twelve codes
const codeFor = (entry, exit) =>
  CODES.findIndex(c => c !== null && c.entry === entry && c.exit === exit);

const isOnLoop = code => code !== OFF;
const entersFrom = (code, side) => isOnLoop(code) && CODES[code].entry === side;
const exitsTo = (code, side) => isOnLoop(code) && CODES[code].exit === side;
const usesSide = (code, side) => entersFrom(code, side) || exitsTo(code, side);
const ON_LOOP_CODES = ALL_CODES.filter(isOnLoop);

const ODD = [1, 3, 5, 7, 9], EVEN = [2, 4, 6, 8];

const gridShape = new Shape('9x9', NV);
const graph = cellGraph(gridShape);
const geometry = graph.gridGeometry();
const gridCells = graph.cells();
const loop = graph.makeOverlay('VS');
const posA = graph.makeOverlay('VA');
const posB = graph.makeOverlay('VB');

// The eighteen drawn cages: the small clue in the top left corner (null where the
// cage carries none) and the cells inside the outline.
const cages = [
  { total: null, cells: ['R1C3', 'R1C4', 'R2C3', 'R2C4', 'R2C5'] },
  { total: null, cells: ['R8C4', 'R8C5', 'R9C4', 'R9C5', 'R9C6'] },
  { total: null, cells: ['R1C5', 'R1C6', 'R1C7', 'R1C8'] },
  { total: null, cells: ['R4C5', 'R4C6', 'R4C7', 'R5C6', 'R5C7'] },
  { total: null, cells: ['R8C1', 'R9C1'] },
  { total: null, cells: ['R6C4', 'R6C5', 'R7C1', 'R7C2', 'R7C3', 'R7C4', 'R7C5'] },
  { total: null, cells: ['R8C6', 'R8C7', 'R9C7', 'R9C8'] },
  { total: null, cells: ['R5C8', 'R6C6', 'R6C7', 'R6C8'] },
  { total: 20, cells: ['R1C9', 'R2C9', 'R3C9', 'R4C9'] },
  { total: 17, cells: ['R5C9', 'R6C9', 'R7C9'] },
  { total: 32, cells: ['R1C1', 'R1C2', 'R2C1', 'R2C2', 'R3C1', 'R3C2'] },
  { total: 28, cells: ['R3C3', 'R4C3', 'R5C2', 'R5C3', 'R6C2', 'R6C3'] },
  { total: 32, cells: ['R7C6', 'R7C7', 'R7C8', 'R8C8', 'R8C9', 'R9C9'] },
  { total: 16, cells: ['R2C6', 'R3C5', 'R3C6'] },
  { total: 17, cells: ['R3C4', 'R4C4', 'R5C4', 'R5C5'] },
  { total: 25, cells: ['R2C7', 'R2C8', 'R3C7', 'R3C8', 'R4C8'] },
  { total: 23, cells: ['R8C2', 'R8C3', 'R9C2', 'R9C3'] },
  { total: 22, cells: ['R4C1', 'R4C2', 'R5C1', 'R6C1'] },
];

// The twenty-four drawn symbols, as the cells holding a crescent moon and the
// cells holding a sun.
const moonCells = [
  'R1C2', 'R1C7', 'R3C6', 'R4C3', 'R4C7', 'R5C4',
  'R5C9', 'R6C6', 'R7C5', 'R7C7', 'R8C4', 'R9C1',
];
const sunCells = [
  'R2C3', 'R2C7', 'R3C4', 'R3C9', 'R4C2', 'R5C6',
  'R5C8', 'R7C2', 'R7C6', 'R8C2', 'R8C7', 'R9C5',
];

const symbolCells = new Set([...moonCells, ...sunCells]);
const cageOf = new Map();
cages.forEach(({ cells }, index) => cells.forEach(cell => cageOf.set(cell, index)));

const cache = new Map();
const cached = (key, build) => {
  if (!cache.has(key)) cache.set(key, build());
  return cache.get(key);
};

// Each orthogonal edge once, as (a, b) with `side` the direction a -> b.
const edges = gridCells.flatMap(cell => ['D', 'R'].flatMap(side => {
  const other = graph.step(cell, ...STEP[side]);
  return other ? [{ a: cell, b: other, side }] : [];
}));

// A code is available only if every side it uses leads to an in-grid cell.
const codeDomains = gridCells.map(cell => new Given(loop.at(cell),
  ...ALL_CODES.filter(code => SIDES.every(
    side => !usesSide(code, side) || graph.step(cell, ...STEP[side])))));

// Edge agreement across the shared border of a cell and its neighbour on `side`:
// a's exit that way is b's entry back, and a's entry that way is b's exit back.
// Applied to every edge, this orients each used edge consistently.
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

// Reads a cell's shape code, then its counter and its `side` neighbour's counter.
// If the loop leaves the first cell towards the second, the second counter is one
// further on, and vice versa; an unused edge says nothing. `intoBSeam` /
// `intoASeam` mark an edge whose target is the seam cell, which is the one edge
// exempted so that the loop through the seam can close.
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

// The seam. Cage E (R8C1, R9C1) holds exactly one symbol, the moon in R9C1, so
// rule iii forces the loop through R9C1; the bottom-left corner leaves it no
// shape but up-and-right, and fixing which of those is the entry removes only the
// direction of travel.
const SEAM = 'R9C1';
const counters = edges.flatMap(({ a, b, side }) => [
  new NFA(counterSpec(side, MOD_A, b === SEAM, a === SEAM), 'loop-order',
    loop.at(a), posA.at(a), posA.at(b)),
  new NFA(counterSpec(side, MOD_B, b === SEAM, a === SEAM), 'loop-order',
    loop.at(a), posB.at(a), posB.at(b)),
]);
const seamPins = [
  new Given(loop.at(SEAM), codeFor('U', 'R')),
  new Given(posA.at(SEAM), POS0),
  new Given(posB.at(SEAM), POS0),
];

// A cell is numbered exactly when it is on the loop, so the counters carry no
// choice of their own on cells the loop misses.
const numberedKey = Pair.fnToKey(
  (code, pos) => isOnLoop(code) === (pos !== OFF), geometry);
const numbered = gridCells.flatMap(cell => [
  new Pair(numberedKey, 'loop-cell', loop.at(cell), posA.at(cell)),
  new Pair(numberedKey, 'loop-cell', loop.at(cell), posB.at(cell)),
]);

// Digits within a cage do not repeat, and sum to the corner clue when given.
const cageDigits = cages.map(({ total, cells }) =>
  total === null ? new AllDifferent(...cells) : new Cage(total, ...cells));

// Rule i. The loop enters a cage exactly once exactly when two of its steps cross
// that cage's border, so count, over the cage's cells, the used sides that lead
// out of the cage. `state.i` is the cell being read, since which sides leave the
// cage depends on the cell.
const outwardSides = (cell, index) => SIDES.filter(side => {
  const other = graph.step(cell, ...STEP[side]);
  return other && cageOf.get(other) !== index;
});
const entriesSpec = (cells, index) => NFA.encodeSpec({
  startState: { i: 0, count: 0 },
  transition: ({ i, count }, value) => {
    if (i >= cells.length) return undefined;
    const total = count + outwardSides(cells[i], index)
      .filter(side => usesSide(value, side)).length;
    return total > 2 ? undefined : { i: i + 1, count: total };
  },
  accept: ({ i, count }) => i === cells.length && count === 2,
}, geometry);
// The two-cell cage is the same count as a binary relation on its two codes.
const entriesKey = (cells, index) => Pair.fnToKey(
  (...codes) => codes.reduce((sum, code, i) => sum + outwardSides(cells[i], index)
    .filter(side => usesSide(code, side)).length, 0) === 2,
  geometry);
const cageEntries = cages.map(({ cells }, index) => cells.length === 2
  ? new Pair(entriesKey(cells, index), 'cage-entry', ...loop.at(cells))
  : new NFA(entriesSpec(cells, index), 'cage-entry', ...loop.at(cells)));

// Rule ii, within a cage: the cage's on-loop cells all share one digit parity.
// Reads [shape code, digit] per cage cell and carries the parity seen so far,
// 0 until an on-loop cell has been read.
const cageParitySpec = cached('cage-parity', () => NFA.encodeSpec({
  startState: { atCode: true, on: false, par: 0 },
  transition: (state, value) => {
    if (state.atCode) return { atCode: false, on: isOnLoop(value), par: state.par };
    if (!state.on) return { atCode: true, on: false, par: state.par };
    const par = 1 + (value % 2);
    if (state.par !== 0 && state.par !== par) return undefined;
    return { atCode: true, on: false, par };
  },
  accept: state => state.atCode === true,
}, geometry));
const cageParity = cages.map(({ cells }) => new NFA(cageParitySpec, 'cage-parity',
  ...cells.flatMap(cell => [loop.at(cell), cell])));

// Rule ii, across a border: a loop step between two cages joins digits of
// opposite parity. Reads [shape code of a, digit of a, digit of b]; edge
// agreement guarantees b agrees about the step, so only a's code is read.
const switchSpec = side => cached(['switch', side].join('|'), () => NFA.encodeSpec({
  startState: { k: 0 },
  transition: (state, value) => {
    if (state.k === 0) return { k: 1, joined: usesSide(value, side) };
    if (state.k === 1) return { k: 2, joined: state.joined, parA: value % 2 };
    if (state.k !== 2) return undefined;
    if (!state.joined) return { k: 3 };
    return (value % 2) !== state.parA ? { k: 3 } : undefined;
  },
  accept: state => state.k === 3,
}, geometry));
const paritySwitch = edges
  .filter(({ a, b }) => cageOf.get(a) !== cageOf.get(b))
  .map(({ a, b, side }) => new NFA(switchSpec(side), 'cage-switch',
    loop.at(a), a, b));

// Rule iii, first sentence: each cage has at least one of its symbol cells on the
// loop.
const symbolOnLoop = cages.map(({ cells }) => {
  const symbols = cells.filter(cell => symbolCells.has(cell));
  const onLoop = cell => new Given(loop.at(cell), ...ON_LOOP_CODES);
  return symbols.length === 1 ? onLoop(symbols[0]) : new Or(symbols.map(onLoop));
});

// Rule iii, remaining sentences: the two symbols take different parities, the
// same way for every cell that carries them, and the solver picks which way.
const parityBranch = (moonValues, sunValues) => new And([
  ...moonCells.map(cell => new Given(cell, ...moonValues)),
  ...sunCells.map(cell => new Given(cell, ...sunValues)),
]);
const symbolParity = new Or([parityBranch(ODD, EVEN), parityBranch(EVEN, ODD)]);

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
  ...agreement,
  ...numbered,
  ...counters,
  ...seamPins,
  ...cageDigits,
  ...cageEntries,
  ...cageParity,
  ...paritySwitch,
  ...symbolOnLoop,
  symbolParity,
];
