// Title: Lupin's Loop 4 - Surrounded
// Author: Rab3aron
// Video: https://www.youtube.com/watch?v=dAqrMGSyI4s
// Source: https://sudokupad.app/0do1zxouyi

// Normal sudoku, no givens. A greater-than symbol points at the smaller digit.
// Two metro lines travel orthogonally from cell to cell, never branching,
// crossing or overlapping (with themselves or with each other), and close into
// two loops. Thick black walls cannot be crossed. One loop lies entirely inside
// the other. Every station lies on a loop, and all the cells of one loop share
// one parity (the two loops may share a parity or not). A digit in a red sensor
// equals the number of cells visited by either loop in the 3x3 box centred on
// that sensor. A digit in a station equals the number of stations holding that
// digit. The mirror cell R4C1 is read at the opposite parity to the digit it
// holds, for the loop-parity rule only. Nothing is omitted.

// The two loops live in one Var layer of *directed* shape codes: either OFF, or
// the side the line enters a cell from paired with the side it leaves by. So an
// on-loop cell uses exactly two of its four edges, no code branches or crosses,
// and a cell belongs to at most one line. Edge-agreement `Pair`s orient each
// used edge the same way from both ends, giving every on-loop cell in-degree 1
// and out-degree 1: the used edges form a disjoint union of directed cycles.
//
// Three further facts are then read off that layer.
//
// * Nesting. Each row is scanned left to right, tracking how many loops enclose
//   the point just above and right of the current cell's centre. That point moves
//   across a loop exactly at a cell using its north edge, so the count changes by
//   one there: up when the line runs upward through that edge, down when it runs
//   downward. Holding the count in 0..2 and requiring it back to 0 at the row end
//   forces both cycles to be traversed in the enclosing direction, and a count of
//   2 means the point is inside both cycles -- which happens exactly when one
//   cycle is nested inside the other.
// * Exactly two cycles. Two position counters, modulo the coprime MOD_A and
//   MOD_B, advance by one along every used edge except an edge running into a
//   *seam*: a cell holding POS0 in both counters. A cycle carrying no seam would
//   have to close on itself after L steps with L divisible by both moduli, i.e.
//   by lcm(9, 10) = 90 -- impossible for the at most 81 cells it could occupy, so
//   every cycle holds a seam. The row scan admits exactly two seams (see below),
//   which bounds the cycles at two, and a point inside two loops needs two of
//   them, so there are exactly two. Reading the seam off both counters at once is
//   what lets it be an ordinary position 0 rather than a value of its own: a
//   cycle short enough to fit the grid cannot wrap both moduli, so no second cell
//   of a cycle reads POS0 twice.
// * Which cycle. A crossing between enclosure counts 0 and 1 is a crossing of the
//   outer cycle and one between 1 and 2 is a crossing of the inner cycle, so the
//   scan can tell the two apart without a membership layer. It requires the seam
//   of each cycle to be that cycle's first crossing cell in reading order, which
//   picks the seam, and with it the counter values, out of the cycle's own cells
//   rather than leaving them free.
//
// ISS has no loop primitive, and `ConnectedValues` cannot supply one here: it
// sees only cell adjacency, and two loops running alongside each other are one
// connected set of cells while sharing no used edge.
//
// The alphabet is widened to 13 to hold the codes and the counters; the 81 grid
// cells are pinned back to 1-9.

const NV = 13;
const MOD_A = 9, MOD_B = 10;  // coprime; lcm 90 > 81 cells
const OFF = 1;                // shape code, and counter value, of a cell no line visits
const POS0 = 2;               // counter value of a seam cell (position 0)

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

// The six cells drawn with a red sensor.
const sensors = ['R3C6', 'R3C8', 'R4C2', 'R4C5', 'R6C5', 'R7C3'];

// The nine cells drawn with a station.
const stations = [
  'R1C7', 'R2C3', 'R4C9', 'R5C8', 'R6C6', 'R7C5', 'R8C2', 'R8C7', 'R9C8',
];

// The cell drawn with a mirror.
const MIRROR = 'R4C1';

// The thick black walls, as the cell pairs they separate.
const blockedEdges = [
  ['R3C1', 'R3C2'],
  ['R5C1', 'R6C1'],
  ['R7C2', 'R7C3'],
  ['R8C4', 'R9C4'],
  ['R8C7', 'R8C8'],
];

