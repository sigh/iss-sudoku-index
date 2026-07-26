// Title: Prime Time
// Author: Scott Williams
// Video: https://www.youtube.com/watch?v=pLNW9fJDCQU
// Source: https://sudokupad.app/JnpJ7TpdPd

// Normal sudoku rules apply (rows, columns, boxes).
// Red-line digits must alternate between prime (2,3,5,7) and composite
// (4,6,8,9). The digit 1 is neither, so it is excluded from red-line cells
// by the same adjacent-pair check: any pair touching a 1 can never contain
// one prime and one composite.
// The two digits of each reading cage, taken in the drawn left-to-right or
// top-to-bottom order, form a two-digit prime. The rules do not say cage
// digits must differ, so no distinctness is encoded for them.
// White dots: consecutive digits. Black dots: 2:1 ratio.
// The circled quadruple's digits must appear somewhere in its surrounding
// 2x2 block.

const isPrimeDigit = v => v === 2 || v === 3 || v === 5 || v === 7;
const isCompositeDigit = v => v === 4 || v === 6 || v === 8 || v === 9;

// Trial division is enough for the small range of two-digit numbers (11-99)
// that digits 1-9 can form.
const isTwoDigitPrime = n => {
  if (n < 2) return false;
  for (let d = 2; d * d <= n; d++) {
    if (n % d === 0) return false;
  }
  return true;
};

const alternatingKey = Pair.fnToKey(
  (a, b) => (isPrimeDigit(a) && isCompositeDigit(b)) ||
    (isCompositeDigit(a) && isPrimeDigit(b)),
  9);

// Directional: a is the earlier (tens) cell in the drawn reading order, b is
// the later (units) cell.
const readingPrimeKey = Pair.fnToKey((a, b) => isTwoDigitPrime(10 * a + b), 9);

// Each red line is one drawn stroke; the two strokes crossing at R7C5 are
// separate clues that happen to share that cell.
const redLines = [
  ['R4C1', 'R4C2', 'R4C3', 'R4C4', 'R3C5', 'R4C6', 'R4C7', 'R4C8', 'R4C9'],
  ['R5C3', 'R5C2', 'R5C1', 'R6C1', 'R7C1', 'R8C1', 'R9C1', 'R9C2', 'R9C3'],
  ['R9C7', 'R8C7', 'R7C7', 'R6C7', 'R6C8', 'R6C9', 'R7C9', 'R8C9', 'R8C8'],
  ['R1C2', 'R1C1', 'R2C2', 'R3C3', 'R2C3'],
  ['R6C4', 'R7C5', 'R8C6'],
  ['R8C4', 'R7C5', 'R6C6'],
];
const redLineConstraints = redLines.map(
  (cells, i) => new Pair(
    alternatingKey, `Prime/composite line ${i + 1}`, ...cells));

// Cell order matches the drawn reading direction (tens digit first, units
// digit second), taken from the cage cell order in the source payload.
const readingCages = [
  ['R6C2', 'R6C3'],
  ['R5C5', 'R6C5'],
  ['R7C5', 'R8C5'],
  ['R1C4', 'R2C4'],
  ['R9C3', 'R9C4'],
];
const readingCageConstraints = readingCages.map(
  (cells, i) => new Pair(
    readingPrimeKey, `Reading-prime cage ${i + 1}`, ...cells));

// Each dot is a separate drawn mark; keep them as separate two-cell clues.
const whiteDots = [
  new WhiteDot('R5C1', 'R5C2'),
  new WhiteDot('R5C2', 'R5C3'),
  new WhiteDot('R4C7', 'R4C8'),
  new WhiteDot('R7C7', 'R8C7'),
  new WhiteDot('R8C7', 'R8C8'),
  new WhiteDot('R6C7', 'R6C8'),
  new WhiteDot('R1C8', 'R1C9'),
];

const blackDots = [
  new BlackDot('R4C1', 'R4C2'),
  new BlackDot('R4C3', 'R4C4'),
];

return [
  new Shape('9x9'),
  ...redLineConstraints,
  ...readingCageConstraints,
  ...whiteDots,
  ...blackDots,
  new Quad('R1C7', 4, 6, 8, 9),
];
