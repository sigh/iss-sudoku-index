// Title: Just Do The Moth
// Author: Nahileon
// Video: https://www.youtube.com/watch?v=VlLTYEgG1Eg
// Source: https://app.crackingthecryptic.com/sudoku/DHd3Fg3QTH

// Normal sudoku rules apply. Two closed loops are drawn in the grid; neither
// intersects itself or the other. A loop travels horizontally or vertically
// between cell centres. Each loop lies entirely on one side of the highlighted
// diagonal -- the line through the centres of R9C1, R8C2, ... R1C9 -- and the
// two loops are mirror images of each other in that diagonal. A digit in a grey
// cell (R7C3, R6C4, R5C5, R4C6, all on that diagonal) gives the number of cells
// in its row, equivalently in its column, that are on neither loop. Two digits
// adjacent along either loop differ by at least 5. Nothing is omitted.
//
// Reflection in the diagonal maps R(r)C(c) to R(10-c)C(10-r), so each of the
// nine diagonal cells is its own mirror image: a loop cell there would lie on
// both loops, which the no-intersection rule forbids. The diagonal cells are
// therefore on neither loop, and it splits the board into the 36 cells with
// r + c < 10 and the 36 with r + c > 10, no cell of one being orthogonally
// adjacent to a cell of the other. One loop occupies each side.
//
// The loops live in one Var layer of *directed* shape codes: either OFF, or the
// side the route enters a cell from paired with the side it leaves by. An
// on-loop cell therefore uses exactly two of its four edges and never branches
// or crosses. Edge-agreement Pairs orient each used edge the same way from both
// ends, so the used edges form a disjoint union of directed cycles, and one
// mirror Pair per cell pair makes the two sides reflections of each other.
//
// Two position counters, modulo the coprime MOD_A and MOD_B, cut the cycles on
// the r + c < 10 side down to one. Each advances by one along every used edge
// except an edge running into a cell whose counter reads SEAM, and the seam
// machine below allows exactly one such cell. A cycle avoiding it would have to
// close on itself after L steps with L divisible by both moduli, i.e. by
// lcm(7, 8) = 56 -- impossible for the at most 36 cells such a cycle could
// occupy. The mirror then makes the other side a single cycle too. ISS has no
// single-loop primitive, and ConnectedValues cannot supply this: it sees only
// cell adjacency, and a loop running alongside itself (which these rules allow,
// forbidding only intersection) is invisible to a neighbour count.
//
// The alphabet is widened to 13 to hold the shape codes; the 81 grid cells are
// pinned back to 1-9.

const NV = 13;
const MOD_A = 7, MOD_B = 8;  // coprime; lcm 56 > the 36 cells on one side
const OFF = 1;               // shape code, and counter value, of a cell no loop uses
// Counter values: OFF, then SEAM for the seam cell, then POS + 0 ... POS + mod-1
// for every other cell on the loop. The seam is position 0 and carries its own
// value so that a loop longer than the modulus, which wraps back through
// position 0, still has exactly one cell reading SEAM.
const SEAM = 2;
const POS = 3;

const SIDES = ['U', 'D', 'L', 'R'];
const STEP = { U: [-1, 0], D: [1, 0], L: [0, -1], R: [0, 1] };
const OPPOSITE = { U: 'D', D: 'U', L: 'R', R: 'L' };
// Reflecting in the anti-diagonal sends the cell above a cell to the cell right
// of its image, and the cell left of it to the cell below its image.
const MIRROR_SIDE = { U: 'R', R: 'U', D: 'L', L: 'D' };

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
const mirrorCode = code => isOnLoop(code)
  ? codeFor(MIRROR_SIDE[CODES[code].entry], MIRROR_SIDE[CODES[code].exit])
  : OFF;

const gridShape = new Shape('9x9', NV);
const graph = cellGraph(gridShape);
const geometry = graph.gridGeometry();
const gridCells = graph.cells();
const loop = graph.makeOverlay('VS');
const posA = graph.makeOverlay('VA');
const posB = graph.makeOverlay('VB');

