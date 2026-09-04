// Title: Dueling Dragons
// Author: IcyFruit
// Video: https://www.youtube.com/watch?v=vMdx3kmNFh4
// Source: https://sudokupad.app/eol0opcd7y

// Rules encoded here, in full:
//  - Digits 1-9 once each in every row, column and cage. No boxes: the rules
//    name row, column and cage only.
//  - The boundary between two orthogonally adjacent cells is shaded exactly
//    when the two digits do NOT sum to a prime number.
//  - The shaded boundaries divide the grid into exactly 2 regions. Two cells
//    are in the same region when some chain of orthogonal steps joins them
//    without ever crossing a shaded boundary; shaded boundaries that do not
//    separate anything are therefore allowed inside a region.
//  - A digit in a cell carrying one or more arrows is the total number of
//    shaded boundaries met by travelling from that cell to the grid edge in
//    each arrow's direction, added over all of that cell's arrows.
//
// This is the same region-division mechanic as `BJJeeqZJmNw` (Clashing
// Chameleons), whose shaded/unshaded test is parity instead of primality; the
// construction below follows that row's, substituting the boundary test.

const shape = new Shape('9x9');
const graph = cellGraph(shape);

const DIRS = { N: [-1, 0], S: [1, 0], W: [0, -1], E: [0, 1] };

// Adjacent digits sum to 3..17 (orthogonal neighbours share a row or column,
// so sudoku forces them distinct). The primes reachable in that range.
const PRIME_SUMS = new Set([3, 5, 7, 11, 13, 17]);
const isPrimeSum = (sum) => PRIME_SUMS.has(sum);

// Every ordered adjacent pair, each unordered pair once.
const EDGES = graph.cells().flatMap(
  cell => [[1, 0], [0, 1]]
    .map(step => graph.step(cell, ...step))
    .filter(other => other !== null)
    .map(other => [cell, other]));

// --- Cages -------------------------------------------------------------
// 5 nine-cell cages, no printed total: distinct digits only. Cell lists
// transcribed from the payload's `cages` array (0-indexed [row, col] + 1).
const CAGES = [
  ['R7C1', 'R7C2', 'R7C3', 'R8C1', 'R8C2', 'R8C3', 'R9C1', 'R9C2', 'R9C3'],
  ['R1C1', 'R1C2', 'R1C3', 'R2C1', 'R2C2', 'R2C3', 'R3C1', 'R3C2', 'R3C3'],
  ['R4C5', 'R4C6', 'R4C7', 'R5C5', 'R5C6', 'R5C7', 'R6C5', 'R6C6', 'R6C7'],
  ['R1C6', 'R1C7', 'R1C8', 'R1C9', 'R2C5', 'R2C6', 'R2C7', 'R2C8', 'R2C9'],
  ['R8C4', 'R8C5', 'R8C6', 'R8C7', 'R9C4', 'R9C5', 'R9C6', 'R9C7', 'R9C8'],
];
const cageRules = CAGES.map(cells => new AllDifferent(...cells));

// --- Region overlays -------------------------------------------------------
// The region rule needs the partition itself, so it is carried on three
// per-cell overlays:
//   L        which of the two regions the cell is in (1 or 2);
//   H, D     the cell's distance from its region's root cell, split into
//            base-9 digits: distance = 9 * (H - 1) + (D - 1), so the two
//            overlays together span 0..80, enough for any region of 81 cells.
// "Distance" counts steps that cross unshaded boundaries only. Requiring an
// exact distance (rather than merely some descending chain) leaves the
// overlays with exactly one value per grid, so the overlays add no freedom of
// their own.
const region = graph.makeOverlay('VL');
const distHigh = graph.makeOverlay('VH');
const distLow = graph.makeOverlay('VD');

const regionDomain = region.makeReplicate(
  new Given(region.at('R1C1'), 1, 2));

// Reads a cell pair as [digitA, digitB, regionA, regionB, lowA, lowB,
// highA, highB]. An unshaded boundary (sum is prime) puts both cells in one
// region and lets their distances differ by at most 1; a shaded boundary
// relates the two cells in no way at all. Step k is the index of the next
// cell to be read. The base-9 comparison is done as a borrow: the low digits
// fix how the high digits must differ (h), then the high digits are checked
// against it.
const edgeSpec = NFA.encodeSpec({
  startState: { k: 0 },
  transition: (s, v) => {
    switch (s.k) {
      case 0: return { k: 1, digitA: v };
      case 1: return { k: 2, shaded: !isPrimeSum(s.digitA + v) };
      case 2: return v > 2 ? undefined : { k: 3, shaded: s.shaded, regionA: v };
      case 3:
        if (v > 2) return undefined;
        if (!s.shaded && v !== s.regionA) return undefined;
        return { k: 4, shaded: s.shaded };
      case 4:
        return s.shaded ? { k: 5, shaded: true } : { k: 5, shaded: false, lowA: v };
      case 5: {
        if (s.shaded) return { k: 6, shaded: true };
        const lowDiff = s.lowA - v;
        // 9 * h + lowDiff must land in -1..1, and lowDiff is in -8..8.
        const h = Math.abs(lowDiff) <= 1 ? 0 : lowDiff === -8 ? 1 : lowDiff === 8 ? -1 : null;
        return h === null ? undefined : { k: 6, shaded: false, h };
      }
      case 6:
        return s.shaded ? { k: 7, shaded: true } : { k: 7, shaded: false, h: s.h, highA: v };
      case 7:
        if (s.shaded) return { k: 8, shaded: true };
        return s.highA - v === s.h ? { k: 8, shaded: false } : undefined;
    }
  },
  accept: (s) => s.k === 8,
  maxDepth: 8,
}, shape);

