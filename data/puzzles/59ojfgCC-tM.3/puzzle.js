// Title: Yajilin by Prasanna Seshadri
// Author: Prasanna Seshadri
// Video: https://www.youtube.com/watch?v=59ojfgCC-tM
// Source: https://tinyurl.com/2p8cz552

// Rules encoded here, transcribed from the video's on-screen rules panel:
// blacken some white cells so that no two blackened cells share an edge,
// then draw a single closed loop (without intersections or crossings)
// through every remaining white cell. Some cells are outlined in grey and
// cannot be part of the loop; a numbered arrow in such a cell counts the
// blackened cells lying in the arrow's direction, anywhere in the grid. The
// rules name "blackened" and "grey" as different colours, and separately
// describe the outlined-grey cells (both the eight with an arrow and the
// four without) as their own class rather than as "white cells" -- so a
// grey cell is neither blackened nor on the loop and does not count toward
// any arrow total. Nothing is omitted.
//
// There is no digit layer: this is a pure Yajilin on a Raw 10x10 grid whose
// cells directly hold a *directed* shape code -- OFF, or the side the loop
// enters from paired with the side it leaves by. The rules forbid the drawn
// line crossing or branching, which a self-touching pair of parallel
// segments does not do, so the sound model is degree-from-code plus edge
// agreement, not plain ON/OFF membership with a degree-2 count (which would
// wrongly reject a loop that runs alongside itself without touching).
// The 12 outlined-grey cells are pinned OFF and read as "excluded": never
// blackened, never on the loop, and skipped when a ray scans past them. On
// every other cell OFF means blackened and any other code means on the loop.
//
// Edge-agreement Pairs orient each used edge the same way from both ends,
// giving every on-loop cell in-degree 1 and out-degree 1 (a disjoint union of
// directed cycles). Two position counters, modulo the coprime MOD_A and
// MOD_B, cut that to a single cycle: each advances by one along every used
// edge except the edge running *into* the seam cell, so a cycle avoiding the
// seam would have to close after L steps with L divisible by both moduli,
// i.e. by lcm(9, 10) = 90; at most 88 cells (100 less the 12 excluded cells)
// are available to such a cycle, so only the cycle through the seam can
// close.
//
// The seam is the first on-loop cell in reading order. R1C1 is excluded (an
// arrow clue) and R1C2, R1C3 are orthogonally adjacent so cannot both be
// blackened, which leaves exactly two candidates; the encoding disjoins over
// them. In either branch the seam cell is in row 1 with an off-loop cell to
// its left (R1C1 is always off-loop, and whichever of R1C2/R1C3 is not the
// seam is blackened), so it must use exactly its down and right edges;
// pinning which of those two is the entry removes only the arbitrary
// direction of travel around the loop, not a real solution.
//
// The alphabet is widened to 13 to hold the shape codes and the counter
// values.

const NV = 13;
const MOD_A = 9, MOD_B = 10;  // coprime; lcm 90 > the 88 cells a seam-free cycle could use
const OFF = 1;                // shape code of a cell the loop misses (blackened or excluded)
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

const ROWS = 10, COLS = 10;

const gridShape = new Shape('10x10', NV, 'Raw');
const graph = cellGraph(gridShape);
const geometry = graph.gridGeometry();
const gridCells = graph.cells();
const posA = graph.makeOverlay('VA');
const posB = graph.makeOverlay('VB');

// The eight numbered arrow clues, transcribed from the source's grid (all
// eight arrows are drawn; none is left for the solver to place).
const arrowClues = [
  { cell: makeCellId(1, 1), side: 'R', target: 2 },
  { cell: makeCellId(1, 6), side: 'D', target: 2 },
  { cell: makeCellId(3, 7), side: 'L', target: 0 },
  { cell: makeCellId(4, 4), side: 'R', target: 0 },
  { cell: makeCellId(5, 8), side: 'U', target: 1 },
  { cell: makeCellId(7, 7), side: 'U', target: 1 },
  { cell: makeCellId(7, 9), side: 'L', target: 4 },
  { cell: makeCellId(10, 10), side: 'L', target: 4 },
];

