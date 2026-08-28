// Title: Feb 20, '22: Number 5 Is Alive
// Author: clover!
// Video: https://www.youtube.com/watch?v=HaK08DW5pJE
// Source: https://tinyurl.com/2p982wa7

// Normal sudoku rules apply. Digits in a cage may not repeat and must sum to
// a value ending in 5 (5, 15, 25, ...). No cage totals are printed; the rule
// itself is the only constraint on each cage's sum.
//
// Cage sums here are not a single fixed number, so each cage is built as an
// `Or` over every sum ending in 5 that n distinct digits from 1-9 can reach
// (min = 1+2+...+n, max = 9+8+...+(9-n+1)): `Cage` already enforces
// all-different, and `Or` of one `Cage` per achievable total is exactly
// "distinct digits summing to a value ending in 5" with nothing loosened or
// tightened.
const cageSumOptions = (n) => {
  const min = (n * (n + 1)) / 2;
  const max = n * 9 - (n * (n - 1)) / 2;
  const sums = [];
  for (let s = min; s <= max; s++) {
    if (s % 10 === 5) sums.push(s);
  }
  return sums;
};

const endsInFiveCage = (...cells) =>
  new Or(cageSumOptions(cells.length).map((s) => new Cage(s, ...cells)));

// Cages, from the payload's `killercage` array (no printed totals).
const cages = [
  ['R4C4', 'R5C4'],
  ['R4C5', 'R4C6'],
  ['R5C6', 'R6C6'],
  ['R6C4', 'R6C5'],
  ['R2C4', 'R3C4'],
  ['R2C6', 'R3C6'],
  ['R7C4', 'R8C4'],
  ['R7C6', 'R8C6'],
  ['R1C3', 'R1C4', 'R1C5', 'R1C6', 'R2C3'],
  ['R8C7', 'R9C4', 'R9C5', 'R9C6', 'R9C7'],
  ['R1C7', 'R1C8'],
  ['R9C2', 'R9C3'],
  ['R6C7', 'R7C7'],
  ['R3C3', 'R4C3'],
  ['R2C7', 'R3C7', 'R3C8'],
  ['R7C2', 'R7C3', 'R8C3'],
  ['R1C9', 'R2C9', 'R3C9', 'R4C9', 'R5C9'],
  ['R5C1', 'R6C1', 'R7C1', 'R8C1', 'R9C1'],
];

return [
  new Shape('9x9'),

  // Givens, from the payload's grid values.
  new Given('R1C5', 6),
  new Given('R2C3', 3),
  new Given('R2C9', 7),
  new Given('R3C5', 8),
  new Given('R3C8', 6),
  new Given('R4C5', 2),
  new Given('R5C3', 9),
  new Given('R5C4', 1),
  new Given('R5C6', 6),
  new Given('R5C7', 7),
  new Given('R6C5', 7),
  new Given('R7C2', 8),
  new Given('R7C5', 3),
  new Given('R8C1', 1),
  new Given('R8C7', 3),
  new Given('R9C5', 1),

  ...cages.map((cells) => endsInFiveCage(...cells)),
];
