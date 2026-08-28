// Title: (Non-)Prime Square Killer Sudoku
// Author: Scott Strosahl
// Video: https://www.youtube.com/watch?v=YMUpKa-stcM
// Source: https://cracking-the-cryptic.web.app/sudoku/MNhtJ4GJ89

// Standard 9x9 sudoku (default box regions, no givens). Every cage below is
// labelled P/NP/S rather than carrying a numeric total; the label sets two
// things at once (video description): every digit inside the cage has the
// named property, and the cage's total has the named property too.
//   P  (Prime):     digits {2,3,5,7};   totals that are prime
//   NP (Non-Prime): digits {1,4,6,8,9}; totals that are not prime
//   S  (Square):    digits {1,4,9};     totals that are a perfect square
// Cages here are not killer cages: the rules never require distinct digits,
// and two P cages (5 cells) and one S cage (5 cells) outsize their own
// 4- and 3-member domains, so distinct digits are impossible for them.
// Repeats are otherwise governed only by ordinary row/column/box sudoku
// uniqueness.

const isPrime = n => [2, 3, 5, 7, 11, 13, 17, 19, 23, 29, 31, 37, 41, 43]
  .includes(n);
const isSquare = n => Number.isInteger(Math.sqrt(n));

const DOMAIN = {
  P: [2, 3, 5, 7],
  NP: [1, 4, 6, 8, 9],
  S: [1, 4, 9],
};
const HOLDS = { P: isPrime, NP: n => !isPrime(n), S: isSquare };

// Cages transcribed from the payload's `cages` array (label, cells).
const cages = [
  ['NP', ['R1C3', 'R1C4', 'R1C5', 'R1C6']],
  ['S', ['R2C1']],
  ['P', ['R3C1']],
  ['P', ['R2C2', 'R2C3', 'R2C4', 'R2C5']],
  ['P', ['R4C1', 'R4C2']],
  ['NP', ['R6C2', 'R6C3', 'R7C2', 'R8C2']],
  ['P', ['R7C3', 'R8C3', 'R8C4', 'R9C4', 'R9C5']],
  ['S', ['R6C4', 'R6C5', 'R7C4']],
  ['P', ['R5C3', 'R5C4']],
  ['NP', ['R4C4', 'R4C5']],
  ['P', ['R3C6', 'R4C6', 'R5C6', 'R6C6']],
  ['S', ['R2C6', 'R2C7', 'R3C7', 'R4C7', 'R4C8']],
  ['NP', ['R2C8', 'R2C9', 'R3C8']],
  ['P', ['R5C8', 'R6C8']],
  ['NP', ['R5C9', 'R6C9']],
  ['P', ['R6C7', 'R7C7', 'R7C8', 'R7C9']],
  ['NP', ['R8C7', 'R8C8', 'R8C9', 'R9C9']],
];

// Every digit in a cage is restricted to the label's domain.
const cageDigitGivens = cages.flatMap(([label, cells]) =>
  cells.map(cell => new Given(cell, ...DOMAIN[label])));

// The cage total also has the label's property. Disjoin over every
// domain-reachable sum with that property -- `Sum`, not `Cage`, since cage
// digits may repeat (see header note).
const cageTotals = cages
  .filter(([, cells]) => cells.length > 1)
  .map(([label, cells]) => {
    const domain = DOMAIN[label];
    const lo = cells.length * Math.min(...domain);
    const hi = cells.length * Math.max(...domain);
    const targets = [];
    for (let t = lo; t <= hi; t++) if (HOLDS[label](t)) targets.push(t);
    return new Or(targets.map(t => new Sum(t, ...cells)));
  });

return [
  new Shape('9x9'),
  ...cageDigitGivens,
  ...cageTotals,
];
