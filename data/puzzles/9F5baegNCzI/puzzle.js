// Title: Never
// Author: Wessel Strijkstra
// Video: https://www.youtube.com/watch?v=9F5baegNCzI
// Source: https://app.crackingthecryptic.com/sudoku/JrDMHhgM8Q

// Normal sudoku rules apply; there are no given digits. Shade some cells grey so
// that no two grey cells are orthogonally adjacent, and draw a single
// non-intersecting loop through the centres of all the remaining cells, i.e.
// every cell that is neither blue nor grey. Blue cells cannot be shaded grey.
// A digit in a blue cell counts the grey cells in a straight line in the
// direction its arrow points; four arrows are drawn and the other six blue cells'
// arrow directions are the solver's to find. A clue outside a row gives the sum
// of the digits on the first horizontal loop segment passing through that row,
// counting from the clue's side and including the cells in which the segment
// turns; a clue outside a column does the same for the first vertical segment.
// Nothing is omitted.

// The loop lives in one Var layer of *directed* shape codes: either OFF, or the
// side the route enters a cell from paired with the side it leaves by. Blue cells
// are pinned OFF, so on a non-blue cell OFF means "grey" and any other code means
// "on the loop", which is exactly the three-way blue/grey/loop split the rules
// describe. Edge-agreement Pairs orient each used edge the same way from both
// ends, giving every on-loop cell in-degree 1 and out-degree 1: the used edges
// form a disjoint union of directed cycles.
//
// Two position counters, modulo the coprime MOD_A and MOD_B, cut that down to a
// single cycle. Each advances by one along every used edge except the single edge
// running *into* the seam cell, so a cycle avoiding the seam would have to close
// after L steps with L divisible by both moduli, i.e. by lcm(8, 9) = 72; at most
// 70 cells are available to such a cycle (81 cells less the 10 blue cells less
// the seam), so only the cycle through the seam can close.
//
// The seam is the first on-loop cell in reading order. R1C1 is blue and R1C2,
// R1C3 are orthogonally adjacent so cannot both be grey, which leaves exactly two
// candidates; the encoding disjoins over them. In either branch the seam cell is
// in row 1 and its left neighbour is off the loop, so it must use exactly its
// down and right edges, and pinning which of those two is the entry removes only
// the arbitrary direction of travel.
//
// The alphabet is widened to 13 to hold the shape codes and the counter values;
// the 81 grid cells are pinned back to 1-9.

const NV = 13;
const MOD_A = 8, MOD_B = 9;  // coprime; lcm 72 > the 70 cells a seam-free cycle could use
const OFF = 1;               // shape code, and counter value, of a cell the loop misses
const POS0 = 2;              // counter value of the seam cell (position 0)

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

// The ten blue cells, from the blue 1x1 squares drawn under the grid.
const blueCells = [
  'R1C1', 'R1C9', 'R2C5', 'R4C3', 'R4C9',
  'R6C1', 'R6C7', 'R8C5', 'R9C1', 'R9C9',
];

// The four drawn arrows, as the blue cell they sit in and the side they point
// towards. The remaining six blue cells are left for the solver.
const drawnArrows = { R2C5: 'D', R4C3: 'U', R6C7: 'D', R8C5: 'U' };

// The thirteen outside clues, as the row or column they address, the side of the
// grid the number is printed on, and the sum. Scanning starts from that side.
const outsideClues = [
  { row: 3, side: 'L', sum: 8 },
  { row: 4, side: 'L', sum: 12 },
  { row: 7, side: 'L', sum: 14 },
  { row: 9, side: 'L', sum: 28 },
  { row: 3, side: 'R', sum: 10 },
  { row: 5, side: 'R', sum: 10 },
  { row: 7, side: 'R', sum: 10 },
  { col: 5, side: 'U', sum: 17 },
  { col: 6, side: 'U', sum: 16 },
  { col: 4, side: 'D', sum: 23 },
  { col: 6, side: 'D', sum: 13 },
  { col: 8, side: 'D', sum: 8 },
  { col: 9, side: 'D', sum: 16 },
];

const blueSet = new Set(blueCells);
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
const codeDomains = gridCells.map(cell => new Given(loop.at(cell),
  ...ALL_CODES.filter(code => SIDES.every(
    side => !usesSide(code, side) || graph.step(cell, ...STEP[side])))));

// Blue cells are neither grey nor on the loop, so they use no edge at all.
const bluePins = blueCells.map(cell => new Given(loop.at(cell), OFF));

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

// No two grey cells are orthogonally adjacent. A grey cell is a non-blue cell the
// loop misses, so this bites only on pairs where neither cell is blue: a blue
// neighbour is OFF too but is not grey.
const notBothGreyKey = Pair.fnToKey(
  (codeA, codeB) => !(codeA === OFF && codeB === OFF), geometry);
const greyAnchors = side => loop.at(edges
  .filter(edge => edge.side === side && !blueSet.has(edge.a) && !blueSet.has(edge.b))
  .map(edge => edge.a));
