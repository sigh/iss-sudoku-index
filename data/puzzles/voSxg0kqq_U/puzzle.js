// Title: Factor Map
// Author: Ul-Rhymm
// Video: https://www.youtube.com/watch?v=voSxg0kqq_U
// Source: https://sudokupad.app/c325ibxs31

// Rules encoded here, in full:
//   - Normal sudoku.
//   - Digits do not repeat within a cage; a cage's value is the sum of its digits.
//   - Every cage is coloured with one of four colours.
//   - Two cages of the same colour may not share an edge (corner contact is allowed).
//   - Cages of the same colour have sums whose prime factorisations contain the
//     same set of prime factors. The rules' worked example -- a red 20 = 2x2x5
//     forces every red sum to be 2^X*5^Y, and "any other colored cage could not
//     have a 2 nor 5 in its prime factorizations" -- makes the four colours'
//     prime sets pairwise disjoint. So a colour *is* a set of primes, and a cage
//     of that colour has exactly those primes as the prime factors of its sum.
// Nothing is omitted.

// The 22 drawn cages, transcribed from the puzzle's cage outlines. None of them
// carries a printed total, and 14 grid cells lie outside every cage.
const cageCells = [
  ['R4C5', 'R5C4', 'R5C5'],
  ['R6C4', 'R6C5', 'R6C6'],
  ['R4C6', 'R5C6'],
  ['R3C3', 'R3C4', 'R3C5', 'R3C6', 'R3C7', 'R4C3', 'R4C4', 'R5C3', 'R6C3'],
  ['R4C7', 'R4C8', 'R4C9', 'R5C7', 'R5C8', 'R5C9', 'R6C7', 'R6C8'],
  ['R7C2', 'R8C2'],
  ['R7C3', 'R8C3'],
  ['R9C2', 'R9C3'],
  ['R7C1', 'R8C1'],
  ['R6C1', 'R6C2'],
  ['R1C7', 'R1C8', 'R1C9', 'R2C8', 'R2C9'],
  ['R3C8', 'R3C9'],
  ['R2C7'],
  ['R6C9', 'R7C9', 'R8C9', 'R9C9'],
  ['R2C1', 'R2C2', 'R3C1', 'R4C1'],
  ['R1C1', 'R1C2'],
  ['R7C7', 'R8C7'],
  ['R9C7', 'R9C8'],
  ['R7C4', 'R7C5'],
  ['R7C6', 'R8C6'],
  ['R1C4', 'R2C4', 'R2C5'],
  ['R8C5', 'R9C5', 'R9C6'],
];

const NUM_CAGES = cageCells.length;
const NUM_COLOURS = 4;
// A cage holds at most nine distinct digits, so no sum exceeds 45.
const MAX_SUM = 45;

const rangeI = (from, to) =>
  Array.from({ length: to - from + 1 }, (_, i) => from + i);

const graph = cellGraph('9x9');

// Which cage each caged cell belongs to.
const cageOf = new Map(
  cageCells.flatMap((cells, i) => cells.map(cell => [cell, i])));

// Cage pairs sharing an edge: every orthogonal neighbour pair in two cages,
// listed once with the lower index first.
const adjacentCagePairs = [...new Set(
  [...cageOf.keys()].flatMap(cell => graph.neighbours(cell)
    .filter(n => cageOf.has(n) && cageOf.get(n) > cageOf.get(cell))
    .map(n => `${cageOf.get(cell)}_${cageOf.get(n)}`)))]
  .map(key => key.split('_').map(Number));

const areAdjacentCages = (a, b) =>
  adjacentCagePairs.some(([x, y]) => (x === a && y === b) || (x === b && y === a));

// Primes up to the largest possible cage sum; nothing else can divide a sum.
const PRIMES = rangeI(2, MAX_SUM).filter(
  n => rangeI(2, n - 1).every(d => n % d !== 0));

// k distinct digits from 1-9 sum to between 1+..+k and 9+..+(10-k), and every
// total in between is reachable, so this is the cage's set of possible sums.
const possibleSums = (k) => rangeI(k * (k + 1) / 2, k * (19 - k) / 2);

