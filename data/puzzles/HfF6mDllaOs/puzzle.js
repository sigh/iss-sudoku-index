// Title: Greater-Than Killer Sudoku
// Author: Unknown
// Video: https://www.youtube.com/watch?v=HfF6mDllaOs
// Source: https://www.dailykillersudoku.com/puzzle/17107

// Normal sudoku (default row/col/box AllDifferent). Every cage forbids
// repeated digits inside it; a cage with a printed total also sums to it.
// Five small marks drawn on cage borders relate two adjacent cages' sums:
// "=" for equal sums, and a chevron ("<"/"^"; no ">" or "v" occurs here)
// whose point aims at the smaller of the two sums, for a strict-order
// relation.
//
// `Cage(0, ...)` emits only the AllDifferent when no total is printed, so
// every cage -- totalled or not -- is named once below.

const totalledCages = [
  [8, 'R1C3', 'R1C4'],
  [17, 'R1C5', 'R1C6', 'R1C7'],
  [11, 'R1C8', 'R1C9'],
  [6, 'R2C4', 'R2C5'],
  [15, 'R3C4', 'R3C5'],
  [11, 'R2C6', 'R3C6'],
  [9, 'R2C7', 'R3C7'],
  [13, 'R2C8', 'R3C8'],
  [8, 'R2C9', 'R3C9', 'R4C9'],
  [11, 'R3C1', 'R4C1'],
  [13, 'R4C2', 'R5C2'],
  [42, 'R4C4', 'R4C5', 'R4C6', 'R5C4', 'R5C5', 'R5C6', 'R6C4', 'R6C5'],
  [22, 'R5C7', 'R5C8', 'R5C9'],
  [5, 'R6C2', 'R6C3'],
  [23, 'R6C6', 'R6C7', 'R6C8', 'R7C6', 'R8C6'],
  [15, 'R7C7', 'R7C8', 'R8C7'],
  [8, 'R6C9', 'R7C9'],
  [19, 'R8C8', 'R8C9', 'R9C8', 'R9C9'],
  [15, 'R9C2', 'R9C3', 'R9C4'],
  [17, 'R9C6', 'R9C7'],
];

// Cages 4, 6, 20, 21, 25, 26 and 28 (a 1-based numbering of the cages
// above and below, cage 1 first) are named below and appear in the
// EqualSum / inequality constraints instead of here; each still needs its
// own AllDifferent, which those constraints do not provide, so each gets
// its own Cage(0, ...) alongside them.
const noTotalCages = [
  ['R4C7', 'R4C8'], // cage 15
  ['R4C3', 'R5C3'], // cage 16
  ['R5C1', 'R6C1', 'R7C1'], // cage 18
];

// sum(biggerCells) - sum(smallerCells) is a strictly positive integer, but
// no fixed offset is given, so disjoin over every value it can feasibly
// take: 1 up to the largest gap between the bigger cage's per-cell max
// (9, 8, 7, ...) and the smaller cage's per-cell min (1, 2, 3, ...).
function maxDiff(biggerLen, smallerLen) {
  const maxSum = [...Array(biggerLen)].reduce((s, _, i) => s + (9 - i), 0);
  const minSum = [...Array(smallerLen)].reduce((s, _, i) => s + (1 + i), 0);
  return maxSum - minSum;
}

function cageGreaterThan(biggerCells, smallerCells) {
  const bound = maxDiff(biggerCells.length, smallerCells.length);
  return new Or(Array.from({ length: bound }, (_, i) => i + 1).map(
    d => new Sum(d, ...biggerCells, ...smallerCells.map(c => [c, -1]))));
}

const cage4 = ['R1C1', 'R1C2', 'R2C1', 'R2C2'];
const cage6 = ['R2C3', 'R3C2', 'R3C3'];
const cage20 = ['R7C2', 'R7C3'];
const cage21 = ['R7C5', 'R8C5', 'R9C5'];
const cage25 = ['R8C2', 'R8C3'];
const cage26 = ['R7C4', 'R8C4'];
const cage28 = ['R8C1', 'R9C1'];
const relationCages = [cage4, cage6, cage20, cage21, cage25, cage26, cage28];

return [
  new Shape('9x9'),

  ...totalledCages.map(([sum, ...cells]) => new Cage(sum, ...cells)),
  ...noTotalCages.map(cells => new Cage(0, ...cells)),
  ...relationCages.map(cells => new Cage(0, ...cells)),

  // "<" mark between R2C2 and R2C3, point left: cage 4 (R1C1,R1C2,R2C1,
  // R2C2) is smaller, i.e. cage 4 < cage 6 (R2C3,R3C2,R3C3).
  cageGreaterThan(cage6, cage4),

  // "=" mark between R7C3 and R7C4: cage 20 (R7C2,R7C3) sum equals cage 26
  // (R7C4,R8C4) sum.
  new EqualSum(cage20, cage26),

  // "<" mark between R7C4 and R7C5, point left: cage 26 (R7C4,R8C4) is
  // smaller, i.e. cage 26 < cage 21 (R7C5,R8C5,R9C5).
  cageGreaterThan(cage21, cage26),

  // "^" mark between R7C2 and R8C2, point up: cage 20 (R7C2,R7C3) is
  // smaller, i.e. cage 20 < cage 25 (R8C2,R8C3).
  cageGreaterThan(cage25, cage20),

  // "=" mark between R8C1 and R8C2: cage 28 (R8C1,R9C1) sum equals cage 25
  // (R8C2,R8C3) sum.
  new EqualSum(cage28, cage25),
];
