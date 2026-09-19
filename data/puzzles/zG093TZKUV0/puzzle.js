// Title: Greater-Than Killer Sudoku
// Author: Unknown
// Video: https://www.youtube.com/watch?v=zG093TZKUV0
// Source: https://www.dailykillersudoku.com/puzzle/17093

// Normal sudoku (default row/col/box AllDifferent). Every cage forbids
// repeated digits inside it; a cage with a printed total also sums to it.
// Cage geometry and totals below are the publisher's own decoded cages (all
// 31 match the video frame's printed totals exactly). Five small marks drawn
// on cage borders relate two adjacent cages' sums -- the publisher's decoder
// does not carry these, so they are read off the video frame: "=" for equal
// sums, and a chevron ("^"/"v"/"<"; no ">" occurs here) whose point aims at
// the smaller of the two sums, for a strict-order relation.
//
// `Cage(0, ...)` emits only the AllDifferent when no total is printed, so
// every cage -- totalled or not -- is named once below.

// Cages 24 and 14 each carry a printed total AND name one end of a relation
// mark below, so their cells are pulled out to consts and spread into their
// totalledCages entries instead of being duplicated.
const cage24 = ['R7C1', 'R7C2', 'R8C1', 'R8C2'];
const cage14 = ['R4C6', 'R5C4', 'R5C5', 'R5C6', 'R6C4'];

const totalledCages = [
  [4, 'R1C1', 'R1C2'],
  [11, 'R1C6', 'R1C7'],
  [13, 'R1C8', 'R1C9'],
  [19, 'R2C1', 'R2C2', 'R3C2'],
  [16, 'R2C3', 'R3C3', 'R4C3'],
  [4, 'R2C4', 'R2C5'],
  [9, 'R2C6', 'R3C6'],
  [20, 'R2C7', 'R3C7', 'R4C7', 'R5C7'],
  [18, 'R2C8', 'R2C9', 'R3C8', 'R3C9'],
  [11, 'R3C1', 'R4C1', 'R4C2'],
  [13, 'R3C4', 'R4C4'],
  [10, 'R4C8', 'R5C8'],
  [13, 'R5C1', 'R6C1'],
  [10, 'R5C2', 'R6C2'],
  [12, 'R6C5', 'R7C5'],
  [12, 'R6C7', 'R7C7', 'R8C7'],
  [21, ...cage24],
  [23, ...cage14],   // cage 14: printed total 23, and also carries a relation mark
  [13, 'R7C4', 'R8C4'],
  [14, 'R7C8', 'R8C8', 'R8C9'],
  [21, 'R9C5', 'R9C6', 'R9C7'],
];

// Cages 13, 14, 16, 19, 21, 23 and 27 are named below and appear in the
// EqualSum / inequality constraints instead of here; each still needs its
// own AllDifferent, which those constraints do not provide, so each gets
// its own Cage(0, ...) alongside them. Cage 24 above already got its
// AllDifferent from its totalledCages entry.
const noTotalCages = [
  ['R1C3', 'R1C4', 'R1C5'], // cage 2
  ['R9C1', 'R9C2'],         // cage 28
  ['R9C3', 'R9C4'],         // cage 29
  ['R9C8', 'R9C9'],         // cage 31
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

const cage13 = ['R3C5', 'R4C5'];
const cage16 = ['R4C9', 'R5C9'];
const cage19 = ['R5C3', 'R6C3', 'R7C3', 'R8C3'];
const cage21 = ['R6C6', 'R7C6'];
const cage23 = ['R6C8', 'R6C9', 'R7C9'];
const cage26 = ['R7C8', 'R8C8', 'R8C9'];
const cage27 = ['R8C5', 'R8C6'];
// cage 14 and cage 24 carry BOTH a printed total and a relation mark: they get
// their Cage(sum, ...) from totalledCages above, so they are not repeated here.
const relationCages = [cage13, cage16, cage19, cage21, cage23, cage27];

return [
  new Shape('9x9'),

  ...totalledCages.map(([sum, ...cells]) => new Cage(sum, ...cells)),
  ...noTotalCages.map(cells => new Cage(0, ...cells)),
  ...relationCages.map(cells => new Cage(0, ...cells)),

  // "=" mark below R5C9/above R6C9: cage 16 sum equals cage 23 sum.
  new EqualSum(cage16, cage23),

  // "<" mark between R5C3 and R5C4, point left: cage 19 is smaller, i.e.
  // cage 19 < cage 14.
  cageGreaterThan(cage14, cage19),

  // "<" mark between R7C2 and R7C3, point left: cage 24 is smaller, i.e.
  // cage 24 < cage 19.
  cageGreaterThan(cage19, cage24),

  // "^" mark below R6C8/above R7C8, point up: cage 23 is smaller, i.e.
  // cage 23 < cage 26.
  cageGreaterThan(cage26, cage23),

  // "v" mark below R7C6/above R8C6, point down: cage 27 is smaller, i.e.
  // cage 27 < cage 21.
  cageGreaterThan(cage21, cage27),
];