// The greater-than symbols, as [larger, smaller]: each symbol is drawn on the
// border between the two cells and points at the smaller one.
const inequalities = [
  ['R1C4', 'R1C5'],
  ['R6C3', 'R6C4'],
  ['R2C9', 'R2C8'],
];

const edgeKey = (a, b) => [a, b].sort().join('|');
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

// A code is available only if every side it uses leads to an in-grid cell across
// a border no wall blocks.
const availableCodes = cell => ALL_CODES.filter(code => SIDES.every(side => {
  if (!usesSide(code, side)) return true;
  const other = graph.step(cell, ...STEP[side]);
  return other !== null && !blockedKeys.has(edgeKey(cell, other));
}));

const codeDomains = gridCells.map(
  cell => new Given(loop.at(cell), ...availableCodes(cell)));

const stationsOnLoop = stations.map(
  cell => new Given(loop.at(cell), ...ON_LOOP_CODES));

const greaterThans = inequalities.map(
  ([larger, smaller]) => new GreaterThan(larger, smaller));

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

// A cell is numbered exactly when a line visits it, so the counters carry no
// choice of their own on the cells the lines miss.
const numberedKey = Pair.fnToKey(
  (code, pos) => isOnLoop(code) === (pos !== OFF), geometry);
const numbered = gridCells.flatMap(cell => [
  new Pair(numberedKey, 'loop-cell', loop.at(cell), posA.at(cell)),
  new Pair(numberedKey, 'loop-cell', loop.at(cell), posB.at(cell)),
]);

// Counter values run POS0, POS0+1, ... POS0+mod-1 and wrap.
const nextPos = (value, mod) => POS0 + ((value - POS0 + 1) % mod);

// Reads a cell's shape code, then the *other* counter layer at both ends of the
// edge, then this layer at both ends. If a line leaves the first cell towards the
// second, the second counter is one further on, and vice versa; an unused edge
// says nothing. The exception is an edge running into a seam -- a cell holding
// POS0 in both layers -- which is where a cycle's numbering starts and so is
// exempt; the other layer is read here only to recognise one.
const counterSpec = (side, mod) => cached(['cnt', side, mod].join('|'), () =>
  NFA.encodeSpec({
    startState: { phase: 'code' },
    transition: (state, value) => {
      switch (state.phase) {
        case 'code': {
          const forward = exitsTo(value, side);
          const backward = entersFrom(value, side);
          if (!forward && !backward) return { phase: 'skip', left: 4 };
          return { phase: 'otherA', forward };
        }
        case 'otherA':
          return {
            phase: 'otherB', forward: state.forward, seamA: value === POS0,
          };
        case 'otherB':
          return {
            phase: 'thisA', forward: state.forward, seamA: state.seamA,
            seamB: value === POS0,
          };
        case 'thisA':
          return {
            phase: 'thisB', forward: state.forward, seamA: state.seamA,
            seamB: state.seamB, a: value,
          };
        case 'thisB': {
          const { forward, seamA, seamB, a } = state;
          if (a === OFF || value === OFF) return undefined;
          const exempt = forward
            ? seamB && value === POS0
            : seamA && a === POS0;
          if (exempt) return { phase: 'done' };
          const ok = forward
            ? value === nextPos(a, mod)
            : a === nextPos(value, mod);
          return ok ? { phase: 'done' } : undefined;
        }
        case 'skip':
          return state.left > 1
            ? { phase: 'skip', left: state.left - 1 }
            : { phase: 'done' };
        default:
          return undefined;
      }
    },
    accept: state => state.phase === 'done',
  }, geometry));

const counters = edges.flatMap(({ a, b, side }) => [
  new NFA(counterSpec(side, MOD_A), 'loop-order',
    loop.at(a), posB.at(a), posB.at(b), posA.at(a), posA.at(b)),
  new NFA(counterSpec(side, MOD_B), 'loop-order',
    loop.at(a), posA.at(a), posA.at(b), posB.at(a), posB.at(b)),
]);

