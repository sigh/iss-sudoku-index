// Title: Balancing act
// Author: AnalyticalNinja & palpot
// Video: https://www.youtube.com/watch?v=b3TPOOy3GWc
// Source: https://sudokupad.app/atfgvx1pgc

// Yin-Yang: the native YinYang constraint over a shade overlay (YY,
// SHADED=1 / UNSHADED=2).
//
// Every rosybrown line is handled by three independent rule groups below,
// each a direct consequence of "along a line, shading changes divide it into
// maximal same-shade segments":
//   - equalSegmentSums: every segment on a line sums to the same total as
//     every other segment on that line (shaded or unshaded alike).
//   - shadedWhispers: consecutive line cells that are both shaded differ by
//     at least 5.
//   - unshadedTriSet: any 2 or 3 consecutive line cells that are all
//     unshaded take digits from different classes of {1,4,7}/{2,5,8}/{3,6,9}
//     (checked pairwise at distance 1 and distance 2, which is equivalent to
//     the stated "any string of 3 or fewer digits" once combined).
//
// The segment boundaries are not known in advance -- they are wherever the
// (solver-discovered) shading changes -- so equalSegmentSums enumerates every
// possible boundary pattern for a line as one Or-branch each: a branch pins
// each gap as same-shade or different-shade with a Pair guard, and only adds
// the EqualSum check for that branch's resulting segments. Guards make every
// branch but the one matching the real shading false, so the Or reduces
// exactly to "the true segmentation's segments have equal sums".

const graph = cellGraph('9x9');
const geometry = graph.gridGeometry();
const shade = graph.makeOverlay('YY');

const SHADED = 1;
const UNSHADED = 2;

// Lines, transcribed from the drawn rosybrown polylines' interpolated cell
// paths. #6 is a closed loop (its cyclic wrap edge is R3C2-R2C2).
const lines = [
  { cells: ['R7C9', 'R7C8', 'R7C7', 'R7C6', 'R7C5', 'R7C4', 'R7C3', 'R7C2', 'R7C1'], closed: false },
  { cells: ['R9C7', 'R8C7', 'R8C8', 'R9C8'], closed: false },
  { cells: ['R5C8', 'R5C9', 'R4C9', 'R3C9', 'R2C8', 'R3C7', 'R2C6', 'R1C5', 'R2C4'], closed: false },
  { cells: ['R6C6', 'R5C5', 'R6C4', 'R5C3', 'R4C2'], closed: false },
  { cells: ['R4C7', 'R5C7', 'R5C6', 'R4C6'], closed: false },
  { cells: ['R8C5', 'R9C4', 'R9C3'], closed: false },
  { cells: ['R2C2', 'R2C3', 'R3C3', 'R3C2'], closed: true },
];

// Shade Vars use the grid's 1-9 value range (restricted to SHADED/UNSHADED by
// YinYang), so a Pair key checking a digit-class relation must be built
// for all 9 values too.
const digitClassNeqKey = Pair.fnToKey(
  (a, b) => ((a - 1) % 3) !== ((b - 1) % 3), geometry.numValues);

// Consecutive cell pairs/triples along a line, wrapping for closed loops.
function cyclicPairs(cells, closed) {
  const n = cells.length;
  const gapCount = closed ? n : n - 1;
  return Array.from(
    { length: gapCount }, (_, g) => [cells[g], cells[(g + 1) % n]]);
}
function cyclicTriples(cells, closed) {
  const n = cells.length;
  if (n < 3) return [];
  const count = closed ? n : n - 2;
  return Array.from(
    { length: count },
    (_, g) => [cells[g], cells[(g + 1) % n], cells[(g + 2) % n]]);
}

const shadedWhispers = [];
const unshadedTriSet = [];
for (const { cells, closed } of lines) {
  for (const [a, b] of cyclicPairs(cells, closed)) {
    shadedWhispers.push(new Or([
      new Given(shade.at(a), UNSHADED),
      new Given(shade.at(b), UNSHADED),
      new Whisper(5, a, b),
    ]));
    unshadedTriSet.push(new Or([
      new Given(shade.at(a), SHADED),
      new Given(shade.at(b), SHADED),
      new Pair(digitClassNeqKey, 'unshaded-tri-set', a, b),
    ]));
  }
  for (const [a, m, b] of cyclicTriples(cells, closed)) {
    unshadedTriSet.push(new Or([
      new Given(shade.at(a), SHADED),
      new Given(shade.at(m), SHADED),
      new Given(shade.at(b), SHADED),
      new Pair(digitClassNeqKey, 'unshaded-tri-set', a, b),
    ]));
  }
}

// Segments induced by a chosen boundary set (gap indices where shade
// changes), matching cyclicPairs' gap -> (cells[g], cells[(g+1)%n]) mapping.
function segmentsForBoundaries(cells, closed, boundarySet) {
  const n = cells.length;
  if (!closed) {
    const segments = [];
    let start = 0;
    for (let g = 0; g < n - 1; g++) {
      if (boundarySet.has(g)) {
        segments.push(cells.slice(start, g + 1));
        start = g + 1;
      }
    }
    segments.push(cells.slice(start));
    return segments;
  }
  if (boundarySet.size === 0) return [cells.slice()];
  const sorted = [...boundarySet].sort((x, y) => x - y);
  const segments = [];
  for (let i = 0; i < sorted.length; i++) {
    const gStart = sorted[i];
    const gEnd = sorted[(i + 1) % sorted.length];
    const idxs = [];
    let idx = (gStart + 1) % n;
    while (true) {
      idxs.push(idx);
      if (idx === gEnd) break;
      idx = (idx + 1) % n;
    }
    segments.push(idxs.map(ix => cells[ix]));
  }
  return segments;
}

function equalSegmentSumConstraint({ cells, closed }) {
  const gapPairs = cyclicPairs(cells, closed);
  const gapCount = gapPairs.length;
  const branches = [];
  for (let mask = 0; mask < (1 << gapCount); mask++) {
    const boundarySet = new Set();
    const guards = [];
    for (let g = 0; g < gapCount; g++) {
      const [a, b] = gapPairs[g];
      const isBoundary = !!(mask & (1 << g));
      if (isBoundary) boundarySet.add(g);
      // Domain is restricted to {SHADED, UNSHADED} by YinYang, so
      // AllDifferent/SameValues over the pair is exactly shade-differs /
      // shade-matches.
      guards.push(isBoundary
        ? new AllDifferent(shade.at(a), shade.at(b))
        : new SameValues(2, shade.at(a), shade.at(b)));
    }
    const segments = segmentsForBoundaries(cells, closed, boundarySet);
    const parts = [...guards];
    if (segments.length >= 2) parts.push(new EqualSum(...segments));
    branches.push(new And(parts));
  }
  return new Or(branches);
}

const equalSegmentSums = lines.map(equalSegmentSumConstraint);

return [
  new Shape('9x9'),
  new YinYang(),
  ...shadedWhispers,
  ...unshadedTriSet,
  ...equalSegmentSums,
];