// Var cells: one colour per cage (values 1-4) and one owner per prime (values
// 1-4 for the colour whose prime set contains it, 5 for a prime no colour uses).
const cageColour = new Var('C', 'Cage colour', NUM_CAGES);
const primeOwner = new Var('P', 'Prime owner', PRIMES.length);
const NO_COLOUR = NUM_COLOURS + 1;

// The colouring rule, per cage, as one machine: read the cage's digits to get
// its sum s, then its colour c, then the owner of each prime p that could
// divide s. Accept when `owner(p) === c` for exactly the primes dividing s --
// that is, the colour's prime set is precisely the set of prime factors of s.
// Primes that cannot divide s are excluded from the machine and covered by
// `unusablePrimeRules` below.
function cageColouringSpec(numCells, sums, primeIndices) {
  const maxSum = sums[sums.length - 1];
  const sumSet = new Set(sums);
  return NFA.encodeSpec({
    // `req` is the still-unread tail of the required owner pattern, so states
    // that agree on what is left to check merge instead of multiplying.
    startState: { i: 0, sum: 0 },
    transition: (state, value) => {
      if (state.req === undefined) {
        if (state.i < numCells) {
          const sum = state.sum + value;
          // A total over maxSum is already impossible for distinct digits;
          // dropping the branch here keeps the state count bounded.
          return sum > maxSum ? undefined : { i: state.i + 1, sum };
        }
        // This symbol is the cage's colour cell.
        if (value > NUM_COLOURS || !sumSet.has(state.sum)) return undefined;
        return {
          c: value,
          req: primeIndices.map(
            j => state.sum % PRIMES[j] === 0 ? '1' : '0').join(''),
        };
      }
      // This symbol is a prime owner cell.
      if ((value === state.c) !== (state.req[0] === '1')) return undefined;
      return { c: state.c, req: state.req.slice(1) };
    },
    accept: (state) => state.req === '',
  }, 9);
}

const cageColouringNFAs = cageCells.map((cells, i) => {
  const sums = possibleSums(cells.length);
  const primeIndices = PRIMES.flatMap(
    (p, j) => sums.some(s => s % p === 0) ? [j] : []);
  return new NFA(
    cageColouringSpec(cells.length, sums, primeIndices),
    `cage${i + 1}`,
    ...cells,
    cageColour.cell(i + 1),
    ...primeIndices.map(j => primeOwner.cell(j + 1)));
});

// A prime that divides no possible sum of a cage cannot belong to that cage's
// colour, so it is owned by some other colour or by none.
const unusablePrimeRules = cageCells.flatMap((cells, i) => {
  const sums = possibleSums(cells.length);
  return PRIMES.flatMap((p, j) => sums.some(s => s % p === 0) ? [] : [
    new AllDifferent(cageColour.cell(i + 1), primeOwner.cell(j + 1))
  ]);
});

// Colour labels are ours, not the puzzle's: permuting them maps solutions onto
// solutions. The first four pairwise edge-sharing cages must take four distinct
// colours, so fixing them to 1-4 pins one representative of that relabelling.
const pinnedClique = rangeI(0, NUM_CAGES - 1).flatMap(a =>
  rangeI(a + 1, NUM_CAGES - 1).flatMap(b =>
    rangeI(b + 1, NUM_CAGES - 1).flatMap(c =>
      rangeI(c + 1, NUM_CAGES - 1).flatMap(d =>
        [[a, b, c, d]].filter(q => q.every(
          (x, m) => q.slice(m + 1).every(y => areAdjacentCages(x, y))))))))[0];

return [
  new Shape('9x9'),

  // Digits do not repeat within a cage; no cage has a printed total.
  ...cageCells.filter(cells => cells.length > 1).map(cells => new Cage(0, ...cells)),

  cageColour,
  ...cageColour.cells().map(cell => new Given(cell, ...rangeI(1, NUM_COLOURS))),
  primeOwner,
  ...primeOwner.cells().map(cell => new Given(cell, ...rangeI(1, NO_COLOUR))),

  // Cages sharing an edge are differently coloured.
  ...adjacentCagePairs.map(([a, b]) => new AllDifferent(
    cageColour.cell(a + 1), cageColour.cell(b + 1))),

  ...cageColouringNFAs,
  ...unusablePrimeRules,

  ...(pinnedClique ?? []).map((cage, k) =>
    new Given(cageColour.cell(cage + 1), k + 1)),
];
