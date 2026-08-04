// Title: The Fifteenth Day Of Christmas
// Author: Cris Moore
// Video: https://www.youtube.com/watch?v=Iu9sDHZwjj8
// Source: https://app.crackingthecryptic.com/sudoku/N97hpDgdf6

// Normal sudoku. Anti-knight: cells a knight's move apart cannot repeat a
// digit. Ten purple lines are drawn; each sums to 15 with no repeated digit,
// and no two lines (of the same length) hold the same set of digits. One
// line is also a thermometer, increasing from its bulb.

// LINES: cells transcribed from the drawn purple lines (interpolated
// cell-to-cell diagonal hops), bulb-first for the thermometer. `thermo:
// true` marks the one line whose bulb end is drawn (a filled purple circle
// on R3C4, the start of this line's cell list).
const LINES = [
  { cells: ['R2C1', 'R3C1'] },
  { cells: ['R5C2', 'R6C3', 'R7C2'] },
  { cells: ['R5C5', 'R6C4', 'R7C5'] },
  { cells: ['R3C4', 'R4C5', 'R5C4'], thermo: true },
  { cells: ['R2C4', 'R1C4', 'R1C5'] },
  { cells: ['R3C7', 'R4C6', 'R5C7'] },
  { cells: ['R3C8', 'R4C9', 'R5C8'] },
  { cells: ['R5C6', 'R6C7', 'R7C6'] },
  { cells: ['R8C9', 'R9C9', 'R9C8'] },
  { cells: ['R9C4', 'R9C5'] },
];

// Sum(15) + all-different in one cell set is exactly Cage's semantics.
const cages = LINES.map(l => new Cage(15, ...l.cells));
const thermo = new Thermo(...LINES.find(l => l.thermo).cells);

// "No two lines contain the same set of digits." Different-length lines can
// never share a set, so this only needs checking within the two 2-cell lines
// and, separately, within the eight 3-cell lines.

// Two-cell lines: each sums to 15 with two distinct 1-9 digits, and the only
// such pairs are {6,9} and {7,8} -- disjoint, so "the two lines pick
// different pairs" and "all four cells are mutually different" are the same
// condition here. AllDifferent over the union is the direct expression of
// that.
const len2Lines = LINES.filter(l => l.cells.length === 2);
const len2Distinct = new AllDifferent(...len2Lines.flatMap(l => l.cells));

// Three-cell lines: the only 3-digit subsets of 1-9 summing to 15 (derived
// here by brute force, rather than transcribed, so the claim is checkable).
// A triple's (min, max) already tells the eight apart -- no two share both.
const TRIPLES15 = [];
for (let a = 1; a <= 9; a++)
  for (let b = a + 1; b <= 9; b++)
    for (let c = b + 1; c <= 9; c++)
      if (a + b + c === 15) TRIPLES15.push([a, c]); // [min, max]
const categoryByEndpoints =
  new Map(TRIPLES15.map(([min, max], i) => [`${min},${max}`, i + 1]));

// One Var per 3-cell line names which of the eight triples it holds (its
// value only matters through the link below); AllDifferent over those Vars
// is then exactly "no two of these lines share a set" -- reduced to eight
// single-cell comparisons instead of 28 pairwise set comparisons.
const len3Lines = LINES.filter(l => l.cells.length === 3);
const category = new Var('CT', 'purple 3-line digit-set index (1-8)', len3Lines.length);
const categoryCells = category.cells();

// Links a line's three cells to its category cell: read the three digits,
// tracking the running (min, max) canonically (order doesn't matter, so
// states merge instead of multiplying); the category symbol read last must
// equal the triple index for that (min, max). Reused across all eight lines,
// so it compiles once.
const categoryLinkSpec = NFA.encodeSpec({
  startState: { n: 0, min: 10, max: 0 },
  transition: (s, value) => {
    if (s.n < 3) {
      return { n: s.n + 1, min: Math.min(s.min, value), max: Math.max(s.max, value) };
    }
    const idx = categoryByEndpoints.get(`${s.min},${s.max}`);
    return value === idx ? { n: 4 } : undefined;
  },
  accept: s => s.n === 4,
}, 9);
const categoryLinks = len3Lines.map((l, i) =>
  new NFA(categoryLinkSpec, 'line-category', ...l.cells, categoryCells[i]));
const len3Distinct = new AllDifferent(...categoryCells);

return [
  new Shape('9x9'),
  new AntiKnight(),
  ...cages,
  thermo,
  category,
  ...categoryLinks,
  len2Distinct,
  len3Distinct,
];
