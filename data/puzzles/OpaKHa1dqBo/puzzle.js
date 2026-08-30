// Title: A Superb Puzzle for Mathematicians
// Author: Saecl
// Video: https://www.youtube.com/watch?v=OpaKHa1dqBo
// Source: https://cracking-the-cryptic.web.app/sudoku/h9tNH3Gh6p
//
// Normal sudoku: 9x9 grid, standard 3x3 boxes, digits 1-9 once each in every
// row, column and box.
//
// Each drawn cage sums to a prime number; digits may repeat within a cage
// (per the video description, so no AllDifferent inside a cage). Cages carry
// no printed total. Cell lists below are transcribed from the drawn cage
// outlines. Not every cell belongs to a cage.

const cages = [
  ['R9C9'],
  ['R9C8'],
  ['R9C7'],
  ['R8C4'],
  ['R8C6'],
  ['R8C5', 'R9C5'],
  ['R7C1'],
  ['R8C1', 'R9C1'],
  ['R8C2', 'R9C2'],
  ['R8C3', 'R9C3'],
  ['R7C2', 'R7C3', 'R7C4', 'R7C5', 'R7C6', 'R7C7', 'R7C8', 'R7C9'],
  ['R8C7', 'R8C8', 'R8C9'],
  ['R6C7', 'R6C8', 'R6C9'],
  ['R5C9'],
  ['R5C8', 'R5C7', 'R4C7'],
  ['R4C9'],
  ['R4C8', 'R3C8'],
  ['R3C9', 'R2C9'],
  ['R1C8'],
  ['R1C6', 'R1C7', 'R2C7', 'R2C6'],
  ['R3C6', 'R3C5'],
  ['R3C4', 'R2C4', 'R1C4'],
  ['R2C3', 'R1C3'],
  ['R1C2'],
  ['R2C1', 'R3C1', 'R4C1', 'R5C1', 'R6C1'],
  ['R3C2', 'R4C2'],
  ['R5C2', 'R6C2'],
  ['R4C3', 'R5C3', 'R6C3'],
  ['R6C4', 'R6C6', 'R6C5'],
];

const isPrime = (n) => {
  if (n < 2) return false;
  for (let d = 2; d * d <= n; d++) {
    if (n % d === 0) return false;
  }
  return true;
};

// For each cage, every total in its achievable range [size, 9*size] that is
// prime is a candidate; the cage's sum must be one of them. Disjoin over a
// Sum for each candidate prime total, since Sum (unlike Cage) does not also
// force the cells distinct -- this also covers single-cell cages (Sum with
// one cell just restricts that digit).
const primeCageConstraint = (cells) => {
  const size = cells.length;
  const primeTotals = [];
  for (let t = size; t <= 9 * size; t++) {
    if (isPrime(t)) primeTotals.push(t);
  }
  return new Or(primeTotals.map((t) => new Sum(t, ...cells)));
};

return [
  new Shape('9x9'),
  new Given('R1C1', 5),
  new Given('R1C5', 4),
  new Given('R1C9', 2),
  new Given('R2C2', 8),
  new Given('R2C5', 1),
  new Given('R2C8', 7),
  new Given('R3C3', 9),
  new Given('R3C7', 5),
  new Given('R4C4', 4),
  new Given('R4C6', 8),
  new Given('R5C5', 2),
  new Given('R9C4', 7),
  new Given('R9C6', 1),
  ...cages.map(primeCageConstraint),
];