const edgeRules = EDGES.map(([a, b]) => new NFA(
  edgeSpec, 'boundary',
  a, b, region.at(a), region.at(b),
  distLow.at(a), distLow.at(b), distHigh.at(a), distHigh.at(b)));

// Reads [lowA, lowB, highA, highB] and requires distance(B) = distance(A) - 1,
// with the same base-9 borrow as above.
const parentSpec = NFA.encodeSpec({
  startState: { k: 0 },
  transition: (s, v) => {
    switch (s.k) {
      case 0: return { k: 1, lowA: v };
      case 1: {
        const lowDiff = s.lowA - v;
        // 9 * h + lowDiff must equal 1.
        const h = lowDiff === 1 ? 0 : lowDiff === -8 ? 1 : null;
        return h === null ? undefined : { k: 2, h };
      }
      case 2: return { k: 3, h: s.h, highA: v };
      case 3: return s.highA - v === s.h ? { k: 4 } : undefined;
    }
  },
  accept: (s) => s.k === 4,
  maxDepth: 4,
}, shape);

const unshadedKey = Pair.fnToKey((a, b) => isPrimeSum(a + b), shape);

// Every cell is either its region's root (distance 0) or is one unshaded step
// further from that root than one of its neighbours.
const distanceRules = graph.cells().map(cell => new Or([
  new And([
    new Given(distHigh.at(cell), 1),
    new Given(distLow.at(cell), 1),
  ]),
  ...graph.neighbours(cell).map(other => new And([
    new Pair(unshadedKey, 'unshaded', cell, other),
    new NFA(parentSpec, 'parent',
      distLow.at(cell), distLow.at(other),
      distHigh.at(cell), distHigh.at(other)),
  ])),
]));

// Both regions are used, and each has exactly one root: reading the cells in
// order, a cell is at distance 0 exactly when it is the first cell of its
// region. That also fixes which region is 1 (the one holding R1C1), so the
// overlays carry no relabelling freedom. Reads [L, H, D] per cell; phase is
// which of the three is next.
const rootSpec = NFA.encodeSpec({
  startState: { phase: 0, seen1: false, seen2: false },
  transition: (s, v) => {
    if (s.phase === 0) {
      return v > 2 ? undefined : { ...s, phase: 1, current: v };
    }
    if (s.phase === 1) return { ...s, phase: 2, highIsOne: v === 1 };
    const isRoot = s.highIsOne && v === 1;
    const seen = s.current === 1 ? s.seen1 : s.seen2;
    if (isRoot === seen) return undefined;
    // Region 1 is the one whose root comes first.
    if (isRoot && s.current === 2 && !s.seen1) return undefined;
    return {
      phase: 0,
      seen1: s.seen1 || (isRoot && s.current === 1),
      seen2: s.seen2 || (isRoot && s.current === 2),
    };
  },
  accept: (s) => s.phase === 0 && s.seen1 && s.seen2,
  maxDepth: 243,
}, shape);

const rootRule = new NFA(rootSpec, 'roots', ...graph.cells().flatMap(
  cell => [region.at(cell), distHigh.at(cell), distLow.at(cell)]));

// --- Arrow clues -----------------------------------------------------------
// Short arrowhead stubs drawn inside each clued cell, as compass directions
// (transcribed from the payload's `arrows` waypoints).
const ARROWS = [
  ['R7C1', 'N'], ['R8C1', 'N'],
  ['R4C2', 'SW'],
  ['R7C3', 'SW'],
  ['R3C5', 'NS'],
  ['R6C5', 'E'],
  ['R9C5', 'NEW'],
  ['R9C6', 'W'],
  ['R9C8', 'W'],
];

// The clue cell is the first segment and each ray is its own segment. The
// clue's own digit is the target; a boundary within a ray (including the one
// between the clue cell and its first neighbour) is counted when the two
// digits crossing it do NOT sum to a prime (i.e. the boundary is shaded).
const arrowSpec = (maxDepth) => NFA.encodeSpec({
  startState: { target: null, originDigit: null, prev: null, count: 0 },
  transition: (s, v) => {
    if (v === SEGMENT_BREAK) {
      return s.target === null ? undefined : { ...s, prev: s.originDigit };
    }
    if (s.target === null) {
      return { target: v, originDigit: v, prev: v, count: 0 };
    }
    const shaded = !isPrimeSum(s.prev + v);
    const count = s.count + (shaded ? 1 : 0);
    if (count > s.target) return undefined;
    return { target: s.target, originDigit: s.originDigit, prev: v, count };
  },
  accept: (s) => s.target !== null && s.count === s.target,
  maxDepth,
}, shape, { multiSegment: true });

const arrowClues = ARROWS.map(([cell, dirs]) => {
  const rays = [...dirs].map(d => graph.ray(cell, ...DIRS[d]).slice(1));
  const numCells = 1 + rays.reduce((n, ray) => n + ray.length, 0);
  return new NFA(
    arrowSpec(numCells + rays.length), 'arrows', [cell], ...rays);
});

return [
  shape,
  new NoBoxes(),
  ...cageRules,
  region.toVar('region'),
  distHigh.toVar('dist high'),
  distLow.toVar('dist low'),
  regionDomain,
  ...edgeRules,
  ...distanceRules,
  rootRule,
  ...arrowClues,
];
