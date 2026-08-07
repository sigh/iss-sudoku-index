// Title: Minister of Primes
// Author: Mountainfarmer
// Video: https://www.youtube.com/watch?v=mir3Wc54q9k
// Source: https://app.crackingthecryptic.com/sudoku/GjPBFrjthr

// Normal sudoku (default rows/columns/boxes via Shape). One given: R4C2=2.
// White dot: consecutive, adjacent cells only; not all dots are shown, so only
// the drawn ones are encoded (absence implies nothing).
// Green lines/dots: each is one prime number, read left-to-right / top-to-
// bottom along its cells. All 25 primes under 100 (4 one-digit, 21 two-digit)
// appear exactly once across the green lines and dots combined -- there are
// exactly 4 green dots and 21 green lines, matching the two prime-length
// pools one-for-one.
// Box 5's two line segments (R4C4-R5C4 and R5C4-R5C5) share cell R5C4 where
// their strokes touch, but "Box 5 contains two separate lines" means they are
// two independent 2-digit numbers, not one 3-cell number -- encoded as two
// separate entries in primeLines below, not merged.
// Line R3C6-R4C7 is drawn as a genuine diagonal stroke (its endpoints step one
// row and one column at once). R3C6 is both the topmost and leftmost cell of
// the pair, so "left to right and up to down" reading is unambiguous: R3C6
// first, R4C7 second.

const singleDigitPrimes = [2, 3, 5, 7];
const twoDigitPrimes = [
  11, 13, 17, 19, 23, 29, 31, 37, 41, 43, 47,
  53, 59, 61, 67, 71, 73, 79, 83, 89, 97,
];

// Green dots: one cell each, one-digit prime. Cells from the yellowgreen
// filled-circle overlays (0.35-sized, centred on a single cell).
const primeDots = ['R2C5', 'R8C1', 'R7C8', 'R9C9'];

// Green lines: two cells each, two-digit prime, listed [tens cell, ones cell]
// per the rules' reading direction. Cells from the yellowgreen line wayPoints.
const primeLines = [
  ['R7C9', 'R8C9'],
  ['R5C9', 'R6C9'],
  ['R3C9', 'R4C9'],
  ['R1C9', 'R2C9'],
  ['R1C7', 'R1C8'],
  ['R1C5', 'R1C6'],
  ['R1C3', 'R1C4'],
  ['R1C1', 'R1C2'],
  ['R2C1', 'R3C1'],
  ['R4C1', 'R5C1'],
  ['R6C1', 'R7C1'],
  ['R9C1', 'R9C2'],
  ['R9C3', 'R9C4'],
  ['R8C6', 'R9C6'],
  ['R7C7', 'R8C7'],
  ['R3C6', 'R4C7'], // diagonal stroke -- see header note
  ['R5C3', 'R6C3'],
  ['R4C4', 'R5C4'], // box 5, first of the two separate lines
  ['R3C2', 'R3C3'],
  ['R2C7', 'R2C8'],
  ['R5C4', 'R5C5'], // box 5, second of the two separate lines
];

// White (Kropki) consecutive dots. Edge-sized overlays (white fill, black
// border); cells from each overlay's edge-centre position.
const whiteDots = [
  ['R3C3', 'R4C3'],
  ['R5C8', 'R6C8'],
  ['R7C5', 'R7C6'],
];

// Each line's (tens, ones) pair must read as one of the 21 two-digit primes.
const isTwoDigitPrime = (tens, ones) => twoDigitPrimes.includes(10 * tens + ones);
const twoDigitPrimeKey = Pair.fnToKey(isTwoDigitPrime, 9);

// No two lines may read the same two-digit number. With 21 lines and 21
// candidate primes, forbidding repeats forces every prime to appear exactly
// once (pigeonhole). Two digit pairs (a,b) and (c,d) in [1,9] give the same
// number 10a+b=10c+d only when a=c and b=d (a mismatch of >=1 in the tens
// digit is worth >=10, which no single-digit ones difference can offset), so
// "differ" is an Or of "tens differ" or "ones differ" -- each a 2-cell
// AllDifferent.
const distinctPrimeLines = [];
for (let i = 0; i < primeLines.length; i++) {
  for (let j = i + 1; j < primeLines.length; j++) {
    const [tensI, onesI] = primeLines[i];
    const [tensJ, onesJ] = primeLines[j];
    distinctPrimeLines.push(new Or([
      new AllDifferent(tensI, tensJ),
      new AllDifferent(onesI, onesJ),
    ]));
  }
}

return [
  new Shape('9x9'),
  new Given('R4C2', 2),

  ...whiteDots.map(([a, b]) => new WhiteDot(a, b)),

  // Each dot cell holds a one-digit prime; AllDifferent over exactly 4 cells
  // and 4 candidate values forces all four primes to appear once each.
  ...primeDots.map(cell => new Given(cell, ...singleDigitPrimes)),
  new AllDifferent(...primeDots),

  ...primeLines.map(([a, b]) => new Pair(twoDigitPrimeKey, 'two-digit prime', a, b)),
  ...distinctPrimeLines,
];
