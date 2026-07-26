// Title: Old Maid
// Author: ICHTUES
// Video: https://www.youtube.com/watch?v=QHKZJe6-5kg
// Source: https://sudokupad.app/s8eq4xfzrq

// Doublers: 9 hidden cells, one per row/column/box, holding nine different
// digits; a doubler's VALUE is twice its digit, every other cell's VALUE
// equals its digit. A VD Var overlay flag (1 = normal, 2 = doubler) tracks
// this; every rule below that reads "VALUE" scans interleaved digit/flag
// pairs and uses digit * flag as the effective value.
//
// The two diagonals, the purple lines, and the blue lines are all
// VALUE-based (not digit-based) per the rules text, so each needs a custom
// NFA rather than the native Diagonal/Renban/RegionSumLine classes, which
// read digits.

const graph = cellGraph('9x9');
const flags = graph.makeOverlay('VD');
const gridCells = graph.cells();
const flag = cell => flags.at(cell);
const interleave = cells => cells.flatMap(cell => [cell, flag(cell)]);

const flagTargets = flags.at(gridCells);
const flagOrigin = flagTargets[0];

// Exactly one doubler per row/column/box: nine flags of {1,2} summing to 10
// forces eight 1s and one 2.
const placementSums = [
  ...graph.rows().map(row => new Sum(10, ...flags.at(row))),
  ...graph.columns().map(col => new Sum(10, ...flags.at(col))),
  ...graph.boxes().map(box => new Sum(10, ...flags.at(box))),
];

// Each digit 1-9 is doubled at exactly one cell across the whole grid; nine
// doublers over nine digits with this per-digit constraint forces the nine
// doubler digits to be all different.
const doubledDigitSpec = digit => NFA.encodeSpec({
  startState: { phase: 'digit', count: 0 },
  transition: (state, value) => {
    if (state.phase === 'digit') {
      return { phase: 'flag', digit: value, count: state.count };
    }
    if (value !== 1 && value !== 2) return undefined;
    const count = state.count + (state.digit === digit && value === 2 ? 1 : 0);
    if (count > 1) return undefined;
    return { phase: 'digit', count };
  },
  accept: (state) => state.phase === 'digit' && state.count === 1,
}, 9);

// Two cells' effective values differ. Tracking a whole seen-set for a
// 9-cell all-different (as the consecutive-set spec below does for a
// bounded window) blows the compiled-state limit -- there is no window
// bound here, so instead this is applied once per cell pair (36 pairs per
// diagonal), matching the pairwise-comparison idiom.
const distinctPairSpec = NFA.encodeSpec({
  startState: { phase: 0 },
  transition: (state, value) => {
    switch (state.phase) {
      case 0: return { phase: 1, da: value };
      case 1:
        if (value !== 1 && value !== 2) return undefined;
        return { phase: 2, effA: state.da * value };
      case 2: return { phase: 3, effA: state.effA, db: value };
      case 3: {
        if (value !== 1 && value !== 2) return undefined;
        const effB = state.db * value;
        return (effB === state.effA) ? undefined : { phase: 'ok' };
      }
      case 'ok': return { phase: 'ok' };
    }
  },
  accept: (state) => state.phase === 'ok',
}, 9);

const allPairs = (cells) => {
  const pairs = [];
  for (let i = 0; i < cells.length; i++) {
    for (let j = i + 1; j < cells.length; j++) pairs.push([cells[i], cells[j]]);
  }
  return pairs;
};

// A fixed-size cell set's effective values span a range of exactly
// length - 1 (max - min). Combined with `distinctPairSpec` on every pair
// (below), this is equivalent to "non-repeating consecutive set, any
// order" -- length pairwise-distinct values confined to a span of length
// consecutive integers must occupy every one of them, by pigeonhole. This
// tracks only the running (min, max), not the full seen-set (which blew
// the compiled-state limit for the 7- and 8-cell purple lines: too many
// reachable subsets of an 18-value domain). No position/count field is
// needed: `new NFA(spec, label, ...cells)` always feeds exactly this many
// cells, so `accept` only ever runs after all of them are consumed -- the
// purple lines.
const rangeSpec = (length) => NFA.encodeSpec({
  startState: { phase: 'digit', min: null, max: null },
  transition: (state, value) => {
    if (state.phase === 'digit') {
      return { phase: 'flag', min: state.min, max: state.max, digit: value };
    }
    if (value !== 1 && value !== 2) return undefined;
    const effective = state.digit * value;
    const min = state.min === null ? effective : Math.min(state.min, effective);
    const max = state.max === null ? effective : Math.max(state.max, effective);
    // Saturate: once the span exceeds length - 1 it can never come back down.
    if (max - min > length - 1) return undefined;
    return { phase: 'digit', min, max };
  },
  accept: (state) => state.phase === 'digit' && state.max - state.min === length - 1,
  maxDepth: 2 * length,
}, 9);