const greyAdjacency = [
  loop.makeReplicate(
    new Pair(notBothGreyKey, 'grey-h', loop.at('R1C1'), loop.at('R1C2')),
    greyAnchors('R')),
  loop.makeReplicate(
    new Pair(notBothGreyKey, 'grey-v', loop.at('R1C1'), loop.at('R2C1')),
    greyAnchors('D')),
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

const counterPair = ({ a, b, side }, seam) => [
  new NFA(counterSpec(side, MOD_A, b === seam, a === seam), 'loop-order',
    loop.at(a), posA.at(a), posA.at(b)),
  new NFA(counterSpec(side, MOD_B, b === seam, a === seam), 'loop-order',
    loop.at(a), posB.at(a), posB.at(b)),
];

// The two seam candidates, in reading order. R1C1 is blue so the loop misses it,
// and R1C2 and R1C3 are adjacent so at most one of them is grey.
const SEAM_CANDIDATES = ['R1C2', 'R1C3'];
const seamTouching = new Set(SEAM_CANDIDATES);
const isSeamEdge = ({ a, b }) => seamTouching.has(a) || seamTouching.has(b);

// Only the edges touching a seam candidate depend on which branch holds, so the
// rest of the counter constraints are shared.
const counters = edges.filter(edge => !isSeamEdge(edge))
  .flatMap(edge => counterPair(edge, null));
const seamEdges = edges.filter(isSeamEdge);

// One branch per seam candidate. Earlier candidates are grey in the later
// branches, so the branches are mutually exclusive and cover every case. The seam
// cell is in row 1 with an off-loop cell to its left, so it uses exactly its down
// and right edges; entering from below rather than from the right is the pin that
// removes the direction-of-travel symmetry.
const seamBranches = SEAM_CANDIDATES.map((seam, index) => new And([
  ...SEAM_CANDIDATES.slice(0, index).map(
    earlier => new Given(loop.at(earlier), OFF)),
  new Given(loop.at(seam), codeFor('D', 'R')),
  new Given(posA.at(seam), POS0),
  new Given(posB.at(seam), POS0),
  ...seamEdges.flatMap(edge => counterPair(edge, seam)),
]));

// A cell is numbered exactly when it is on the loop, so the counters carry no
// choice of their own on cells the loop misses.
const numberedKey = Pair.fnToKey(
  (code, pos) => isOnLoop(code) === (pos !== OFF), geometry);
const numbered = gridCells.flatMap(cell => [
  new Pair(numberedKey, 'loop-cell', loop.at(cell), posA.at(cell)),
  new Pair(numberedKey, 'loop-cell', loop.at(cell), posB.at(cell)),
]);

// Reads the blue cell's digit, then the shape codes of the cells along one ray.
// Blue cells are dropped from the ray before it is passed in, so within the scan
// OFF means grey and the machine just counts OFF codes down from the digit.
const greyCountSpec = cached('grey-count', () => NFA.encodeSpec({
  startState: { target: null, count: 0 },
  transition: ({ target, count }, value) => {
    if (target === null) return { target: value, count: 0 };
    const next = count + (value === OFF ? 1 : 0);
    return next > target ? undefined : { target, count: next };
  },
  accept: ({ target, count }) => target !== null && count === target,
}, geometry));

const arrowClue = (cell, side) => new NFA(greyCountSpec, 'arrow',
  cell, ...loop.at(rayFrom(cell, side).filter(c => !blueSet.has(c))));

// A blue cell with no drawn arrow still has one, pointing along some line of
// cells inside the grid; the solver picks which.
const arrows = blueCells.map(cell => {
  if (drawnArrows[cell]) return arrowClue(cell, drawnArrows[cell]);
  const options = SIDES.filter(side => rayFrom(cell, side).length > 0);
  return new Or(options.map(side => arrowClue(cell, side)));
});

// Reads [code, digit] for each cell of a row or column in turn, scanning inwards
// from the clue. `dir` is the direction of travel, so a cell's `dir` edge leads
// onwards and its opposite edge leads back towards the clue. Phase `search` skips
// cells the loop does not run through horizontally (for a row clue); the first
// cell that does opens the segment, the run continues through cells linked both
// ways, and the first cell linked only back towards the clue closes it. The
// digits of those cells, turns included, must total `target`.
const segmentSumSpec = (dir, target) => cached(
  ['seg', dir, target].join('|'), () => {
    const back = OPPOSITE[dir];
    return NFA.encodeSpec({
      startState: { k: 'code', phase: 'search', sum: 0 },
      transition: (state, value) => {
        if (state.k === 'code') {
          if (state.phase === 'done') {
            return { k: 'digit', phase: 'done', sum: 0, add: false };
          }
          const onwards = usesSide(value, dir);
          const backwards = usesSide(value, back);
          if (state.phase === 'search') {
            // Reaching a cell linked back towards the clue while still searching
            // is impossible: its neighbour would have opened the segment.
            if (backwards) return undefined;
            if (!onwards) return { k: 'digit', phase: 'search', sum: 0, add: false };
            return { k: 'digit', phase: 'in', sum: 0, add: true, ends: false };
          }
          if (!backwards) return undefined;
          return { k: 'digit', phase: 'in', sum: state.sum, add: true, ends: !onwards };
        }
        if (!state.add) return { k: 'code', phase: state.phase, sum: state.sum };
        const total = state.sum + value;
        if (total > target) return undefined;
        if (!state.ends) return { k: 'code', phase: 'in', sum: total };
        return total === target ? { k: 'code', phase: 'done', sum: 0 } : undefined;
      },
      accept: state => state.k === 'code' && state.phase === 'done',
    }, geometry);
  });

const outside = outsideClues.map(({ row, col, side, sum }) => {
  const dir = OPPOSITE[side];
  const line = row !== undefined ? graph.row(row) : graph.column(col);
  // graph.row/column run left-to-right and top-to-bottom, so a clue on the right
  // or the bottom scans the same line reversed.
  const cells = (side === 'L' || side === 'U') ? line : [...line].reverse();
  return new NFA(segmentSumSpec(dir, sum), 'segment-sum',
    ...cells.flatMap(cell => [loop.at(cell), cell]));
});

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
  ...bluePins,
  ...agreement,
  ...greyAdjacency,
  ...numbered,
  ...counters,
  new Or(seamBranches),
  ...arrows,
  ...outside,
];
