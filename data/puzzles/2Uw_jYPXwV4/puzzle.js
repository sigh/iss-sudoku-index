// Title: Ambiguous Entropy
// Author: XeonRisq
// Video: https://www.youtube.com/watch?v=2Uw_jYPXwV4
// Source: https://app.crackingthecryptic.com/sudoku/jt48N2thgH

// Normal sudoku rules apply (default 3x3 boxes, matching the source's own
// `regions` array). Rules: "Every 2x2 square of cells must contain a digit
// from each of three sets (A,B,C)-(D,E,F)-(G,H,I) however, the digits in
// each entropy set must be deduced by the solver." Unlike the native
// GlobalEntropy class (fixed low/mid/high), the three 3-digit sets here are
// not given -- any partition of 1-9 into three unordered size-3 sets is a
// candidate, fixed for the whole grid but unknown to the solver. That is
// encoded below as an Or over every such partition (280 of them, the
// unordered count 9!/(3!^3 3!)), each branch checking the window/dot rules
// against its own concrete grouping.
// White/black dot positions and their Kropki arithmetic (dotted edges,
// classified by fill colour: white background = white dot, black
// background = black dot) come from the source overlays.

const givens = [
  new Given('R5C5', 4),
  new Given('R9C3', 6),
  new Given('R9C7', 7),
];

// Dotted edges (overlay `center` positions -> covered edge; white
// background = white dot, black background = black dot).
const whiteDotPairs = [
  ['R8C5', 'R9C5'],
  ['R7C4', 'R8C4'],
  ['R5C2', 'R6C2'],
  ['R3C1', 'R3C2'],
  ['R1C3', 'R2C3'],
  ['R1C8', 'R1C9'],
  ['R2C9', 'R3C9'],
  ['R3C4', 'R4C4'],
];
const blackDotPairs = [
  ['R2C2', 'R3C2'],
  ['R6C1', 'R6C2'],
  ['R6C3', 'R7C3'],
  ['R7C6', 'R8C6'],
  ['R7C8', 'R8C8'],
  ['R3C7', 'R3C8'],
  ['R4C6', 'R4C7'],
];

// Numeric part of the dot rules, independent of the unknown entropy
// partition: white = consecutive, black = ratio 2:1.
const whiteDotConsecutive = whiteDotPairs.map(([a, b]) => new WhiteDot(a, b));
const blackDotRatio = blackDotPairs.map(([a, b]) => new BlackDot(a, b));

// Every 2x2 window in the grid, in the same cell order the native
// GlobalEntropy/GlobalMod classes use (square2x2Regions):
// (r,c),(r,c+1),(r+1,c),(r+1,c+1) for every top-left (r,c).
const windows = [];
for (let r = 1; r <= 8; r++) {
  for (let c = 1; c <= 8; c++) {
    windows.push([
      makeCellId(r, c), makeCellId(r, c + 1),
      makeCellId(r + 1, c), makeCellId(r + 1, c + 1),
    ]);
  }
}

// Every way to partition {1..9} into three unordered sets of three digits:
// 9! / (3!^3 * 3!) = 280. Canonicalized so set[0] holds digit 1, and within
// the remaining two sets the one holding the smaller leftover digit comes
// first -- this fixes group order without changing which partitions exist.
const combinations2 = (arr) => {
  const out = [];
  for (let i = 0; i < arr.length; i++) {
    for (let j = i + 1; j < arr.length; j++) {
      out.push([arr[i], arr[j]]);
    }
  }
  return out;
};

const partitions = [];
{
  const rest = [2, 3, 4, 5, 6, 7, 8, 9];
  for (const pair of combinations2(rest)) {
    const setA = [1, ...pair];
    const remaining = rest.filter((d) => !pair.includes(d));
    const anchor = remaining[0];
    const tail = remaining.slice(1);
    for (const pair2 of combinations2(tail)) {
      const setB = [anchor, ...pair2];
      const setC = tail.filter((d) => !pair2.includes(d));
      partitions.push([setA, setB, setC]);
    }
  }
}

// One branch per candidate partition: the window-coverage rule (every 2x2
// touches all three sets) as a bitmask-state NFA reset at each window via
// SEGMENT_BREAK, plus the same/different-set dot qualifiers as Pair
// predicates over that partition's concrete membership.
const entropyBranches = partitions.map((partition) => {
  const groupOf = new Array(10);
  partition.forEach((set, g) => set.forEach((d) => { groupOf[d] = g; }));

  const windowSpec = NFA.encodeSpec({
    startState: { mask: 0 },
    transition: (state, value) => {
      if (value === SEGMENT_BREAK) {
        // A window must have touched all three sets before it ends.
        if (state.mask !== 0b111) return undefined;
        return { mask: 0 };
      }
      return { mask: state.mask | (1 << groupOf[value]) };
    },
    accept: (state) => state.mask === 0b111,
  }, 9, { multiSegment: true });

  const sameSetKey = Pair.fnToKey(
    (a, b) => groupOf[a] === groupOf[b], 9);
  const differentSetKey = Pair.fnToKey(
    (a, b) => groupOf[a] !== groupOf[b], 9);

  return new And([
    new NFA(windowSpec, 'entropy-windows', ...windows),
    ...whiteDotPairs.map(([a, b]) => new Pair(sameSetKey, '', a, b)),
    ...blackDotPairs.map(([a, b]) => new Pair(differentSetKey, '', a, b)),
  ]);
});

return [
  new Shape('9x9'),
  ...givens,
  ...whiteDotConsecutive,
  ...blackDotRatio,
  new Or(entropyBranches),
];
