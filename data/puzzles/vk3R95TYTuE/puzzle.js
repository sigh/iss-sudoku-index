// Title: The Thing
// Author: Math Pesto
// Video: https://www.youtube.com/watch?v=vk3R95TYTuE
// Source: https://app.crackingthecryptic.com/sudoku/FrQ76Q9jmD

// Normal sudoku rules apply. The main grid holds each cell's *displayed*
// digit (1-9), which is what row/column/box all-different (the sudoku
// uniqueness rule) is stated over.
//
// "The Thing" mechanic: once in each row, column and box, one cell's
// displayed digit is negated -- its *actual value* (what every other rule
// below reads) is -digit instead of +digit. A parallel VT overlay records
// which cell that is per unit (1 = genuine/positive, 2 = Thing/negative);
// Sum(10, ...) over each unit's flags is 8*1 + 1*2 = 10, which holds iff
// exactly one flag in the unit is 2 -- i.e. exactly one Thing per unit.
//
// Every constraint below that the rules state in terms of "values" (green
// line, thermo, blue line) reads the actual (possibly negative) value, not
// the displayed digit, and is therefore built as a custom NFA scanning
// [digit, flag] pairs and computing the signed value in-state -- ISS has no
// built-in class that reads a signed derived value. The circle clues are
// stated in terms of "numbers", which the rules confirm elsewhere means the
// displayed digit (Thing-negated cells still show their digit), so those
// stay on the raw grid cells.
//
// Omitted: the escape-route rule (a one-cell-wide orthogonal path from
// R2C2 to R8C8, confined to the interior of the closed blue loop, that may
// not contain or be orthogonally adjacent to any Thing cell, with adjacent
// path values differing by >=5).

const graph = cellGraph('9x9');

// Thing flag overlay: one per grid cell, 1 = genuine (positive), 2 = Thing
// (negative).
const GENUINE = 1;
const THING = 2;
const flag = graph.makeOverlay('VT');
const flagDomain = flag.makeReplicate(new Given(flag.cells()[0], GENUINE, THING));

// Exactly one Thing per row/column/box: sum of that unit's 9 flags is 10
// only when eight cells are GENUINE(1) and one is THING(2).
const oneThingPerUnit = graph.rowsColumnsBoxes().map(
  cells => new Sum(9 * GENUINE + (THING - GENUINE), ...flag.at(cells)));

// Interleave a cell list into [digit, flag, digit, flag, ...] for the NFAs
// below, which compute each cell's signed value from that pair in-state.
const withFlags = cells => cells.flatMap(cell => [cell, flag.at(cell)]);
const signedValue = (digit, flagValue) => (flagValue === THING ? -digit : digit);

// --- Green star: R4C5 differs by >=5 (signed) from each of its 8 neighbours.
const CENTER = 'R4C5';
const STAR_NEIGHBOURS = [
  'R3C4', 'R3C5', 'R3C6', 'R4C4', 'R4C6', 'R5C4', 'R5C5', 'R5C6',
];

// Scans [digitA, flagA, digitB, flagB]; accepts iff |signed(A) - signed(B)| >= 5.
const diffAtLeast5Spec = NFA.encodeSpec({
  startState: { i: 0 },
  transition: (state, value) => {
    if (state.i === 0) return { i: 1, digitA: value };
    if (state.i === 1) return { i: 2, effA: signedValue(state.digitA, value) };
    if (state.i === 2) return { i: 3, effA: state.effA, digitB: value };
    if (state.i === 3) {
      return { i: 4, diff: Math.abs(state.effA - signedValue(state.digitB, value)) };
    }
    return undefined;
  },
  accept: (state) => state.i === 4 && state.diff >= 5,
}, 9);

const greenStar = STAR_NEIGHBOURS.map(cell => new NFA(
  diffAtLeast5Spec, 'green line diff>=5 (signed)',
  ...withFlags([CENTER, cell])));

// --- Grey thermo: strictly increasing signed values, bulb-first.
const THERMO = ['R4C5', 'R3C6', 'R2C7', 'R1C8', 'R1C9'];

