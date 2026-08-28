// Title: This Sudoku Has No Digits At All!
// Author: Phistomefel
// Video: https://www.youtube.com/watch?v=qLD1s_OHRkE
// Source: https://cracking-the-cryptic.web.app/sudoku/999hDGj6Gr

// Normal sudoku rules: default Shape('9x9') already enforces row, column and
// box all-different, matching the payload's 9 regions, which are the
// standard 3x3 boxes.
//
// Twenty drawn cages carry no printed total. "Digits may not repeat within a
// cage" (all-different) and "There exists a two-digit number x, such that the
// digits in each cage add up to a multiple of x. The number x is the same for
// each cage and has to be determined first." x is not drawn or given: it is
// an existential over the two-digit integers 10-99, one shared value for
// every cage. That existential is encoded directly as a top-level Or over
// candidate x values; each branch And's, over every cage, an Or of
// `Cage(s, ...)` for every multiple s of that x reachable by that cage's cell
// count (Cage also carries the all-different clause, so no separate
// AllDifferent is needed). A branch whose cage has no reachable multiple is
// provably unsatisfiable and is skipped -- that is arithmetic on the cage's
// own cell count (how many distinct 1-9 digits it holds), not a fact derived
// from this puzzle's solution.

// Cage cell lists, provenance: the puzzle's drawn cage geometry, transcribed
// 1-indexed. No cage carries a printed total.
const cages = [
  ['R1C1', 'R1C2', 'R2C2', 'R3C2', 'R3C3'],
  ['R1C3', 'R2C3', 'R2C4', 'R3C4'],
  ['R1C4', 'R1C5', 'R2C5', 'R2C6', 'R1C6'],
  ['R3C5', 'R3C6'],
  ['R1C7', 'R1C8', 'R1C9', 'R2C8'],
  ['R3C7', 'R4C7', 'R5C7'],
  ['R3C9', 'R4C9', 'R4C8'],
  ['R5C9', 'R6C9'],
  ['R6C8', 'R6C7', 'R6C6'],
  ['R5C6', 'R4C6', 'R4C5', 'R4C4'],
  ['R5C5', 'R6C5', 'R6C4'],
  ['R5C4', 'R5C3', 'R6C3'],
  ['R4C3', 'R4C2', 'R5C2', 'R5C1'],
  ['R4C1', 'R3C1', 'R2C1'],
  ['R8C1', 'R9C1'],
  ['R9C2', 'R9C3', 'R9C4'],
  ['R8C3', 'R7C3', 'R7C4'],
  ['R8C4', 'R8C5', 'R9C5'],
  ['R9C6', 'R9C7'],
  ['R6C1', 'R6C2'],
];

// n distinct digits drawn from 1-9 reach every integer sum in a contiguous
// range: the smallest n digits (1..n) up to the largest n digits ((10-n)..9).
const minCageSum = n => (n * (n + 1)) / 2;
const maxCageSum = n =>
  Array.from({ length: n }, (_, i) => 9 - i).reduce((a, b) => a + b, 0);

// Collapse a singleton list instead of wrapping it in a redundant Or/And.
const orOrSingle = list => (list.length === 1 ? list[0] : new Or(list));
const andOrSingle = list => (list.length === 1 ? list[0] : new And(list));

const xBranches = [];
for (let x = 10; x <= 99; x++) {
  const perCageSums = cages.map(cells => {
    const n = cells.length;
    const lo = minCageSum(n), hi = maxCageSum(n);
    const sums = [];
    for (let k = Math.max(1, Math.ceil(lo / x)); k * x <= hi; k++) {
      if (k * x >= lo) sums.push(k * x);
    }
    return sums;
  });
  // A cage with no reachable multiple of this x makes the whole branch
  // unsatisfiable; skip building it rather than encoding a dead alternative.
  if (perCageSums.some(sums => sums.length === 0)) continue;
  const cageConstraints = cages.map(
    (cells, i) => orOrSingle(perCageSums[i].map(s => new Cage(s, ...cells))));
  xBranches.push(andOrSingle(cageConstraints));
}

return [
  new Shape('9x9'),
  orOrSingle(xBranches),
];
