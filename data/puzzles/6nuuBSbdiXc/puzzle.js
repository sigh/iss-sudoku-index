// Title: Archery Contest: XV
// Author: I Love Sleeping
// Video: https://www.youtube.com/watch?v=6nuuBSbdiXc
// Source: https://sudokupad.app/yd57qxn7va

// Normal sudoku. X/V dots as drawn (not all pairs are necessarily marked, so
// StrictXV does not apply). Every drawn cage forbids repeats within itself;
// only one cage (the ring-1 cage below R5C5) carries a printed total.
//
// Archery Contest: the grid is divided into four concentric square "rings"
// around the bullseye R5C5, by Chebyshev distance from R5C5 -- ring 1 is the
// 8 cells touching R5C5, ring 2 the next 16, ring 3 the next 24, ring 4 the
// outer 32. Every drawn cage lies entirely within one ring (verified below).
// The rule requires every ring-i cage's sum to be numerically closer to the
// R5C5 digit than every ring-(i+1) cage's sum, for each pair of adjacent
// rings; this pairwise ordering between every cage in ring i and every cage
// in ring i+1 also forces the same ordering between any farther-apart ring
// pair by transitivity, so only adjacent-ring pairs are encoded.
//
// Cage sums (up to 45) and bullseye distances (up to 44) exceed a single Var
// cell's 16-value cap, so each is split into a tens Var (0-4) and a ones Var
// (0-9) tied to it by a coefficient Sum, sharing one 0-15 auxiliary alphabet.
// Ordering two split values then reduces to a lexicographic tens/ones compare
// (equal to comparing the numbers themselves, since neither exceeds 2 digits).

const shape = new Shape('9x9', '0-15');
const graph = cellGraph(shape);

// Restrict the playable grid back to sudoku digits; the widened value range
// above exists only to hold the auxiliary tens/ones Vars below.
const gridGivens = graph.makeReplicate(new Given('R1C1', 1, 2, 3, 4, 5, 6, 7, 8, 9));

// Cages, grouped by ring. Cell lists are the drawn cage geometry, transcribed
// by hand. Ring assigned by Chebyshev distance of every cage cell from R5C5
// -- each cage's cells share one distance, confirmed while decoding.
const cages = [
  { cells: ['R5C6', 'R6C4', 'R6C5', 'R6C6'], total: 15, ring: 1 },
  { cells: ['R4C4', 'R4C5', 'R4C6', 'R5C4'], ring: 1 },
  { cells: ['R3C3', 'R3C4', 'R3C5', 'R3C6', 'R3C7'], ring: 2 },
  { cells: ['R2C4', 'R2C5', 'R2C6'], ring: 3 },
  { cells: ['R4C8', 'R5C8', 'R6C8'], ring: 3 },
  { cells: ['R8C4', 'R8C5', 'R8C6'], ring: 3 },
  { cells: ['R4C2', 'R5C2', 'R6C2'], ring: 3 },
  { cells: ['R1C1', 'R1C2', 'R1C3', 'R1C4', 'R1C5', 'R2C1', 'R3C1', 'R4C1', 'R5C1'], ring: 4 },
  { cells: ['R5C9', 'R6C9', 'R7C9', 'R8C9', 'R9C5', 'R9C6', 'R9C7', 'R9C8', 'R9C9'], ring: 4 },
  { cells: ['R6C1', 'R7C1', 'R8C1', 'R9C1', 'R9C2', 'R9C3', 'R9C4'], ring: 4 },
  { cells: ['R1C6', 'R1C7', 'R1C8', 'R1C9', 'R2C9', 'R3C9', 'R4C9'], ring: 4 },
];

const bullseye = 'R5C5';

const TENS = [0, 1, 2, 3, 4];    // 0-45 needs at most a tens digit of 4
const ONES = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];