// One segment per grid row, each reading (code, counter A, counter B) per cell
// left to right. `depth` is how many loops enclose the point just above and
// right of the cell centre reached so far: it starts and ends at 0 outside the
// grid, and changes only where a line crosses the row's scan height, i.e. at a
// cell using its north edge. Exiting upwards through that edge is the direction
// that puts the enclosed side on the left, so it counts +1.
//
// `crossing` names which loop was crossed at this cell: the outer loop separates
// depths 0 and 1, the inner loop depths 1 and 2, and -1 marks a cell that crosses
// nothing. `seenOuter` / `seenInner` require each loop's first crossing cell in
// reading order to be its seam, and every later crossing cell of that loop not to
// be one -- so the two loops have one seam each. Requiring both to have been seen
// is the nesting rule: an inner crossing exists only when some point of the grid
// lies inside both loops.
const atCell = (depth, seenOuter, seenInner) => (
  { phase: 'code', depth, seenOuter, seenInner });
const nestingSpec = NFA.encodeSpec({
  startState: atCell(0, false, false),
  transition: (state, value) => {
    if (value === SEGMENT_BREAK) {
      return state.phase === 'code' && state.depth === 0 ? state : undefined;
    }
    switch (state.phase) {
      case 'code': {
        const step = exitsTo(value, 'U') ? 1 : (entersFrom(value, 'U') ? -1 : 0);
        const depth = state.depth + step;
        if (depth < 0 || depth > 2) return undefined;
        return {
          phase: 'posA', depth,
          crossing: step === 0 ? -1 : Math.min(state.depth, depth),
          seenOuter: state.seenOuter, seenInner: state.seenInner,
        };
      }
      case 'posA':
        return {
          phase: 'posB', depth: state.depth, crossing: state.crossing,
          seenOuter: state.seenOuter, seenInner: state.seenInner,
          atStart: value === POS0,
        };
      case 'posB': {
        const { depth, crossing, seenOuter, seenInner } = state;
        const isSeam = state.atStart && value === POS0;
        const seen = crossing === 0 ? seenOuter
          : crossing === 1 ? seenInner : true;
        if (seen) return isSeam ? undefined : atCell(depth, seenOuter, seenInner);
        if (!isSeam) return undefined;
        return atCell(depth, seenOuter || crossing === 0,
          seenInner || crossing === 1);
      }
      default:
        return undefined;
    }
  },
  accept: state => state.phase === 'code' && state.depth === 0
    && state.seenOuter && state.seenInner,
}, geometry, { multiSegment: true });

const nesting = [new NFA(nestingSpec, 'two-nested-loops',
  ...graph.rows().map(row => row.flatMap(
    cell => [loop.at(cell), posA.at(cell), posB.at(cell)])))];

// Reads a cell's shape code, then that cell's digit and its `side` neighbour's
// digit; two cells joined by a line hold digits of the same parity. `flip` marks
// an edge with the mirror cell at one end, whose parity is read inverted.
const paritySpec = (side, flip) => cached(['par', side, flip].join('|'), () =>
  NFA.encodeSpec({
    startState: { phase: 'code' },
    transition: (state, value) => {
      switch (state.phase) {
        case 'code':
          return { phase: 'digitA', joined: usesSide(value, side) };
        case 'digitA':
          return { phase: 'digitB', joined: state.joined, a: value % 2 };
        case 'digitB': {
          if (!state.joined) return { phase: 'done' };
          const same = state.a === value % 2;
          return same !== flip ? { phase: 'done' } : undefined;
        }
        default:
          return undefined;
      }
    },
    accept: state => state.phase === 'done',
  }, geometry));

const loopParity = edges.map(({ a, b, side }) => new NFA(
  paritySpec(side, (a === MIRROR) !== (b === MIRROR)),
  side === 'R' ? 'loop-parity-h' : 'loop-parity-v', loop.at(a), a, b));

// Reads the sensor's digit, then the shape codes of the 3x3 block centred on it,
// counting the cells a line visits.
const sensorSpec = NFA.encodeSpec({
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
const sensorCounts = sensors.map(cell => new NFA(
  sensorSpec, 'sensor', cell, ...loop.at(centredBlock(cell))));

const stationCounts = [new CountingCircles(...stations)];

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
  ...stationsOnLoop,
  ...greaterThans,
  ...agreement,
  ...numbered,
  ...counters,
  ...nesting,
  ...loopParity,
  ...sensorCounts,
  ...stationCounts,
];
