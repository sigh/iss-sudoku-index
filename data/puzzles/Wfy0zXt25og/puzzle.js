// Title: Mystery Prime Cages 7x7
// Author: Xenonetix
// Video: https://www.youtube.com/watch?v=Wfy0zXt25og
// Source: https://sudokupad.app/0dla0dih4g

// Each row and column holds 1-7 once each; no boxes are drawn or ruled on
// (the payload's per-cell `region` key covers only 42 of 49 cells, not the
// 7 regions of 7 a real box tiling would need, so it is not a real box
// layout), so NoBoxes removes the default tiling. Eleven drawn cages (no printed
// totals) partition the whole grid -- cage cells below, one comment line
// per cage naming the source cage index. Each cage's digits (repeats
// allowed within a cage, so no cage AllDifferent) must sum to a prime, and
// no two cages may share the same prime sum.
//
// A cage sum can reach 70 (the 10-cell cage), past a Var's 16-value cap, so
// it is never held whole. Instead each cage gets a bijective base-7 (hi, lo)
// pair of Var cells with sum = 7*(hi-1) + lo, hi in 1..10, lo in 1..7. A
// per-cage Pair constraint restricts (hi, lo) to the combinations whose
// implied sum is an achievable prime for that cage's cell count (achievable
// = between size*1 and size*7, the naive per-digit bound -- not the tighter
// bound available from cage 2 covering all of column 1, which is left for
// the solver). Because the (hi, lo) pair determines the sum uniquely, two
// cages' sums agree iff both their hi's and their lo's agree, so "no two
// cages share a sum" is one Or of two 2-cell AllDifferents per cage pair.

const cages = [
  ['R1C2', 'R1C3', 'R1C4', 'R1C5', 'R1C6'],                  // source cage[0]
  ['R2C3', 'R2C4', 'R2C5', 'R2C6', 'R2C7'],                  // source cage[1]
  ['R3C1', 'R4C1', 'R5C1', 'R6C1', 'R7C1'],                  // source cage[2]
  ['R1C1', 'R2C1'],                                          // source cage[3]
  ['R4C2', 'R4C3', 'R5C2', 'R6C2', 'R6C3'],                  // source cage[4]
  ['R6C4', 'R7C2', 'R7C3', 'R7C4'],                          // source cage[5]
  ['R2C2', 'R3C2', 'R3C3', 'R3C4', 'R3C5', 'R4C4'],          // source cage[6]
  ['R4C5', 'R4C6', 'R4C7', 'R5C6'],                          // source cage[7]
  ['R3C6', 'R3C7'],                                          // source cage[8]
  ['R5C3', 'R5C4', 'R5C5', 'R5C7', 'R6C5', 'R6C6', 'R6C7',
   'R7C5', 'R7C6', 'R7C7'],                                  // source cage[9]
  ['R1C7'],                                                  // source cage[10]
];

const MAX_TOTAL = 7 * Math.max(...cages.map(c => c.length));
const BASE = 7;
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

const shape = new Shape('7x7', MAX_HI);
const graph = cellGraph(shape);

const hi = new Var('HI', 'cage total, base-7 hi digit', cages.length);
const lo = new Var('LO', 'cage total, base-7 lo digit', cages.length);

// One Pair per cage: restrict that cage's (hi, lo) to the base-7 splits of
// primes reachable by its cell count (min = size*1, max = size*7).
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
  // Restrict the real grid back to the puzzle's true 1-7 digits; the
  // widened alphabet above is only for the hi/lo Vars.
  ...graph.cells().map(cell => new Given(cell, 1, 2, 3, 4, 5, 6, 7)),
  hi,
  lo,
  ...cageLinks,
  ...cagePairs,
  ...distinctSums,
];
