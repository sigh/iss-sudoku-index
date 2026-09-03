// Title: Round The Houses
// Author: Tallcat
// Video: https://www.youtube.com/watch?v=xh6ESoNs29U
// Source: https://app.crackingthecryptic.com/sudoku/4qJrNJh6tP

// Normal sudoku rules apply. Connect some cells in the grid to form an
// orthogonally connected loop that must pass through every cage in the grid
// exactly once. The cage totals given are the sum of the digits on the loop in
// each cage (at least one cell in each cage is not visited by the loop). Digits
// may not repeat in cages. Nothing is omitted.
//
// "Passes through every cage exactly once" is encoded as: exactly one used loop
// edge crosses into each cage, so the cage's visited cells are a single
// unbroken stretch of the loop (a second visit would need a second entry).
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

// The sixteen killer cages drawn in the source, each as its cells and its
// printed total.
const cages = [
  { total: 4, cells: ['R1C2', 'R2C2', 'R2C1'] },
  { total: 15, cells: ['R1C3', 'R1C4', 'R1C5'] },
  { total: 19, cells: ['R1C6', 'R2C6', 'R2C5', 'R3C5'] },
  { total: 10, cells: ['R2C4', 'R2C3', 'R3C3', 'R3C2', 'R4C2'] },
  { total: 18, cells: ['R4C1', 'R5C1', 'R5C2', 'R5C3'] },
  { total: 23, cells: ['R6C3', 'R6C4', 'R7C4', 'R7C5', 'R8C5'] },
  { total: 4, cells: ['R7C1', 'R7C2', 'R7C3', 'R8C2'] },
  { total: 13, cells: ['R9C1', 'R9C2', 'R9C3'] },
  { total: 22, cells: ['R8C6', 'R8C7', 'R7C6', 'R9C7'] },
  { total: 12, cells: ['R8C8', 'R9C8', 'R8C9'] },
  { total: 14, cells: ['R7C7', 'R6C8', 'R7C8', 'R6C7'] },
  { total: 11, cells: ['R5C6', 'R6C6', 'R6C5'] },
  { total: 13, cells: ['R5C5', 'R4C5', 'R4C6', 'R3C6'] },
  { total: 11, cells: ['R2C8', 'R1C8', 'R1C9'] },
  { total: 8, cells: ['R2C9', 'R3C9', 'R3C8'] },
  { total: 12, cells: ['R4C8', 'R5C8', 'R5C9'] },
];

// The seam for the position counters is R1C4, which the cage rules force onto
// the loop: cage R1C3+R1C4+R1C5 totals 15 with at least one of its three cells
// unvisited and no repeated digits, so exactly two of them are on the loop
// (one digit cannot reach 15), and the single-visit rule makes those two
// consecutive along the loop, hence orthogonally adjacent. In a 1x3 cage the
// only adjacent pairs are R1C3-R1C4 and R1C4-R1C5, so R1C4 is visited either
// way.
const SEAM = 'R1C4';
// R1C4 sits on the top edge, so its two used sides come from {L, R, D}. Pinning
// it to one directed code per unordered pair fixes only which way round the
// single loop is traversed.
const SEAM_CODES = [codeFor('L', 'R'), codeFor('L', 'D'), codeFor('R', 'D')];

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

// A code is available only if every side it uses leads to an in-grid cell.
const availableCodes = cell => ALL_CODES.filter(
  code => SIDES.every(
    side => !usesSide(code, side) || graph.step(cell, ...STEP[side]) !== null));

const codeDomains = gridCells.map(
  cell => new Given(loop.at(cell), ...availableCodes(cell)));

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
  new Given(loop.at(SEAM), ...SEAM_CODES),
  new Given(posA.at(SEAM), POS0),
  new Given(posB.at(SEAM), POS0),
];

// "Passes through every cage exactly once": reads the shape codes of the cage's
// cells in order and counts the used edges entering the cage from outside it.
// A cell contributes one entry when the side it is entered from leads out of
// the cage, so the count is exactly the number of separate visits, and must be
// one. `outSides` lists, per cell of this cage, the sides that leave the cage.
const visitSpec = outSides => NFA.encodeSpec({
  startState: { i: 0, count: 0 },
  transition: ({ i, count }, value) => {
    if (i >= outSides.length) return undefined;
    const enters = outSides[i].some(side => entersFrom(value, side));
    const next = count + (enters ? 1 : 0);
    return next > 1 ? undefined : { i: i + 1, count: next };
  },
  accept: ({ i, count }) => i === outSides.length && count === 1,
}, geometry);

const cageVisits = cages.map(({ cells }) => {
  const outSides = cells.map(cell => SIDES.filter(side => {
    const other = graph.step(cell, ...STEP[side]);
    return other === null || !cells.includes(other);
  }));
  return new NFA(visitSpec(outSides), 'cage-visit', ...loop.at(cells));
});

// The cage total, and the "at least one cell is not visited" clause: reads the
// cage's cells as (shape code, digit) pairs, adding up the digits of the cells
// the loop visits and remembering whether some cell was missed.
const totalSpec = total => cached(['total', total].join('|'), () => NFA.encodeSpec({
  startState: { sum: 0, missed: false, on: null },
  transition: ({ sum, missed, on }, value) => {
    if (on === null) {
      return { sum, missed: missed || !isOnLoop(value), on: isOnLoop(value) };
    }
    const next = on ? sum + value : sum;
    return next > total ? undefined : { sum: next, missed, on: null };
  },
  accept: ({ sum, missed, on }) => on === null && sum === total && missed,
}, geometry));

const cageTotals = cages.map(({ total, cells }) => new NFA(
  totalSpec(total), 'cage-total',
  ...cells.flatMap(cell => [loop.at(cell), cell])));

const cageDistinct = cages.map(({ cells }) => new AllDifferent(...cells));

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
  new Given('R4C7', 3),
  ...codeDomains,
  ...seam,
  ...agreement,
  ...numbered,
  ...counters,
  ...cageVisits,
  ...cageTotals,
  ...cageDistinct,
];