// The four plain outlined-grey cells (no arrow): excluded from the loop like
// the arrow cells above, but carry no count of their own.
const plainExcluded = [
  makeCellId(4, 2), makeCellId(6, 3), makeCellId(8, 4), makeCellId(10, 5),
];

const excludedCells = [...arrowClues.map(c => c.cell), ...plainExcluded];
const excludedSet = new Set(excludedCells);

const cache = new Map();
const cached = (key, build) => {
  if (!cache.has(key)) cache.set(key, build());
  return cache.get(key);
};

// Every cell strictly beyond `cell` in the direction `side`.
const rayFrom = (cell, side) => graph.ray(cell, ...STEP[side]).slice(1);

// Each orthogonal edge once, as (a, b) with `side` the direction a -> b.
const edges = gridCells.flatMap(cell => ['D', 'R'].flatMap(side => {
  const other = graph.step(cell, ...STEP[side]);
  return other ? [{ a: cell, b: other, side }] : [];
}));

// A code is available only if every side it uses leads to an in-grid cell.
// One Replicate per missing side, each stamped over that whole border line
// (row 1 lacks U, row ROWS lacks D, column 1 lacks L, column COLS lacks R) --
// including its two corners. Givens intersect, so a corner simply collects
// two of these (e.g. top-left gets both the row-1 and column-1 restriction)
// and ends up with the narrower two-sides-missing domain with no separate
// case needed. An interior cell's true domain is every code, matching the
// Shape's own range, so it needs no
// Given at all. Every excluded cell is added to each line's targets too --
// harmless since its own OFF-only Given (below) always wins the
// intersection, and it keeps each replicated domain from silently leaving
// an excluded border/off-line cell out of its stamped group. Templated at
// the grid's own first cell (graph.makeReplicate's fixed origin), which a
// single-cell Given needs no relative offset from.
const borderLine = {
  U: graph.row(1), D: graph.row(ROWS), L: graph.column(1), R: graph.column(COLS),
};
const codeDomains = SIDES.map(missingSide => {
  const domain = ALL_CODES.filter(code => !usesSide(code, missingSide));
  const cells = [...new Set([...borderLine[missingSide], ...excludedCells])];
  return graph.makeReplicate(new Given(gridCells[0], ...domain), cells);
});

// Excluded cells are never blackened and never on the loop, so they use no
// edge at all.
const excludedPins = excludedCells.map(cell => new Given(cell, OFF));

// Edge agreement across the shared border of a cell and its neighbour on
// `side`: a's exit that way is b's entry back, and a's entry that way is b's
// exit back. Applied to every edge, this orients each used edge consistently.
const agreementKey = side => Pair.fnToKey(
  (codeA, codeB) => exitsTo(codeA, side) === entersFrom(codeB, OPPOSITE[side])
    && entersFrom(codeA, side) === exitsTo(codeB, OPPOSITE[side]),
  geometry);
const agreement = [
  graph.makeReplicate(
    new Pair(agreementKey('R'), 'edge-h', 'R1C1', 'R1C2'),
    gridCells.filter(cell => graph.step(cell, 0, 1))),
  graph.makeReplicate(
    new Pair(agreementKey('D'), 'edge-v', 'R1C1', makeCellId(2, 1)),
    gridCells.filter(cell => graph.step(cell, 1, 0))),
];

// No two blackened cells are orthogonally adjacent. A blackened cell is a
// non-excluded cell the loop misses, so this bites only on pairs where
// neither cell is excluded: an excluded neighbour is OFF too but is not
// blackened.
const notBothBlackKey = Pair.fnToKey(
  (codeA, codeB) => !(codeA === OFF && codeB === OFF), geometry);
const blackAnchors = side => edges
  .filter(edge => edge.side === side && !excludedSet.has(edge.a) && !excludedSet.has(edge.b))
  .map(edge => edge.a);
const blackAdjacency = [
  graph.makeReplicate(
    new Pair(notBothBlackKey, 'black-h', 'R1C1', 'R1C2'),
    blackAnchors('R')),
  graph.makeReplicate(
    new Pair(notBothBlackKey, 'black-v', 'R1C1', makeCellId(2, 1)),
    blackAnchors('D')),
];

