// Title: Prime Time
// Author: James Kopp
// Video: https://www.youtube.com/watch?v=tqLfPm8fyQI
// Source: https://app.crackingthecryptic.com/sudoku/fhLrBFpQFF

// Blue lines: equal sum per box the line passes through (RegionSumLine),
// plus every consecutive pair of cells on the line sums to a prime (a Pair
// over the line's drawn cell order). Cages: two-cell cages, digits distinct
// (AllDifferent, standard cage semantics for a cage with no printed total),
// and every cage's sum equals every other cage's sum (EqualSum) per "the
// digits in each cage sum to the same total (which is to be determined)".

const isPrime = new Set([2, 3, 5, 7, 11, 13, 17]);
const primeSum = Pair.fnToKey((a, b) => isPrime.has(a + b), 9);

// Open lines: the drawn order works directly for both RegionSumLine and the
// prime-sum Pair.
const openLines = [
  ['R2C8', 'R3C7', 'R4C8'],
  ['R1C6', 'R2C6', 'R3C6', 'R4C7', 'R5C7', 'R6C7'],
  ['R6C9', 'R7C9', 'R8C9'],
  ['R7C6', 'R8C6', 'R9C7'],
  ['R7C5', 'R8C4', 'R8C3', 'R9C3'],
  ['R7C1', 'R7C2', 'R7C3', 'R6C4', 'R6C5', 'R6C6'],
];

// The 7th line is a closed loop: R2C3-R2C4-R3C5-R4C5-R5C4-R5C3-R4C2-R3C2-R2C3.
// The prime-sum Pair needs the closing edge, so its list repeats the first
// cell (closed-loop convention for consecutive-pair classes). RegionSumLine
// instead splits its cell list by walking it in box-visit order, so a
// repeated first cell would split the top-left-box visit into two
// contradictory single-/double-cell segments instead of the one true
// (wrap-spanning) R3C2/R2C3 pair; this list is rotated to start at R2C4 so
// that visit lands unbroken at the end, without repeating any cell.
const closedLoopForPairs = [
  'R2C3', 'R2C4', 'R3C5', 'R4C5', 'R5C4', 'R5C3', 'R4C2', 'R3C2', 'R2C3',
];
const closedLoopForRegionSum = [
  'R2C4', 'R3C5', 'R4C5', 'R5C4', 'R5C3', 'R4C2', 'R3C2', 'R2C3',
];

const cages = [
  ['R1C5', 'R1C6'],
  ['R4C7', 'R4C8'],
  ['R7C8', 'R7C9'],
  ['R6C4', 'R7C4'],
  ['R4C4', 'R5C4'],
  ['R5C1', 'R5C2'],
];

return [
  new Shape('9x9'),
  ...openLines.map(cells => new RegionSumLine(...cells)),
  new RegionSumLine(...closedLoopForRegionSum),
  ...openLines.map(cells => new Pair(primeSum, 'adjacent sum prime', ...cells)),
  new Pair(primeSum, 'adjacent sum prime', ...closedLoopForPairs),
  ...cages.map(cells => new AllDifferent(...cells)),
  new EqualSum(...cages),
];
