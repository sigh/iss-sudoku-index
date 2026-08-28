// Title: Prime Killer Sudoku
// Author: Johannes Quack
// Video: https://www.youtube.com/watch?v=Go4KrWZuma8
// Source: https://cracking-the-cryptic.web.app/sudoku/LBnPRnjh7p
//
// Normal sudoku (rows/columns/3x3 boxes) plus: the grid is partitioned into
// cages with no printed total; every cage's digits sum to a prime, and the
// full set of cage sums includes every prime up to and including 43. A cage
// with no printed total is a standard killer cage (distinct digits; a
// one-cell cage adds no such constraint on its own).
//
// The two legend columns right of the grid (payload columns 10-11, printing
// the 14 target primes) are decoration illustrating the rule text and are
// not part of the playable 9x9 grid, so they are not modelled.

const TARGET_PRIMES = [2, 3, 5, 7, 11, 13, 17, 19, 23, 29, 31, 37, 41, 43];

// Feasible sum range for `size` pairwise-distinct digits drawn from 1-9:
// smallest `size` digits vs largest `size` digits. Pure arithmetic on the
// drawn cage sizes, not a puzzle-specific deduction.
function cageSumRange(size) {
  const min = size * (size + 1) / 2;
  const max = size * 9 - size * (size - 1) / 2;
  return [min, max];
}

// Cages transcribed from the puzzle's drawn cage geometry, in payload order.
// None carries a printed total.
const CAGES = [
  ['R8C3', 'R9C3', 'R9C2', 'R9C1', 'R8C1', 'R7C1'],
  ['R7C2', 'R8C2'],
  ['R7C3'],
  ['R5C4', 'R5C3', 'R5C2', 'R5C1'],
  ['R4C1'],
  ['R4C2', 'R4C3', 'R4C4', 'R4C5', 'R4C6', 'R4C7', 'R4C8', 'R4C9'],
  ['R5C5'],
  ['R5C6', 'R5C7', 'R5C8', 'R5C9'],
  ['R6C1', 'R6C2', 'R6C3', 'R6C4', 'R6C5', 'R6C6', 'R6C7'],
  ['R7C4', 'R8C4', 'R9C4'],
  ['R7C5'],
  ['R8C5'],
  ['R9C5'],
  ['R9C6'],
  ['R8C6', 'R7C6'],
  // The source's cage list groups R1C3 and R2C2 together, but they are not
  // orthogonally adjacent -- the only one of the 34 drawn cages that isn't a
  // connected region. Modelled as the two separate single-cell cages the
  // connectivity implies.
  ['R1C3'],
  ['R2C2'],
  ['R3C1', 'R3C2', 'R3C3'],
  ['R1C2', 'R1C1', 'R2C1'],
  ['R2C3', 'R2C4'],
  ['R1C5', 'R2C5', 'R3C5', 'R2C6'],
  ['R1C4'],
  ['R3C4'],
  ['R3C6'],
  ['R1C6'],
  ['R1C7', 'R2C7'],
  ['R1C8'],
  ['R1C9', 'R2C9', 'R2C8', 'R3C8', 'R3C7', 'R3C9'],
  ['R6C8'],
  ['R6C9', 'R7C9'],
  ['R7C7', 'R8C7', 'R9C7'],
  ['R7C8', 'R8C8'],
  ['R8C9'],
  ['R9C8'],
  ['R9C9'],
];

const cageConstraints = [];
// Per-cage: distinct digits (a killer cage with no total), and the cage's
// sum is one of the primes its size can actually reach.
for (const cells of CAGES) {
  if (cells.length > 1) cageConstraints.push(new AllDifferent(...cells));
  const [min, max] = cageSumRange(cells.length);
  const feasible = TARGET_PRIMES.filter(p => p >= min && p <= max);
  cageConstraints.push(
    new Or(feasible.map(p => new Sum(p, ...cells))));
}

// Coverage: each of the 14 target primes must be realised by at least one
// cage. Restricted to the cages whose size can reach that prime (same
// cageSumRange arithmetic); an infeasible cage would just contribute an
// unsatisfiable disjunct.
const coverageConstraints = TARGET_PRIMES.map(p => {
  const candidates = CAGES.filter(cells => {
    const [min, max] = cageSumRange(cells.length);
    return p >= min && p <= max;
  });
  return new Or(candidates.map(cells => new Sum(p, ...cells)));
});

return [
  new Shape('9x9'),

  // Givens -- transcribed from the drawn grid.
  new Given('R3C1', 7),
  new Given('R4C4', 5),
  new Given('R6C2', 8),
  new Given('R8C3', 9),
  new Given('R8C7', 6),

  ...cageConstraints,
  ...coverageConstraints,
];
