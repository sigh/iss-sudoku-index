// Title: (untitled)
// Author: Jeremy Butler
// Video: https://www.youtube.com/watch?v=vI2s5EB8hc4
// Source: https://cracking-the-cryptic.web.app/sudoku/2F3LGLT93p
//
// Normal sudoku rules apply (9x9, standard 3x3 boxes -- the payload's
// `regions` array is the default box layout). No givens. Thermo sudoku
// rules apply: digits along a grey line increase strictly from the bulb.
// Coloured lines are palindromes. Of the red and purple lines, one's sum
// is more than 35, the other's less than 15; the video description does
// not say which line takes which total, so both assignments are encoded
// as a disjunction. The yellow-green "accolade message" marks (per the
// video description: "Ignore the green shapes...") and the six grey
// bulb-marker circles are decoration with no rule and are not encoded.

// Grey thermo lines (drawn colour #CFCFCF). Each line is listed bulb-first;
// some were drawn tip-first (bulb as the last waypoint) and are reversed
// here so the bulb -- marked by a small grey circle -- is always first.
const thermos = [
  ['R1C1', 'R2C1', 'R3C1', 'R4C1', 'R5C1'],          // drawn bulb-first
  ['R1C5', 'R2C4', 'R3C3', 'R2C2'],                  // drawn tip-first, reversed
  ['R5C5', 'R4C5', 'R3C5', 'R2C5'],                  // drawn tip-first, reversed
  ['R3C9', 'R2C9', 'R1C9'],                          // drawn tip-first, reversed
  ['R6C6', 'R5C6', 'R4C7', 'R4C8', 'R5C9'],          // drawn tip-first, reversed
  ['R7C6', 'R8C6', 'R9C7', 'R9C8', 'R8C9', 'R7C9', 'R7C8'], // drawn bulb-first
];

// Coloured palindrome lines. Palindrome order is direction-independent, so
// no reversal is needed here.
const blueLine = ['R3C5', 'R2C6', 'R1C6', 'R2C7', 'R3C8', 'R4C9'];
const redLine = ['R8C4', 'R7C4', 'R6C4', 'R6C3', 'R6C2'];
const purpleLine = ['R5C3', 'R6C3', 'R7C3', 'R7C4', 'R7C5'];

// "Sum in [lo, hi]" as a disjunction of exact-sum constraints (no native
// inequality-sum class for a range this narrow; only two lines need it, so
// enumerating candidate totals stays small).
const sumInRange = (lo, hi, cells) =>
  new Or(Array.from({ length: hi - lo + 1 }, (_, i) => new Sum(lo + i, ...cells)));

// Both 5-cell lines have sum range [5, 45] (2*end + 2*second + middle).
// The rules leave open which of red/purple is the high line and which is
// the low line, so encode both assignments (see "two candidates means
// disjunction").
const redHighPurpleLow = new And([
  sumInRange(36, 45, redLine),
  sumInRange(5, 14, purpleLine),
]);
const redLowPurpleHigh = new And([
  sumInRange(5, 14, redLine),
  sumInRange(36, 45, purpleLine),
]);
const redPurpleSums = new Or([redHighPurpleLow, redLowPurpleHigh]);

return [
  new Shape('9x9'),
  ...thermos.map(cells => new Thermo(...cells)),
  new Palindrome(...blueLine),
  new Palindrome(...redLine),
  new Palindrome(...purpleLine),
  redPurpleSums,
];