// Scans [digit, flag]*N in order; accepts iff each cell's signed value is
// strictly greater than the previous cell's.
function signedIncreasingSpec(n) {
  const total = 2 * n;
  return NFA.encodeSpec({
    startState: { i: 0, prev: null },
    transition: (state, value) => {
      if (state.i >= total) return undefined;  // bound state growth: stop consuming symbols once the segment ends
      if (state.i % 2 === 0) return { i: state.i + 1, prev: state.prev, digit: value };
      const eff = signedValue(state.digit, value);
      if (state.prev !== null && !(eff > state.prev)) return undefined;
      return { i: state.i + 1, prev: eff };
    },
    accept: (state) => state.i === total,
    maxDepth: total,
  }, 9);
}

const thermo = new NFA(
  signedIncreasingSpec(THERMO.length), 'thermo increasing (signed)',
  ...withFlags(THERMO));

// --- Blue line: equal signed sum in every per-box segment the closed loop
// passes through (it re-enters box R1-3/C1-3 twice, contributing two
// separate segments there). Box R7-9/C1-3 contributes a single cell,
// R7C3, so every other segment's signed sum is compared against it
// directly -- a spanning tree of 8 pairwise equalities is equivalent to
// all 9 segments being mutually equal.
const BLUE_ANCHOR = ['R7C3'];
const BLUE_SEGMENTS = [
  ['R1C1', 'R2C1', 'R3C2'],
  ['R3C3', 'R2C2', 'R1C1'],
  ['R4C2', 'R5C2', 'R6C3'],
  ['R7C4', 'R8C5', 'R9C5', 'R9C6'],
  ['R8C7', 'R8C8', 'R7C9'],
  ['R6C9', 'R5C8', 'R4C8'],
  ['R3C8', 'R2C7'],
  ['R2C6', 'R2C5', 'R3C4'],
];

// Scans segment A's [digit, flag]*lenA then segment B's [digit, flag]*lenB;
// accepts iff the two segments' signed sums are equal. Tracks a single
// running (sumA - sumB) difference rather than the two sums separately, so
// the compiled state stays one bounded dimension instead of their product.
function signedSumEqualSpec(lenA, lenB) {
  const cellCount = lenA + lenB;
  const total = 2 * cellCount;
  return NFA.encodeSpec({
    startState: { i: 0, diff: 0 },
    transition: (state, value) => {
      if (state.i >= total) return undefined;  // bound state growth: stop consuming symbols once the segment ends
      if (state.i % 2 === 0) return { i: state.i + 1, diff: state.diff, digit: value };
      const eff = signedValue(state.digit, value);
      const cellIndex = (state.i - 1) / 2;
      const sign = cellIndex < lenA ? 1 : -1;
      return { i: state.i + 1, diff: state.diff + sign * eff };
    },
    accept: (state) => state.i === total && state.diff === 0,
    maxDepth: total,
  }, 9);
}

const blueLineEqualSums = BLUE_SEGMENTS.map(segment => new NFA(
  signedSumEqualSpec(segment.length, BLUE_ANCHOR.length),
  'blue line equal signed sum',
  ...withFlags(segment), ...withFlags(BLUE_ANCHOR)));

// --- Quadruple circles: SudokuPad exports stacked quadruple digits as one
// concatenated overlay string (e.g. "14" = the digits 1 and 4 stacked, not
// the number fourteen); the rules' "numbers in a circle appear once" is
// each of those single digits appearing exactly once among the four cells
// (as a genuine or Thing-negated cell -- either way its displayed digit is
// unchanged, so this reads the raw grid digit, not the signed value).
const QUADS = [
  { cells: ['R2C2', 'R2C3', 'R3C2', 'R3C3'], digits: '1_4' },
  { cells: ['R5C1', 'R5C2', 'R6C1', 'R6C2'], digits: '2_3' },
  { cells: ['R8C5', 'R8C6', 'R9C5', 'R9C6'], digits: '7' },
  { cells: ['R2C8', 'R2C9', 'R3C8', 'R3C9'], digits: '1_7' },
];
const quadCircles = QUADS.map(
  ({ cells, digits }) => new ContainExact(digits, ...cells));

return [
  new Shape('9x9'),
  flag.toVar('Thing flag (1=genuine, 2=Thing)'),
  flagDomain,
  ...oneThingPerUnit,
  ...greenStar,
  thermo,
  ...blueLineEqualSums,
  ...quadCircles,
];
