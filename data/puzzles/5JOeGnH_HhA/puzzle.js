// Title: Greater-Than Killer Sudoku
// Author: Unknown
// Video: https://www.youtube.com/watch?v=5JOeGnH_HhA
// Source: https://www.dailykillersudoku.com/puzzle/17067

// Normal sudoku (default row/col/box AllDifferent). Every cage forbids
// repeated digits inside it; a cage with a printed total also sums to it.
// Six small marks drawn on cage borders relate two adjacent cages' sums:
// "=" for equal sums, and a chevron ("^"/"v"/">"; no "<" occurs here) whose
// point aims at the smaller of the two sums, for a strict-order relation.
//
// `Cage(0, ...)` emits only the AllDifferent when no total is printed, so
// every cage -- totalled or not -- is named once below.

const totalledCages = [
  [3, 'R1C1', 'R1C2'],
  [9, 'R2C1', 'R2C2'],
  [28, 'R1C4', 'R1C5', 'R1C6', 'R2C4', 'R3C4'],
  [4, 'R1C7', 'R2C7'],
  [15, 'R1C8', 'R2C8'],
  [16, 'R3C1', 'R4C1'],
  [11, 'R4C2', 'R4C3'],
  [29, 'R3C6', 'R4C6', 'R5C6', 'R6C6', 'R7C6'],
  [15, 'R5C1', 'R5C2', 'R5C3'],
  [12, 'R8C1', 'R8C2'],
  [13, 'R8C3', 'R9C3'],
  [29, 'R7C4', 'R8C4', 'R9C4', 'R9C5', 'R9C6'],
  [6, 'R8C5', 'R8C6'],
  [15, 'R8C7', 'R9C7'],
  [6, 'R8C8', 'R9C8'],
  [8, 'R8C9', 'R9C9'],
];

// Cages 5, 10, 13, 15, 19, 20, 21, 23 and 25 are named below and appear in
// the EqualSum / inequality constraints instead of here; each still needs
// its own AllDifferent, which those constraints do not provide, so each
// gets its own Cage(0, ...) alongside them.
const noTotalCages = [
  ['R1C3', 'R2C3'],                 // cage 3
  ['R3C2', 'R3C3'],                 // cage 9
  ['R4C4', 'R5C4', 'R5C5', 'R6C4'], // cage 17
  ['R5C7', 'R5C8'],                 // cage 18
  ['R6C5', 'R7C5'],                 // cage 22
  ['R7C2', 'R7C3'],                 // cage 24
  ['R9C1', 'R9C2'],                 // cage 33
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

const cage5 = ['R2C5', 'R2C6'];
const cage8 = ['R1C9', 'R2C9'];
const cage10 = ['R3C7', 'R3C8', 'R3C9'];
const cage13 = ['R3C5', 'R4C5'];
const cage15 = ['R4C7', 'R4C8'];
const cage19 = ['R4C9', 'R5C9', 'R6C9'];
const cage20 = ['R6C1', 'R7C1'];
const cage21 = ['R6C2', 'R6C3'];
const cage23 = ['R6C7', 'R6C8'];
const cage25 = ['R7C7', 'R7C8', 'R7C9'];
const relationCages = [cage5, cage8, cage10, cage13, cage15, cage19, cage20, cage21, cage23, cage25];

return [
  new Shape('9x9'),

  ...totalledCages.map(([sum, ...cells]) => new Cage(sum, ...cells)),
  ...noTotalCages.map(cells => new Cage(0, ...cells)),
  ...relationCages.map(cells => new Cage(0, ...cells)),

  // "=" mark below R2C9/above R3C9: cage 8 sum equals cage 10 sum.
  new EqualSum(cage8, cage10),

  // "=" mark below R3C7/above R4C7: cage 10 sum equals cage 15 sum.
  new EqualSum(cage10, cage15),

  // "=" mark between R6C1 and R6C2: cage 20 sum equals cage 21 sum.
  new EqualSum(cage20, cage21),

  // "^" mark below R2C5/above R3C5, point up: cage 5 (R2C5,R2C6) < cage 13
  // (R3C5,R4C5).
  cageGreaterThan(cage13, cage5),

  // "v" mark below R6C7/above R7C7, point down: cage 25 is smaller, i.e.
  // cage 23 > cage 25.
  cageGreaterThan(cage23, cage25),

  // ">" mark between R4C8 and R4C9, point right: cage 19 is smaller, i.e.
  // cage 15 > cage 19.
  cageGreaterThan(cage15, cage19),
];
