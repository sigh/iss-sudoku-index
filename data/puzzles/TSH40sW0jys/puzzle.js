// Title: Just Wrogn Enough
// Author: Lerroyy
// Video: https://www.youtube.com/watch?v=TSH40sW0jys
// Source: https://app.crackingthecryptic.com/sudoku/g8LBNq46FM

// A "Wrogn" puzzle: every named clue type is the negation of its normal
// meaning. Rules encoded below (one clause per line of metadata.rules):
//  - Normal sudoku rules apply (rows/cols/boxes: default Shape all-different).
//  - White dot: the two digits must NOT be consecutive.
//  - Black dot: the two digits must NOT be in a 1:2 ratio.
//  - X: the two digits must NOT sum to 10.
//  - V: the two digits must NOT sum to 5.
//  - Cage: the digits must NOT sum to the printed total. The payload's own
//    "cages" array key licenses the usual cage no-repeat half of the rule.
//  - Red line: the digits must NOT form a palindrome.
//  - Yellow "max" cell: smaller than every orthogonal neighbour.
//  - Orange "min" cell: bigger than every orthogonal neighbour.
//  - Circle: the printed digits must NOT all appear among the 4 surrounding
//    cells, and those 4 cells may not repeat a digit.
//  - Grey thermometer: the true bulb is not the rendered one (the line's
//    first drawn cell); digits increase outward from whichever other cell is
//    the true bulb, and the whole line has no repeats.
//  - Purple line: no repeats, and the digits used must NOT form a set of
//    consecutive integers.
//  - Outside diagonal clue: must NOT give the sum along the indicated
//    diagonal.
//  - Blue square: must not contain an even digit.

// --- Reusable relations and helpers ---

// Sum of k distinct digits from 1-9 ranges over [k(k+1)/2, 9k - k(k-1)/2].
const sumBounds = (k) => ({ lo: k * (k + 1) / 2, hi: k * 9 - k * (k - 1) / 2 });

// "Digits must NOT sum to target": every other in-range total is allowed, so
// this is an Or of exact-sum branches over every total except the printed one.
const antiSum = (target, cells) => {
  const { lo, hi } = sumBounds(cells.length);
  const branches = Array.from({ length: hi - lo + 1 }, (_, i) => lo + i)
    .filter((s) => s !== target)
    .map((s) => new Sum(s, ...cells));
  return new Or(branches);
};

// Negated two-cell dot/marker relations (Pair binds by grid adjacency, like
// the native dot classes, so one Pair per drawn edge).
const notConsecutiveKey = Pair.fnToKey((a, b) => Math.abs(a - b) !== 1, 9);
const notRatio2Key = Pair.fnToKey((a, b) => a !== 2 * b && b !== 2 * a, 9);
const notSum10Key = Pair.fnToKey((a, b) => a + b !== 10, 9);
const notSum5Key = Pair.fnToKey((a, b) => a + b !== 5, 9);

// Odd-length line palindrome only constrains symmetric pairs; for a 3-cell
// line that is just first == last (the middle cell is unconstrained even by
// the normal rule), so "not a palindrome" reduces to first != last, i.e. the
// two endpoints form a plain 2-cell all-different group.
const antiPalindromeEnds = (a, b) => new AllDifferent(a, b);

// "Digits must NOT form a set of consecutive integers": with all-different
// already enforced, a 3-value set is a consecutive run iff max - min == 2, so
// track only the running (min, max) -- not the seen-value set -- across the
// three cells: track only the running (min, max), not the seen-value set.
const purpleTripleNegSpec = NFA.encodeSpec({
  startState: 'start',
  transition: (state, value) => (state === 'start'
    ? { min: value, max: value }
    : { min: Math.min(state.min, value), max: Math.max(state.max, value) }),
  accept: (state) => state !== 'start' && (state.max - state.min) !== 2,
}, 9);

// For an 8-cell purple line, exactly one digit 1-9 is missing from the line.
// The remaining 8 are a consecutive run iff the missing digit is an endpoint
// (1 or 9), so "not consecutive" reduces to: both 1 and 9 must appear.
const purpleOctetNeg = (cells) => new ContainAtLeast('1_9', ...cells);

// "Not all of S present among these cells": track only which members of S
// have been seen, as a bitmask (not the full seen-digit set).
const notAllPresent = (name, cells, values) => {
  const spec = NFA.encodeSpec({
    startState: 0,
    transition: (mask, value) => {
      const bit = values.indexOf(value);
      return bit === -1 ? mask : (mask | (1 << bit));
    },
    accept: (mask) => mask !== (1 << values.length) - 1,
  }, 9);
  return new NFA(spec, name, ...cells);
};

// Unknown-bulb thermometer: the true bulb is any cell except path[0] (the
// rendered bulb, which the rule says is not the real one). A bulb at the
// last cell gives one arm (the whole line, reversed); an interior bulb at
// index i splits the path into two arms, each increasing outward from i.
const bulbBranches = (path) => {
  const n = path.length;
  const branches = Array.from({ length: n - 1 }, (_, idx) => idx + 1).map((i) => (
    i === n - 1
      ? new Thermo(...[...path].reverse())
      : new And([
        new Thermo(...path.slice(0, i + 1).reverse()),
        new Thermo(...path.slice(i)),
      ])
  ));
  return new Or(branches);
};