// The highlighted diagonal runs through the centres of the cells with
// r + c === 10; `sideOf` is negative above it, positive below it.
const sideOf = cell => { const { row, col } = parseCellId(cell); return row + col - 10; };
const mirrorOf = cell => {
  const { row, col } = parseCellId(cell);
  return makeCellId(10 - col, 10 - row);
};
const upperCells = gridCells.filter(cell => sideOf(cell) < 0);

// The five givens.
const givens = [
  new Given('R1C4', 5),
  new Given('R5C9', 6),
  new Given('R6C1', 6),
  new Given('R6C4', 3),
  new Given('R9C5', 5),
];

// The four grey cells, all on the diagonal, keyed to the row their digit counts.
const greyCells = ['R7C3', 'R6C4', 'R5C5', 'R4C6'];

// --- Shape domains. A code is available only if every side it uses leads to an
// in-grid cell off the diagonal; a diagonal cell itself takes only OFF. This is
// where "no loop cell on the diagonal" and "no loop step across it" are stated.
const availableCodes = cell => sideOf(cell) === 0 ? [OFF]
  : ALL_CODES.filter(code => SIDES.every(side => {
    if (!usesSide(code, side)) return true;
    const other = graph.step(cell, ...STEP[side]);
    return other !== null && sideOf(other) !== 0;
  }));
const codeDomains = gridCells.map(
  cell => new Given(loop.at(cell), ...availableCodes(cell)));

// --- Edge agreement across the shared border of a cell and its neighbour on
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

// --- Mirror symmetry: the code at a cell's reflection is its own code with
// every side reflected, which is what makes the two loops mirror images.
const mirrorKey = Pair.fnToKey(
  (code, image) => image === mirrorCode(code), geometry);
const mirror = upperCells.map(cell => new Pair(
  mirrorKey, 'mirror', loop.at(cell), loop.at(mirrorOf(cell))));

// --- Position counters, over the r + c < 10 side only; the mirror carries the
// result to the other side.
const nextPos = (value, mod) =>
  POS + (value === SEAM ? 1 : (value - POS + 1) % mod);
const counterValues = mod =>
  [OFF, SEAM, ...Array.from({ length: mod }, (_, n) => POS + n)];

const cache = new Map();
const cached = (key, build) => {
  if (!cache.has(key)) cache.set(key, build());
  return cache.get(key);
};

// Reads a cell's shape code, then its counter and its `side` neighbour's
// counter. If the loop leaves the first cell towards the second the second
// counter is one further on, and vice versa, unless the target cell is the seam;
// an unused edge says nothing.
const counterSpec = (side, mod) => cached(['cnt', side, mod].join('|'), () =>
  NFA.encodeSpec({
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
        return value === SEAM || value === nextPos(state.a, mod)
          ? { done: true } : undefined;
      }
      return state.a === SEAM || state.a === nextPos(value, mod)
        ? { done: true } : undefined;
    },
    accept: state => state.done === true,
  }, geometry));

const upperEdges = upperCells.flatMap(cell => ['D', 'R'].flatMap(side => {
  const other = graph.step(cell, ...STEP[side]);
  return other !== null && sideOf(other) < 0 ? [{ a: cell, b: other, side }] : [];
}));
const counters = upperEdges.flatMap(({ a, b, side }) => [
  new NFA(counterSpec(side, MOD_A), 'loop-order', loop.at(a), posA.at(a), posA.at(b)),
  new NFA(counterSpec(side, MOD_B), 'loop-order', loop.at(a), posB.at(a), posB.at(b)),
]);

// A cell of that side is numbered exactly when it is on the loop, so the
// counters carry no choice of their own on cells the loop misses.
const numberedKey = Pair.fnToKey(
  (code, pos) => isOnLoop(code) === (pos !== OFF), geometry);
const numbered = upperCells.flatMap(cell => [
  new Pair(numberedKey, 'loop-cell', loop.at(cell), posA.at(cell)),
  new Pair(numberedKey, 'loop-cell', loop.at(cell), posB.at(cell)),
]);
// The counters are defined only on that side; the rest of both layers is fixed.
const counterPins = gridCells.filter(cell => sideOf(cell) >= 0).flatMap(cell => [
  new Given(posA.at(cell), OFF),
  new Given(posB.at(cell), OFF),
]);

