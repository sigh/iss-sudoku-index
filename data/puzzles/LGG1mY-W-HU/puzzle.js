// Title: Greater-Than Killer Sudoku
// Author: Unknown
// Video: https://www.youtube.com/watch?v=LGG1mY-W-HU
// Source: https://www.dailykillersudoku.com/puzzle/17093

// Normal sudoku (default row/col/box AllDifferent). Every cage forbids
// repeated digits inside it; a cage with a printed total also sums to it.
// Five small marks drawn on cage borders relate two adjacent cages' sums:
// "=" for equal sums, and a chevron ("<"/">"/"^"/"v") whose point aims at
// the smaller of the two sums, for a strict-order relation (the reading
// established for this dailykillersudoku Greater-Than Killer family, see
// sibling rows zNx-CVXOTEc/5JOeGnH_HhA). No cells are given.

const totalledCages = [
  [4, 'R1C1', 'R1C2'],                                 // cage 0
  [11, 'R1C6', 'R1C7'],                                // cage 2
  [13, 'R1C8', 'R1C9'],                                // cage 3
  [19, 'R2C1', 'R2C2', 'R3C2'],                         // cage 4
  [4, 'R2C4', 'R2C5'],                                 // cage 5
  [20, 'R2C7', 'R3C7', 'R4C7', 'R5C7'],                 // cage 6
  [16, 'R2C3', 'R3C3', 'R4C3'],                         // cage 7
  [9, 'R2C6', 'R3C6'],                                 // cage 8
  [18, 'R2C8', 'R2C9', 'R3C8', 'R3C9'],                 // cage 9
  [11, 'R3C1', 'R4C1', 'R4C2'],                         // cage 10
  [13, 'R3C4', 'R4C4'],                                // cage 11
  [10, 'R5C2', 'R6C2'],                                // cage 14
  [23, 'R4C6', 'R5C4', 'R5C5', 'R5C6', 'R6C4'],         // cage 15
  [10, 'R4C8', 'R5C8'],                                // cage 16
  [13, 'R5C1', 'R6C1'],                                // cage 17
  [12, 'R6C5', 'R7C5'],                                // cage 18
  [21, 'R7C1', 'R7C2', 'R8C1', 'R8C2'],                 // cage 21
  [13, 'R7C4', 'R8C4'],                                // cage 22
  [12, 'R6C7', 'R7C7', 'R8C7'],                         // cage 23
  [14, 'R7C8', 'R8C8', 'R8C9'],                         // cage 26
  [21, 'R9C5', 'R9C6', 'R9C7'],                         // cage 29
];

// Cages with no printed total and no relation mark: still real cages
// (digits inside may not repeat), each getting a bare Cage(0, ...).
const noTotalCages = [
  ['R1C3', 'R1C4', 'R1C5'],                          // cage 1
  ['R3C5', 'R4C5'],                                  // cage 12
  ['R9C1', 'R9C2'],                                  // cage 27
  ['R9C3', 'R9C4'],                                  // cage 28
  ['R9C8', 'R9C9'],                                  // cage 30
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

// Cages touched by a relation mark, named for reference below. 15, 21 and
// 26 also carry a printed total (emitted via totalledCages above); 13, 19,
// 20, 24 and 25 carry no total, so they get an explicit bare Cage(0, ...).
const cage13 = ['R4C9', 'R5C9'];
const cage15 = ['R4C6', 'R5C4', 'R5C5', 'R5C6', 'R6C4'];
const cage19 = ['R6C6', 'R7C6'];
const cage20 = ['R6C8', 'R6C9', 'R7C9'];
const cage21 = ['R7C1', 'R7C2', 'R8C1', 'R8C2'];
const cage24 = ['R5C3', 'R6C3', 'R7C3', 'R8C3'];
const cage25 = ['R8C5', 'R8C6'];
const cage26 = ['R7C8', 'R8C8', 'R8C9'];

return [
  new Shape('9x9'),

  ...totalledCages.map(([sum, ...cells]) => new Cage(sum, ...cells)),
  ...noTotalCages.map(cells => new Cage(0, ...cells)),

  new Cage(0, ...cage13),
  new Cage(0, ...cage19),
  new Cage(0, ...cage20),
  new Cage(0, ...cage24),
  new Cage(0, ...cage25),

  // "<" mark between R5C3 and R5C4, point left: cage 24 (R5C3,R6C3,R7C3,
  // R8C3, no total) is smaller than cage 15 (R4C6,R5C4,R5C5,R5C6,R6C4,
  // total 23).
  cageGreaterThan(cage15, cage24),

  // double-bar ("=") mark on the border between R5C9 and R6C9: cage 13
  // (R4C9,R5C9) sum equals cage 20 (R6C8,R6C9,R7C9) sum.
  new EqualSum(cage13, cage20),

  // "^" mark on the border between R6C8 and R7C8, point up: cage 20
  // (R6C8,R6C9,R7C9) is smaller than cage 26 (R7C8,R8C8,R8C9, total 14).
  cageGreaterThan(cage26, cage20),

  // "<" mark between R7C2 and R7C3, point left: cage 21 (R7C1,R7C2,R8C1,
  // R8C2, total 21) is smaller than cage 24 (R5C3,R6C3,R7C3,R8C3, no
  // total).
  cageGreaterThan(cage24, cage21),

  // "v" mark on the border between R7C6 and R8C6, point down: cage 25
  // (R8C5,R8C6, no total) is smaller than cage 19 (R6C6,R7C6, no total).
  cageGreaterThan(cage19, cage25),
];
