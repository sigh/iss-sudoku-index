// Title: Primal Instinct
// Author: Agent
// Video: https://www.youtube.com/watch?v=GrxpRaOBDHo
// Source: https://app.crackingthecryptic.com/sudoku/jfbnd2TR6H

// Normal sudoku rules apply. Digits in cages cannot repeat and must sum to a
// prime number (1 is not prime, per the rules text). No cage carries a
// printed total, so every candidate prime sum is a disjunct rather than a
// single Cage target.
//
// A cage of L distinct digits drawn from 1-9 can realise every integer sum
// between its L smallest and L largest digits (swap one digit at a time to
// move the sum by 1), so scanning that contiguous range finds every
// candidate prime total -- no need to hand-enumerate combinations.
const isPrime = (n) => {
  if (n < 2) return false;
  for (let d = 2; d * d <= n; d++) if (n % d === 0) return false;
  return true;
};
const primeTotalsForSize = (cells) => {
  const L = cells.length;
  const min = (L * (L + 1)) / 2;
  const max = Array.from({ length: L }, (_, i) => 9 - i)
    .reduce((a, b) => a + b, 0);
  const primes = [];
  for (let s = min; s <= max; s++) if (isPrime(s)) primes.push(s);
  return primes;
};

// Cage cell lists, hand-transcribed from the drawn cage outlines (none
// carries a printed total). 6 cells are not covered by any cage (R2C5,
// R2C6, R5C4, R5C5, R9C7, R9C8) and so get only the default row/column/box
// constraints.
const cages = [
  ['R9C2'],
  ['R9C1'],
  ['R8C4', 'R8C5', 'R8C6'],
  ['R7C6', 'R7C7', 'R7C8'],
  ['R7C9', 'R8C7', 'R8C8', 'R8C9', 'R9C9'],
  ['R1C9', 'R2C9', 'R3C9', 'R4C9'],
  ['R5C9', 'R6C9'],
  ['R6C7', 'R6C8'],
  ['R4C2'],
  ['R4C1'],
  ['R5C1'],
  ['R6C1', 'R6C2', 'R6C3'],
  ['R4C3', 'R5C2', 'R5C3'],
  ['R6C4', 'R6C5', 'R6C6'],
  ['R5C7', 'R5C8'],
  ['R4C7', 'R4C8'],
  ['R7C5'],
  ['R7C1', 'R7C2', 'R7C3', 'R7C4'],
  ['R1C3'],
  ['R8C1', 'R8C2', 'R8C3', 'R9C3', 'R9C4', 'R9C5', 'R9C6'],
  ['R4C6', 'R5C6'],
  ['R4C4', 'R4C5'],
  ['R2C1', 'R2C2', 'R3C1'],
  ['R1C1', 'R1C2'],
  ['R2C3', 'R2C4', 'R3C2', 'R3C3', 'R3C4'],
  ['R1C4', 'R1C5', 'R1C6', 'R1C7'],
  ['R1C8', 'R2C8', 'R3C8'],
  ['R3C5', 'R3C6'],
  ['R2C7', 'R3C7'],
];

// Each cage: distinct digits (Cage) whose total is one of that cage's
// candidate primes (Or). A single-cell cage still constrains its digit to
// {2,3,5,7} this way, since its "sum" is just the one digit.
const cageConstraints = cages.map(
  (cells) => new Or(primeTotalsForSize(cells).map((p) => new Cage(p, ...cells)))
);

return [
  new Shape('9x9'),
  ...cageConstraints,
];