// A line's box-bordered segments (fixed lengths, drawn path order) all have
// the same effective-value sum -- the blue lines.
//
// Carrying the common sum as a discovered-at-runtime state field (tried
// first) blows the compiled-state limit: every reachable (sum, target,
// remaining) triple is a separate state, and target alone ranges over every
// achievable first-segment sum. Instead, following the coordinate-arrow
// idiom in decode-puzzle's doubler/arrow scripts, `target` is baked into
// the spec as a constant (one compiled NFA per plausible target, tried
// below over every value the first segment could sum to): "if segment 1
// sums to T, every other segment must too; if it doesn't, this T was never
// the puzzle's actual common sum, so the rest of the scan is unconstrained
// (`skip`)." Applying this for every possible T is equivalent to "all
// segments share a sum," since T = segment 1's actual sum is one of the
// cases tried.
const equalSegmentSumForTargetSpec = (segmentLengths, target) => NFA.encodeSpec({
  startState: { phase: 'digit', segIdx: 0, remaining: segmentLengths[0], sum: 0 },
  transition: (state, value) => {
    if (state.phase === 'skip') return { phase: 'skip' };
    if (state.phase === 'digit') {
      return {
        phase: 'flag', segIdx: state.segIdx, remaining: state.remaining, sum: state.sum, digit: value,
      };
    }
    if (value !== 1 && value !== 2) return undefined;
    const effective = state.digit * value;
    const sum = state.sum + effective;
    const remaining = state.remaining - 1;
    if (remaining > 0) {
      // Overshooting the candidate target mid-segment: segment 1 (still
      // establishing whether T applies) makes this T moot -- skip the
      // rest; any later segment (T already committed) can only fail.
      if (sum > target) return state.segIdx === 0 ? { phase: 'skip' } : undefined;
      return { phase: 'digit', segIdx: state.segIdx, remaining, sum };
    }
    if (sum !== target) return state.segIdx === 0 ? { phase: 'skip' } : undefined;
    const segIdx = state.segIdx + 1;
    if (segIdx >= segmentLengths.length) return { phase: 'skip' };
    return { phase: 'digit', segIdx, remaining: segmentLengths[segIdx], sum: 0 };
  },
  accept: (state) => state.phase === 'skip',
  maxDepth: 2 * segmentLengths.reduce((a, b) => a + b, 0),
}, 9);

// Every sum the (fixed-length) first segment could plausibly reach --
// candidate targets for the spec above. Some are unreachable (e.g. no two
// effective values sum to an odd total above 9+9), which only means that
// candidate's NFA is vacuously satisfied for every grid; harmless.
const candidateTargets = (firstSegmentLength) => {
  const targets = [];
  for (let t = firstSegmentLength * 1; t <= firstSegmentLength * 18; t++) targets.push(t);
  return targets;
};

// Diagonals, provenance: geometry helper's sampled cell paths for the two
// grey dashed lines (waypoints run corner-to-corner, so every cell on the
// diagonal is covered).
const oneToNine = Array.from({ length: 9 }, (_, i) => i + 1);
const mainDiagonal = oneToNine.map(n => makeCellId(n, n));
const antiDiagonal = oneToNine.map(n => makeCellId(n, 10 - n));

// Blue lines, provenance: geometry helper's interpolated cell paths for the
// three deepskyblue strokes. `segments` is each line's cell count per box,
// in path order (box borders fall exactly at these breaks).
const blueLines = [
  { cells: ['R2C1', 'R3C1', 'R4C1', 'R5C1', 'R6C1', 'R6C2', 'R6C3', 'R6C4', 'R6C5'], segments: [2, 5, 2] },
  { cells: ['R2C2', 'R3C2', 'R4C2', 'R5C2', 'R5C3', 'R5C4', 'R5C5'], segments: [2, 3, 2] },
  { cells: ['R2C3', 'R3C3', 'R4C3', 'R4C4', 'R4C5'], segments: [2, 1, 2] },
];

// Purple lines, provenance: geometry helper's interpolated cell paths for
// the three mediumorchid strokes.
const purpleLines = [
  ['R2C7', 'R3C7', 'R4C7', 'R4C6', 'R4C5'],
  ['R2C9', 'R3C9', 'R4C8', 'R5C8', 'R5C7', 'R5C6', 'R5C5'],
  ['R3C8', 'R4C9', 'R5C9', 'R6C9', 'R6C8', 'R6C7', 'R6C6', 'R6C5'],
];

return [
  new Shape('9x9'),
  new Given('R9C5', 5),

  flags.toVar('doubler flags'),
  flags.makeReplicate([new Given(flagOrigin, 1, 2)], flagTargets),
  ...placementSums,
  ...Array.from({ length: 9 }, (_, i) =>
    new NFA(doubledDigitSpec(i + 1), `doubled-digit-${i + 1}`, ...interleave(gridCells))),

  ...allPairs(mainDiagonal).map(([a, b]) =>
    new NFA(distinctPairSpec, 'diagonal-values-main-distinct', ...interleave([a, b]))),
  ...allPairs(antiDiagonal).map(([a, b]) =>
    new NFA(distinctPairSpec, 'diagonal-values-anti-distinct', ...interleave([a, b]))),

  ...purpleLines.flatMap((cells, i) => [
    new NFA(rangeSpec(cells.length), `purple-range-${i + 1}`, ...interleave(cells)),
    ...allPairs(cells).map(([a, b]) =>
      new NFA(distinctPairSpec, `purple-distinct-${i + 1}`, ...interleave([a, b]))),
  ]),

  ...blueLines.flatMap(({ cells, segments }, i) =>
    candidateTargets(segments[0]).map(target =>
      new NFA(
        equalSegmentSumForTargetSpec(segments, target),
        `blue-equal-segments-${i + 1}`, ...interleave(cells)))),
];
