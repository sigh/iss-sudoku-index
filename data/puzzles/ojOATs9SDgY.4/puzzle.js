// Title: Guard Dog
// Author: Philip Newman
// Video: https://www.youtube.com/watch?v=ojOATs9SDgY
// Source: https://tinyurl.com/mtfvuc8c
//
// Normal sudoku rules (rows, columns, 3x3 boxes). Digits separated by a
// black dot must have the ratio given on the dot; digits separated by a
// white dot must have the difference given on the dot. No givens. The
// rules do not say every such dot is drawn, so no exhaustiveness
// (StrictKropki-style) constraint applies -- only the drawn dots bind.
//
// Each dot is an independent two-cell edge. Values vary dot to dot, so most
// are not the fixed relation WhiteDot(diff=1)/BlackDot(ratio=2) encode --
// those two are used only for the dots whose printed value matches, and
// every other value gets one Pair per edge with a value-specific predicate.
// Cell pairs and printed values are transcribed from the payload's `ratio`
// and `difference` arrays, reordered low-to-high coordinate for readability
// only.

const RATIO_DOTS = [ // [cellA, cellB, ratio]
  ['R9C2', 'R9C3', 2],
  ['R9C3', 'R9C4', 3],
  ['R8C2', 'R9C2', 3],
  ['R7C2', 'R8C2', 5],
  ['R9C7', 'R9C8', 5],
  ['R8C8', 'R9C8', 2],
  ['R7C8', 'R8C8', 4],
  ['R6C3', 'R7C3', 3],
  ['R6C7', 'R7C7', 3],
  ['R9C4', 'R9C5', 4],
  ['R6C3', 'R6C4', 3],
  ['R6C6', 'R6C7', 4],
];

const DIFFERENCE_DOTS = [ // [cellA, cellB, difference]
  ['R1C1', 'R1C2', 1],
  ['R1C2', 'R1C3', 2],
  ['R1C3', 'R1C4', 3],
  ['R1C4', 'R1C5', 4],
  ['R1C5', 'R1C6', 5],
  ['R1C6', 'R1C7', 6],
  ['R1C7', 'R1C8', 7],
  ['R1C8', 'R1C9', 8],
  ['R1C9', 'R2C9', 7],
  ['R2C9', 'R3C9', 5],
  ['R3C9', 'R4C9', 3],
  ['R4C9', 'R5C9', 1],
  ['R1C1', 'R2C1', 2],
  ['R2C1', 'R3C1', 4],
  ['R3C1', 'R4C1', 6],
  ['R4C1', 'R5C1', 8],
  ['R2C8', 'R3C8', 1],
  ['R2C7', 'R3C7', 3],
  ['R2C3', 'R3C3', 7],
  ['R2C2', 'R3C2', 7],
  ['R3C2', 'R3C3', 6],
  ['R3C7', 'R3C8', 2],
  ['R2C4', 'R2C5', 2],
  ['R2C5', 'R2C6', 2],
];

const NUM_VALUES = 9;

// One memoized Pair key per distinct printed value, since Pair.fnToKey
// itself is not memoized and every edge sharing a value should share a key.
const ratioKeys = new Map();
const ratioKey = k => {
  if (!ratioKeys.has(k)) {
    ratioKeys.set(k, Pair.fnToKey((a, b) => a === k * b || b === k * a, NUM_VALUES));
  }
  return ratioKeys.get(k);
};
const differenceKeys = new Map();
const differenceKey = k => {
  if (!differenceKeys.has(k)) {
    differenceKeys.set(k, Pair.fnToKey((a, b) => Math.abs(a - b) === k, NUM_VALUES));
  }
  return differenceKeys.get(k);
};

const ratioConstraints = RATIO_DOTS.map(([a, b, k]) =>
  k === 2 ? new BlackDot(a, b) : new Pair(ratioKey(k), `ratio-${k}`, a, b));
const differenceConstraints = DIFFERENCE_DOTS.map(([a, b, k]) =>
  k === 1 ? new WhiteDot(a, b) : new Pair(differenceKey(k), `difference-${k}`, a, b));

return [
  new Shape('9x9'),
  ...ratioConstraints,
  ...differenceConstraints,
];