// One tens/ones Var pair per cage for its sum, and one tens/ones Var pair for
// its distance to the bullseye digit.
const sumTens = new Var('P', 'cage sum tens', cages.length);
const sumOnes = new Var('Q', 'cage sum ones', cages.length);
const distTens = new Var('R', 'bullseye distance tens', cages.length);
const distOnes = new Var('U', 'bullseye distance ones', cages.length);

const splitRangeGivens = cages.flatMap((_, i) => [
  new Given(sumTens.cell(i + 1), ...TENS),
  new Given(sumOnes.cell(i + 1), ...ONES),
  new Given(distTens.cell(i + 1), ...TENS),
  new Given(distOnes.cell(i + 1), ...ONES),
]);

const cageConstraints = cages.flatMap((cage, i) => {
  const pTens = sumTens.cell(i + 1);
  const pOnes = sumOnes.cell(i + 1);
  const dTens = distTens.cell(i + 1);
  const dOnes = distOnes.cell(i + 1);
  // A cage's sum is either the printed total (pinned with Given on the split
  // Vars directly) or tied to its cells with a coefficient Sum: cells -
  // 10*tens - ones = 0.
  const sumConstraint = cage.total !== undefined
    ? [new Cage(cage.total, ...cage.cells),
    new Given(pTens, Math.floor(cage.total / 10)),
    new Given(pOnes, cage.total % 10)]
    : [new AllDifferent(...cage.cells),
    new Sum(0, ...cage.cells, [pTens, -10], [pOnes, -1])];
  // The distance Vars are pinned to |sum - bullseye| via an Or of the two
  // linear cases (sum >= bullseye, or bullseye >= sum); the split Vars'
  // domain floor of 0 makes the case with the wrong sign unsatisfiable.
  const distConstraint = new Or([
    new Sum(0, [pTens, 10], [pOnes, 1], [bullseye, -1], [dTens, -10], [dOnes, -1]),
    new Sum(0, [bullseye, 1], [pTens, -10], [pOnes, -1], [dTens, -10], [dOnes, -1]),
  ]);
  return [...sumConstraint, distConstraint];
});

// Closer-ring-cage distance < farther-ring-cage distance, for every pair of
// cages in adjacent rings -- as a lexicographic tens/ones compare.
const lessKey = Pair.fnToKey((a, b) => a < b, shape);
const distLess = (i, j) => new Or([
  new Pair(lessKey, 'tens less', distTens.cell(i + 1), distTens.cell(j + 1)),
  new And([
    new SameValues(2, distTens.cell(i + 1), distTens.cell(j + 1)),
    new Pair(lessKey, 'ones less', distOnes.cell(i + 1), distOnes.cell(j + 1)),
  ]),
]);

const ringGroups = [1, 2, 3, 4].map(
  ring => cages.map((c, i) => i).filter(i => cages[i].ring === ring));
const ringOrderConstraints = ringGroups.slice(0, -1).flatMap((inner, k) => {
  const outer = ringGroups[k + 1];
  return inner.flatMap(i => outer.map(j => distLess(i, j)));
});

// X/V dots: edge marks between the two named cells, as drawn.
const xDots = [
  ['R4C5', 'R5C5'], ['R2C3', 'R2C4'], ['R2C6', 'R2C7'], ['R3C8', 'R4C8'],
  ['R6C8', 'R7C8'], ['R8C6', 'R8C7'], ['R8C3', 'R8C4'], ['R6C2', 'R7C2'],
  ['R3C2', 'R4C2'], ['R3C1', 'R4C1'], ['R1C3', 'R1C4'], ['R8C2', 'R9C2'],
];
const vDots = [
  ['R2C2', 'R3C2'], ['R4C7', 'R5C7'], ['R8C8', 'R8C9'],
];

return [
  shape,
  gridGivens,
  sumTens,
  sumOnes,
  distTens,
  distOnes,
  ...splitRangeGivens,
  ...cageConstraints,
  ...ringOrderConstraints,
  ...xDots.map(([a, b]) => new X(a, b)),
  ...vDots.map(([a, b]) => new V(a, b)),
];