// --- The seam. Scanning the r + c < 10 side in reading order as
// (code, counter A, counter B) triples: the first cell found on the loop is the
// seam, carrying SEAM in both counters, and no other cell carries SEAM. Both
// of its earlier orthogonal neighbours (above and to the left) are off the loop,
// so it uses its down and right edges; pinning which of the two is the entry
// picks one of the two directions the loop can be traversed in. Requiring a
// first on-loop cell to exist is the rule that a loop is drawn at all.
const SEAM_CODE = codeFor('D', 'R');
const seamSpec = NFA.encodeSpec({
  startState: { k: 0, sawOn: false, isSeam: false },
  transition: (state, value) => {
    if (state.k === 0) {
      const on = isOnLoop(value);
      const isSeam = on && !state.sawOn;
      if (isSeam && value !== SEAM_CODE) return undefined;
      return { k: 1, sawOn: state.sawOn || on, isSeam };
    }
    if ((value === SEAM) !== state.isSeam) return undefined;
    if (state.k === 1) return { k: 2, sawOn: state.sawOn, isSeam: state.isSeam };
    return { k: 0, sawOn: state.sawOn, isSeam: false };
  },
  accept: state => state.k === 0 && state.sawOn === true,
}, geometry);
const seam = [new NFA(seamSpec, 'loop-seam', ...upperCells.flatMap(
  cell => [loop.at(cell), posA.at(cell), posB.at(cell)]))];

// --- Grey cells: the digit counts the cells of its row that are on no loop.
// The reflection carries row r onto column 10 - r, which is the grey cell's own
// column, so the mirror constraint above makes the column count agree.
const greySpec = NFA.encodeSpec({
  startState: { target: null, count: 0 },
  transition: ({ target, count }, value) => {
    if (target === null) return { target: value, count: 0 };
    const next = count + (value === OFF ? 1 : 0);
    return next > target ? undefined : { target, count: next };
  },
  accept: ({ target, count }) => target !== null && count === target,
}, geometry);
const grey = greyCells.map(cell => new NFA(
  greySpec, 'grey-count', cell, ...loop.at(graph.row(cell))));

// --- Loop differences: two cells joined by a loop edge differ by at least 5.
// Reads [shape, digitA, digitB]; the shape says whether the loop uses the edge
// from A towards B, and edge agreement guarantees B agrees.
const diffSpec = side => cached(['diff', side].join('|'), () => NFA.encodeSpec({
  startState: { k: 0 },
  transition: (state, value) => {
    if (state.k === 0) return { k: 1, joined: usesSide(value, side) };
    if (state.k === 1) return { k: 2, joined: state.joined, a: value };
    if (state.k !== 2) return undefined;
    if (!state.joined) return { done: true };
    return Math.abs(state.a - value) >= 5 ? { done: true } : undefined;
  },
  accept: state => state.done === true,
}, geometry));
const differences = gridCells.flatMap(cell => ['D', 'R'].flatMap(side => {
  const other = graph.step(cell, ...STEP[side]);
  return other === null ? [] : [new NFA(
    diffSpec(side), side === 'R' ? 'loop-diff-h' : 'loop-diff-v',
    loop.at(cell), cell, other)];
}));

const domains = [
  graph.makeReplicate(new Given(gridCells[0], 1, 2, 3, 4, 5, 6, 7, 8, 9)),
  posA.makeReplicate(new Given(posA.at(gridCells[0]), ...counterValues(MOD_A))),
  posB.makeReplicate(new Given(posB.at(gridCells[0]), ...counterValues(MOD_B))),
];

return [
  gridShape,
  loop.toVar('loop shape'),
  posA.toVar('loop position mod ' + MOD_A),
  posB.toVar('loop position mod ' + MOD_B),
  ...domains,
  ...givens,
  ...codeDomains,
  ...counterPins,
  ...agreement,
  ...mirror,
  ...numbered,
  ...counters,
  ...seam,
  ...grey,
  ...differences,
];
