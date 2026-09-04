// Title: Mystery Prime Cages 6x6
// Author: Qodec
// Video: https://www.youtube.com/watch?v=KXqKNilk528
// Source: https://sudokupad.app/jko1vcklvz

// Each row and column holds 1-6 once each; no boxes are drawn or ruled on,
// so NoBoxes removes the default 2x3 tiling. Nine drawn cages (no printed
// totals) partition the whole grid -- cage cells below, one comment line
// per cage naming the source cage index. Each cage's digits (repeats
// allowed within a cage, so no cage AllDifferent) must sum to a prime, and
// no two cages may share the same prime sum.
//
// A cage sum can reach 72 (the 12-cell cage), past a Var's 16-value cap, so
// it is never held whole. Instead each cage gets a bijective base-6 (hi, lo)
// pair of Var cells with sum = 6*(hi-1) + lo, hi in 1..12, lo in 1..6. A
// per-cage Pair constraint restricts (hi, lo) to the combinations whose
// implied sum is an achievable prime for that cage's cell count (achievable
// = between size*1 and size*6, the naive per-digit bound -- not the tighter
// bound available from cage 0 covering all of column 1, which is left for
// the solver). Because the (hi, lo) pair determines the sum uniquely, two
// cages' sums agree iff both their hi's and their lo's agree, so "no two
// cages share a sum" is one Or of two 2-cell AllDifferents per cage pair.

const cages = [
  ['R1C1', 'R1C2', 'R2C1', 'R3C1', 'R4C1', 'R5C1', 'R6C1'], // source cage[0]
  ['R1C3', 'R1C4'],                                          // source cage[1]
  ['R1C5', 'R1C6'],                                          // source cage[2]
  ['R3C2', 'R4C2'],                                          // source cage[3]
  ['R5C2', 'R6C2', 'R6C3', 'R6C4'],                          // source cage[4]
  ['R4C6', 'R5C6', 'R6C6'],                                  // source cage[5]
  ['R3C6'],                                                  // source cage[6]
  ['R3C3', 'R4C3', 'R4C4'],                                  // source cage[7]
  ['R2C2', 'R2C3', 'R2C4', 'R2C5', 'R2C6', 'R3C4', 'R3C5',
   'R4C5', 'R5C3', 'R5C4', 'R5C5', 'R6C5'],                  // source cage[8]
];

const MAX_TOTAL = 6 * Math.max(...cages.map(c => c.length));
const BASE = 6;
// hi in 1..MAX_HI, lo in 1..BASE: every hi/lo Var shares one alphabet, so
// the widened shape must fit the largest hi any cage needs.
const MAX_HI = Math.ceil(MAX_TOTAL / BASE);

function isPrime(n) {
  if (n < 2) return false;
  for (let d = 2; d * d <= n; d++) {
    if (n % d === 0) return false;
  }
  return true;
}

// sum = BASE*(hi-1) + lo is the unique bijective-base-BASE split of `sum`
// for hi in 1.., lo in 1..BASE.
function splitTotal(sum) {
  const hi = Math.ceil(sum / BASE);
  const lo = sum - BASE * (hi - 1);
  return [hi, lo];
}

const shape = new Shape('6x6', MAX_HI);
const graph = cellGraph(shape);

const hi = new Var('HI', 'cage total, base-6 hi digit', cages.length);
const lo = new Var('LO', 'cage total, base-6 lo digit', cages.length);

// One Pair per cage: restrict that cage's (hi, lo) to the base-6 splits of
// primes reachable by its cell count (min = size*1, max = size*6).
const cagePairs = cages.map((cells, i) => {
  const min = cells.length;
  const max = cells.length * BASE;
  const validSplits = new Set();
  for (let sum = min; sum <= max; sum++) {
    if (isPrime(sum)) validSplits.add(splitTotal(sum).join(','));
  }
  const key = Pair.fnToKey(
    (h, l) => validSplits.has(`${h},${l}`), shape);
  return new Pair(key, `cage ${i} prime sum`, hi.cell(i + 1), lo.cell(i + 1));
});

// Tie each cage's real cells to its (hi, lo) split:
// sum(cells) - BASE*hi - lo = -BASE, i.e. sum(cells) = BASE*(hi-1) + lo.
const cageLinks = cages.map((cells, i) => new Sum(
  -BASE, ...cells, [hi.cell(i + 1), -BASE], [lo.cell(i + 1), -1]));

// No two cages share a sum: their (hi, lo) pairs must differ in hi or in lo.
const distinctSums = [];
for (let i = 0; i < cages.length; i++) {
  for (let j = i + 1; j < cages.length; j++) {
    distinctSums.push(new Or([
      new AllDifferent(hi.cell(i + 1), hi.cell(j + 1)),
      new AllDifferent(lo.cell(i + 1), lo.cell(j + 1)),
    ]));
  }
}

return [
  shape,
  new NoBoxes(),
  // Restrict the real grid back to the puzzle's true 1-6 digits; the
  // widened alphabet above is only for the hi/lo Vars.
  ...graph.cells().map(cell => new Given(cell, 1, 2, 3, 4, 5, 6)),
  hi,
  lo,
  ...cageLinks,
  ...cagePairs,
  ...distinctSums,
];
