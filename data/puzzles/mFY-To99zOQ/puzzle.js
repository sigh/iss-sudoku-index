// Title: Imposter digit
// Author: Dying Flutchman
// Video: https://www.youtube.com/watch?v=mFY-To99zOQ
// Source: https://tinyurl.com/yafv7fp3
//
// Normal sudoku. White dots join consecutive cells; black dots join cells in
// a 1:2 ratio. Ten cages tile the whole grid (no leftover cells); each
// forbids repeated digits, and nine of them print a total (see below).
//
// One digit value 1-9 (unknown, "the imposter") is special: wherever it
// occurs in a cage, that cell contributes any value 1-9 -- not its own face
// value -- to that cage's total, independently chosen per cage. Because a
// cage's own no-repeat rule already forbids a second occurrence of the same
// face digit, at most one cell per cage can be the wildcard.

// Cage cell lists and totals, transcribed from the drawn cages (cell order
// as drawn; #6 carries no printed total).
const CAGES = [
  { cells: ['R1C5', 'R1C6', 'R2C3', 'R2C4', 'R2C5', 'R2C6', 'R3C3', 'R3C4'], total: 41 },
  { cells: ['R4C1', 'R4C2', 'R5C1', 'R5C2', 'R6C2', 'R6C3', 'R7C2', 'R7C3'], total: 41 },
  { cells: ['R1C1', 'R1C2', 'R1C3', 'R1C4', 'R2C1', 'R2C2', 'R3C1', 'R3C2'], total: 48 },
  { cells: ['R1C7', 'R1C8', 'R1C9', 'R2C7', 'R2C8', 'R2C9', 'R3C9', 'R4C9'], total: 47 },
  { cells: ['R7C8', 'R7C9', 'R8C8', 'R8C9', 'R9C6', 'R9C7', 'R9C8', 'R9C9'], total: 45 },
  { cells: ['R6C1', 'R7C1', 'R8C1', 'R8C2', 'R8C3', 'R9C1', 'R9C2', 'R9C3'], total: 49 },
  { cells: ['R5C5', 'R5C6', 'R5C7', 'R6C4', 'R6C5', 'R6C6', 'R6C7', 'R7C4', 'R7C5'], total: null },
  { cells: ['R3C5', 'R3C6', 'R4C3', 'R4C4', 'R4C5', 'R4C6', 'R5C3', 'R5C4'], total: 41 },
  { cells: ['R7C6', 'R7C7', 'R8C4', 'R8C5', 'R8C6', 'R8C7', 'R9C4', 'R9C5'], total: 40 },
  { cells: ['R3C7', 'R3C8', 'R4C7', 'R4C8', 'R5C8', 'R5C9', 'R6C8', 'R6C9'], total: 40 },
];

// White dots: consecutive pairs (default difference 1, matching the rules'
// white-dot wording; no explicit override value is drawn on any dot).
const WHITE_DOTS = [
  ['R6C4', 'R6C5'],
  ['R5C6', 'R5C5'],
  ['R3C3', 'R4C3'],
  ['R9C3', 'R9C2'],
  ['R3C1', 'R3C2'],
];

// Black dots: 1:2-ratio pairs (default ratio 2, matching the rules'
// black-dot wording; no explicit override value is drawn on any dot).
const BLACK_DOTS = [
  ['R2C5', 'R2C4'],
  ['R1C6', 'R1C5'],
  ['R9C4', 'R9C5'],
  ['R8C5', 'R8C6'],
  ['R7C7', 'R6C7'],
  ['R7C8', 'R7C9'],
];

const graph = cellGraph('9x9');

// Parallel Var overlay: OV.at(cell) is the value that `cell` contributes to
// its cage's total. It equals the grid digit unless the digit is the
// imposter, in which case it is a free 1-9 value (see the Or below). Only
// cells in a *totalled* cage need an overlay cell: cage #6 has no total to
// check, so nothing ever reads its cells' counted values, and giving it an
// overlay anyway would only add an unread free variable (spurious solution
// multiplicity, not a fact about the puzzle).
const totalledCells = CAGES.filter(({ total }) => total !== null)
  .flatMap(({ cells }) => cells);
const ov = graph.makeOverlay('VO', totalledCells);

const cageConstraints = CAGES.flatMap(({ cells, total }) => {
  const parts = [new AllDifferent(...cells)];
  if (total !== null) parts.push(new Sum(total, ...ov.at(cells)));
  return parts;
});

const dots = [
  ...WHITE_DOTS.map(([a, b]) => new WhiteDot(a, b)),
  ...BLACK_DOTS.map(([a, b]) => new BlackDot(a, b)),
];

// For a guessed imposter value `v`, every cell's (digit, overlay) pair must
// satisfy "overlay equals digit" OR "digit is the imposter" (in which case
// the overlay is unconstrained, i.e. free). Wrapping one branch per v in an
// `Or` expresses "there exists an imposter digit" without naming which one:
// only one branch's conjunction of all pairwise checks can hold at once,
// since a wrong guess forces some non-imposter cell's overlay to disagree
// with its digit.
const imposterKeyFor = v =>
  Pair.fnToKey((digit, overlay) => overlay === digit || digit === v, 9);

const imposterBranch = v => {
  const key = imposterKeyFor(v);
  const overlays = ov.at(totalledCells);
  return new And(totalledCells.map((cell, i) =>
    new Pair(key, `imposter=${v}`, cell, overlays[i])));
};

const imposter = new Or(
  Array.from({ length: 9 }, (_, i) => imposterBranch(i + 1))
);

return [
  new Shape('9x9'),
  ov.toVar('cage-counted value (equals the digit unless it is the imposter)'),
  ...dots,
  ...cageConstraints,
  imposter,
];
