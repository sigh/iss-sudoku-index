// Title: Modular Mayhem
// Author: Toomas_
// Video: https://www.youtube.com/watch?v=sGq41fL1Oeo
// Source: https://sudokupad.app/n3s05tso9a

// Rules encoded:
// - Standard sudoku: digits 1-9 once each per row, column, and 3x3 box.
// - All clue relations below are evaluated modulo 9, so digit 9 behaves as
//   residue 0.
// - White dot: the two digits are consecutive mod 9 (one is the other + 1,
//   mod 9).
// - Black dot: the two digits are in a 2:1 ratio mod 9 (one is twice the
//   other, mod 9).
// - Red dot: both the white and black conditions hold at once. "ALL possible
//   red dots are given" makes red-dot absence meaningful: every orthogonally
//   adjacent pair NOT marked red must fail the combined condition. This is
//   encoded as an explicit negative Pair on every non-red adjacent pair
//   (scoped-negative-Kropki pattern) -- white/black dots carry no such
//   exhaustiveness claim, so their absence is left unconstrained.
// - Cage rule: digits in a cage do not repeat, and their sum is congruent to
//   the digit in its top-left corner, mod 9 -- that digit is the cage's own
//   printed total, drawn (per the standard cage convention) in its top-left
//   cell, read as a residue rather than a literal sum because "all clues work
//   modulo 9" per the opening rule. Both cages below have a printed total of
//   0, so each cage's digit sum must be congruent to 0, mod 9.
// - Diagonal rule: the sum of the leading diagonal (R1C1..R9C9) is congruent
//   to 1, mod 9.

const graph = cellGraph('9x9');

// Compiles an NFA accepting cell sequences whose digit sum is congruent to
// `target`, mod 9. Shared by the cage and diagonal modular-sum rules below.
const sumMod9Equals = (target) => {
  const residue = ((target % 9) + 9) % 9;
  return NFA.encodeSpec({
    startState: 0,
    transition: (sum, value) => (sum + value) % 9,
    accept: (sum) => sum === residue,
  }, 9);
};

// --- Modulo-9 pairwise relations --------------------------------------------
// a, b are real digits 1-9; digit 9's residue is 0.
const isConsecutiveMod9 = (a, b) => {
  const diff = ((a - b) % 9 + 9) % 9;
  return diff === 1 || diff === 8;
};
const isRatioMod9 = (a, b) => {
  const ra = a % 9, rb = b % 9;
  return ra === (2 * rb) % 9 || rb === (2 * ra) % 9;
};
const isRedMod9 = (a, b) => isConsecutiveMod9(a, b) && isRatioMod9(a, b);

const whiteKey = Pair.fnToKey(isConsecutiveMod9, 9);
const blackKey = Pair.fnToKey(isRatioMod9, 9);
const redKey = Pair.fnToKey(isRedMod9, 9);
const notRedKey = Pair.fnToKey((a, b) => !isRedMod9(a, b), 9);

// Dot edge positions, read from the drawn overlay geometry, grouped by dot
// fill colour.
const whiteDots = [
  ['R2C2', 'R2C3'], ['R4C6', 'R4C7'], ['R8C6', 'R8C7'],
  ['R3C3', 'R4C3'], ['R7C1', 'R8C1'], ['R3C6', 'R4C6'],
];
const blackDots = [
  ['R9C4', 'R9C5'], ['R8C5', 'R9C5'], ['R7C4', 'R8C4'], ['R9C6', 'R9C7'],
];
const redDots = [
  ['R3C4', 'R3C5'], ['R1C6', 'R2C6'], ['R4C8', 'R4C9'], ['R4C2', 'R5C2'],
  ['R9C1', 'R9C2'], ['R7C9', 'R8C9'], ['R3C9', 'R4C9'],
];

const dotPairs = (key, label, dots) =>
  dots.map(([a, b]) => new Pair(key, label, a, b));

// Every remaining orthogonally-adjacent pair (derived from the grid, not
// hand-listed) must fail the red condition, per the exhaustiveness rule.
// Split by offset (same-row vs same-column) and apply each as one Replicate
// of a single-edge Pair template, instead of one Pair per edge.
const redDotKeys = new Set(redDots.map(([a, b]) => [a, b].sort().join('-')));
const seenEdges = new Set();
const nonRedHorizontalOrigins = [];
const nonRedVerticalOrigins = [];
for (const cell of graph.cells()) {
  for (const n of graph.neighbours(cell)) {
    const edgeKey = [cell, n].sort().join('-');
    if (seenEdges.has(edgeKey)) continue;
    seenEdges.add(edgeKey);
    if (redDotKeys.has(edgeKey)) continue;
    const [first, second] = edgeKey.split('-');
    const { row: r1 } = parseCellId(first);
    const { row: r2 } = parseCellId(second);
    (r1 === r2 ? nonRedHorizontalOrigins : nonRedVerticalOrigins).push(first);
  }
}

const notRedPairTemplate = (second) =>
  [new Pair(notRedKey, 'not a red-dot pair (all red dots are drawn)', 'R1C1', second)];

const notRedReplicates = [
  graph.makeReplicate(notRedPairTemplate('R1C2'), nonRedHorizontalOrigins),
  graph.makeReplicate(notRedPairTemplate('R2C1'), nonRedVerticalOrigins),
];

// --- Cages -------------------------------------------------------------------
// Cells and printed total (both 0), per the drawn cage geometry.
const cages = [
  { cells: ['R1C4', 'R2C4'], total: 0 },
  { cells: ['R4C7', 'R5C6', 'R5C7', 'R5C8', 'R6C8'], total: 0 },
];

const cageConstraints = cages.flatMap(({ cells, total }) => [
  new AllDifferent(...cells),
  new NFA(sumMod9Equals(total), 'cage-mod', ...cells),
]);

// --- Diagonal modular sum ----------------------------------------------------
const diagonalCells = [
  'R1C1', 'R2C2', 'R3C3', 'R4C4', 'R5C5', 'R6C6', 'R7C7', 'R8C8', 'R9C9',
];
return [
  new Shape('9x9'),
  ...cageConstraints,
  ...dotPairs(whiteKey, 'white dot: consecutive mod 9', whiteDots),
  ...dotPairs(blackKey, 'black dot: 2:1 ratio mod 9', blackDots),
  ...dotPairs(redKey, 'red dot: consecutive AND 2:1 ratio mod 9', redDots),
  ...notRedReplicates,
  new NFA(sumMod9Equals(1), 'diagonal-mod', ...diagonalCells),
];