// Counter values run POS0, POS0+1, ... POS0+mod-1 and wrap.
const nextPos = (value, mod) => POS0 + ((value - POS0 + 1) % mod);

// Reads a cell's shape code, then its counter and its `side` neighbour's
// counter. If the loop leaves the first cell towards the second, the second
// counter is one further on, and vice versa; an unused edge says nothing.
// `intoBSeam` / `intoASeam` mark an edge whose target is the seam cell, the
// one edge exempted so the loop through the seam can close.
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

const counterPair = ({ a, b, side }, seam) => [
  new NFA(counterSpec(side, MOD_A, b === seam, a === seam), 'loop-order',
    a, posA.at(a), posA.at(b)),
  new NFA(counterSpec(side, MOD_B, b === seam, a === seam), 'loop-order',
    a, posB.at(a), posB.at(b)),
];

// The two seam candidates, in reading order. R1C1 is excluded so the loop
// misses it, and R1C2 and R1C3 are adjacent so at most one of them is
// blackened.
const SEAM_CANDIDATES = ['R1C2', 'R1C3'];
const seamTouching = new Set(SEAM_CANDIDATES);
const isSeamEdge = ({ a, b }) => seamTouching.has(a) || seamTouching.has(b);

// Only the edges touching a seam candidate depend on which branch holds, so
// the rest of the counter constraints are shared.
const counters = edges.filter(edge => !isSeamEdge(edge))
  .flatMap(edge => counterPair(edge, null));
const seamEdges = edges.filter(isSeamEdge);

// One branch per seam candidate. Earlier candidates are blackened in the
// later branches, so the branches are mutually exclusive and cover every
// case. The seam cell is in row 1 with an off-loop cell to its left, so it
// uses exactly its down and right edges; entering from below rather than
// from the right is the pin that removes the direction-of-travel symmetry.
const seamBranches = SEAM_CANDIDATES.map((seam, index) => new And([
  ...SEAM_CANDIDATES.slice(0, index).map(earlier => new Given(earlier, OFF)),
  new Given(seam, codeFor('D', 'R')),
  new Given(posA.at(seam), POS0),
  new Given(posB.at(seam), POS0),
  ...seamEdges.flatMap(edge => counterPair(edge, seam)),
]));

// A cell is numbered exactly when it is on the loop, so the counters carry
// no choice of their own on cells the loop misses.
const numberedKey = Pair.fnToKey(
  (code, pos) => isOnLoop(code) === (pos !== OFF), geometry);
const numbered = gridCells.flatMap(cell => [
  new Pair(numberedKey, 'loop-cell', cell, posA.at(cell)),
  new Pair(numberedKey, 'loop-cell', cell, posB.at(cell)),
]);

// Scans a ray of shape codes and accepts when exactly `target` of them are
// OFF (blackened -- excluded cells are dropped from the ray before it is
// passed in, so within the scan OFF can only mean blackened).
const blackCountSpec = target => cached('black-count-' + target, () => NFA.encodeSpec({
  startState: { count: 0 },
  transition: ({ count }, value) => {
    const next = count + (value === OFF ? 1 : 0);
    return next > target ? undefined : { count: next };
  },
  accept: ({ count }) => count === target,
}, geometry));

const arrows = arrowClues.map(({ cell, side, target }) => {
  const ray = rayFrom(cell, side).filter(c => !excludedSet.has(c));
  return new NFA(blackCountSpec(target), 'arrow-count', ...ray);
});

// Every cell's domain is OFF plus the mod-N+1 counter positions.
const domains = [
  posA.makeReplicate(new Given(posA.at(gridCells[0]),
    ...Array.from({ length: MOD_A + 1 }, (_, n) => n + 1))),
  posB.makeReplicate(new Given(posB.at(gridCells[0]),
    ...Array.from({ length: MOD_B + 1 }, (_, n) => n + 1))),
];

return [
  gridShape,
  posA.toVar('loop position mod ' + MOD_A),
  posB.toVar('loop position mod ' + MOD_B),
  ...domains,
  ...codeDomains,
  ...excludedPins,
  ...agreement,
  ...blackAdjacency,
  ...numbered,
  ...counters,
  new Or(seamBranches),
  ...arrows,
];