// --- Drawn clue geometry (transcribed from the source payload's cell/line/
// overlay/underlay coordinates) ---

// cages[0]/[1]; metadata-stub cage entries omitted.
const cages = [
  { cells: ['R6C9', 'R7C9'], total: 9 },
  { cells: ['R4C4', 'R6C4', 'R5C4'], total: 17 },
];

// Kropki-style edge dots (overlays #0-#9); decorative/no-geometry overlays
// and lines are omitted since they draw nothing (no coordinates to encode).
const blackDotEdges = [['R1C7', 'R1C8'], ['R4C5', 'R4C6'], ['R4C6', 'R5C6']];
const whiteDotEdges = [
  ['R1C1', 'R1C2'], ['R6C7', 'R7C7'], ['R8C8', 'R9C8'],
  ['R7C5', 'R7C6'], ['R7C4', 'R7C5'], ['R7C3', 'R7C4'], ['R9C3', 'R9C4'],
];
const xEdges = [
  ['R1C7', 'R2C7'], ['R2C7', 'R2C8'], ['R1C6', 'R2C6'],
  ['R5C5', 'R6C5'], ['R6C5', 'R6C6'], ['R5C6', 'R6C6'], ['R5C1', 'R6C1'],
];
const vEdges = [['R5C2', 'R5C3'], ['R2C7', 'R3C7']];

// Red palindrome lines (lines[0], lines[1]); only the endpoints matter.
const redLineEnds = [['R3C9', 'R5C7'], ['R7C5', 'R9C7']];

// Purple lines (lines[9], lines[10]).
const purpleShort = ['R7C3', 'R8C4', 'R9C3'];
const purpleLong = ['R8C6', 'R7C6', 'R6C6', 'R6C5', 'R6C4', 'R5C4', 'R4C4', 'R3C4'];

// Grey thermometers (lines[2], lines[3]); path[0] is the rendered bulb cell,
// also marked by the grey circle underlay at that same cell.
const thermo1 = ['R7C4', 'R7C3', 'R7C2', 'R7C1', 'R8C1', 'R9C1', 'R9C2', 'R9C3', 'R9C4'];
const thermo2 = ['R4C2', 'R3C2', 'R2C2', 'R2C3', 'R1C3', 'R1C4', 'R1C5', 'R2C6'];

// Circle clues (overlays #21, #22): corner-anchored 2x2 cell groups.
const circles = [
  { cells: ['R3C8', 'R3C9', 'R4C8', 'R4C9'], values: [4, 5, 6], name: 'circle456' },
  { cells: ['R5C5', 'R5C6', 'R6C5', 'R6C6'], values: [8, 9], name: 'circle89' },
];

// Max/min cells (underlays #4 yellow, #5 orange); both fully interior with
// all 4 orthogonal neighbours present.
const maxCell = 'R2C7';
const maxNeighbors = ['R1C7', 'R3C7', 'R2C6', 'R2C8'];
const minCell = 'R5C5';
const minNeighbors = ['R4C5', 'R6C5', 'R5C4', 'R5C6'];

// Outside diagonal clues (arrow #0 + overlay #19 "11"; arrow #1 + overlay
// #20 "9"). Each diagonal lies entirely within one box, so the cells are
// already all-different without an extra constraint.
const diagonals = [
  { cells: ['R1C3', 'R2C2', 'R3C1'], total: 11 },
  { cells: ['R1C8', 'R2C9'], total: 9 },
];

// Blue squares (underlays #2, #3, deepskyblue): must be odd.
const blueSquares = ['R2C6', 'R8C4'];

return [
  new Shape('9x9'),

  ...cages.flatMap(({ cells, total }) => [new AllDifferent(...cells), antiSum(total, cells)]),

  ...blackDotEdges.map(([a, b]) => new Pair(notRatio2Key, 'black dot', a, b)),
  ...whiteDotEdges.map(([a, b]) => new Pair(notConsecutiveKey, 'white dot', a, b)),
  ...xEdges.map(([a, b]) => new Pair(notSum10Key, 'X', a, b)),
  ...vEdges.map(([a, b]) => new Pair(notSum5Key, 'V', a, b)),

  ...redLineEnds.map(([a, b]) => antiPalindromeEnds(a, b)),

  new AllDifferent(...purpleShort),
  new NFA(purpleTripleNegSpec, 'purpleTripleNeg', ...purpleShort),
  new AllDifferent(...purpleLong),
  purpleOctetNeg(purpleLong),

  new AllDifferent(...thermo1),
  bulbBranches(thermo1),
  new AllDifferent(...thermo2),
  bulbBranches(thermo2),

  ...circles.flatMap(({ cells, values, name }) => [
    new AllDifferent(...cells),
    notAllPresent(name, cells, values),
  ]),

  ...maxNeighbors.map((n) => new GreaterThan(n, maxCell)),
  ...minNeighbors.map((n) => new GreaterThan(minCell, n)),

  ...diagonals.map(({ cells, total }) => antiSum(total, cells)),

  ...blueSquares.map((c) => new Given(c, 1, 3, 5, 7, 9)),
];
