// Title: Prime Locations
// Author: Simon Ferre
// Video: https://www.youtube.com/watch?v=o1SGPy1RR68
// Source: https://cracking-the-cryptic.web.app/sudoku/DFHnmmmL9F
//
// Normal sudoku rules apply (standard 3x3 boxes, no extra regions). Every
// outside clue is a Sandwich: the sum of the digits strictly between the 1
// and the 9 in that row/column. The grey line is a thermometer, increasing
// from its bulb at R3C7. The gold line is a single closed 32-cell loop; every
// orthogonally-consecutive pair along it (including the edge that closes the
// loop) must sum to a prime number. The loop and the thermometer's arm both
// pass through R4C7/R5C7/R6C7 -- they are independent constraints that cross
// there, not a shared line.

const geometry = cellGeometry('9x9');
const at = (r, c) => makeCellId(r, c);
const rowCells = (r) => Array.from({ length: 9 }, (_, i) => at(r, i + 1));
const colCells = (c) => Array.from({ length: 9 }, (_, i) => at(i + 1, c));

// Sandwich sums, one per row (left) and one per column (top); values read
// off the outside-clue text overlays.
const rowSums = [13, 13, 6, 9, 0, 29, 2, 13, 2];
const colSums = [21, 25, 11, 0, 35, 23, 13, 4, 18];
const sandwiches = [
  ...rowSums.map((sum, i) =>
    Sandwich.fromCells(sum, rowCells(i + 1), geometry)),
  ...colSums.map((sum, i) =>
    Sandwich.fromCells(sum, colCells(i + 1), geometry)),
];

const thermo = new Thermo('R3C7', 'R4C7', 'R5C7', 'R6C7', 'R7C7');

// Coloured line: closed 32-cell loop. First cell repeated at the end so the
// wrap-around edge (R3C5/R3C6) is included, per Pair's consecutive-pair
// binding.
const colouredLoop = [
  'R3C6', 'R2C6', 'R2C7', 'R2C8', 'R3C8', 'R4C8', 'R4C7', 'R5C7', 'R6C7',
  'R6C8', 'R7C8', 'R8C8', 'R8C7', 'R8C6', 'R7C6', 'R7C5', 'R7C4', 'R8C4',
  'R8C3', 'R8C2', 'R7C2', 'R6C2', 'R6C3', 'R5C3', 'R4C3', 'R4C2', 'R3C2',
  'R2C2', 'R2C3', 'R2C4', 'R3C4', 'R3C5', 'R3C6',
];

const isPrime = (n) => {
  if (n < 2) return false;
  for (let d = 2; d * d <= n; d++) {
    if (n % d === 0) return false;
  }
  return true;
};
const primeSumKey = Pair.fnToKey((a, b) => isPrime(a + b), 9);
const primeLine = new Pair(primeSumKey, 'prime sum', ...colouredLoop);

return [
  new Shape('9x9'),
  ...sandwiches,
  thermo,
  primeLine,
];
