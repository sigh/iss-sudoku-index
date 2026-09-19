// Title: Greater-Than Killer Sudoku
// Author: Unknown
// Video: https://www.youtube.com/watch?v=AeZvtDH7MmU
// Source: https://www.dailykillersudoku.com/puzzle/17203

// Normal sudoku (default row/col/box AllDifferent). Every cage forbids
// repeated digits inside it; a cage with a printed total also sums to it.
// Four small marks drawn on cage borders relate two adjacent cages' sums:
// "=" for equal sums, and a "^" chevron whose point aims at the smaller of
// the two sums, for a strict-order relation.
//
// `Cage(0, ...)` emits only the AllDifferent when no total is printed. Cage
// 29 (total 11) sits in a relation *and* carries a printed total, so it gets
// `Cage(11, ...)` below and is not repeated; cages 16, 17, 18, 20, 21 and 25
// sit in a relation with no printed total, so they get `Cage(0, ...)`
// alongside the relation constraints instead of in the plain no-total list.

const totalledCages = [
  [18, 'R1C1', 'R1C2', 'R1C3'],                  // cage 0
  [12, 'R1C4', 'R1C5', 'R1C6'],                  // cage 1
  [25, 'R2C1', 'R2C2', 'R2C3', 'R3C2', 'R4C2'],  // cage 3
  [18, 'R2C7', 'R2C8', 'R2C9', 'R3C8', 'R4C8'],  // cage 4
  [22, 'R2C5', 'R3C5', 'R4C5', 'R5C5'],          // cage 6
  [6, 'R2C6', 'R3C6'],                           // cage 7
  [11, 'R3C1', 'R4C1'],                          // cage 8
  [15, 'R3C3', 'R4C3', 'R4C4'],                  // cage 9
  [19, 'R3C7', 'R4C6', 'R4C7'],                  // cage 10
  [13, 'R3C9', 'R4C9'],                          // cage 11
  [8, 'R5C6', 'R5C7'],                           // cage 13
  [16, 'R5C1', 'R5C2', 'R6C1'],                  // cage 14
  [7, 'R6C3', 'R6C4'],                           // cage 15
  [14, 'R7C4', 'R8C4', 'R9C4'],                  // cage 23
  [13, 'R7C6', 'R8C6', 'R9C6'],                  // cage 24
  [15, 'R7C9', 'R8C8', 'R8C9'],                  // cage 26
  [12, 'R8C5', 'R9C5'],                          // cage 28
  [11, 'R9C7', 'R9C8', 'R9C9'],                  // cage 29
];

// Cages with no printed total and no relation mark: still real cages
// (digits inside may not repeat), each getting a bare Cage(0, ...).
const noTotalCages = [
  ['R1C7', 'R1C8', 'R1C9'],  // cage 2
  ['R2C4', 'R3C4'],          // cage 5
  ['R5C3', 'R5C4'],          // cage 12
  ['R6C5', 'R7C5'],          // cage 19
  ['R7C3', 'R8C3'],          // cage 22
  ['R9C1', 'R9C2', 'R9C3'],  // cage 27
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

const cage16 = ['R6C6', 'R6C7'];
const cage17 = ['R5C8', 'R5C9', 'R6C9'];
const cage18 = ['R6C2', 'R7C2'];
const cage20 = ['R6C8', 'R7C8'];
const cage21 = ['R7C1', 'R8C1', 'R8C2'];
const cage25 = ['R7C7', 'R8C7'];
const cage29 = ['R9C7', 'R9C8', 'R9C9'];

return [
  new Shape('9x9'),

  ...totalledCages.map(([sum, ...cells]) => new Cage(sum, ...cells)),
  ...noTotalCages.map(cells => new Cage(0, ...cells)),

  new Cage(0, ...cage16),
  new Cage(0, ...cage17),
  new Cage(0, ...cage18),
  new Cage(0, ...cage20),
  new Cage(0, ...cage21),
  new Cage(0, ...cage25),

  // "=" mark on the border below R5C8/above R6C8, centred in column 8:
  // cage 17 (R5C8,R5C9,R6C9) sum equals cage 20 (R6C8,R7C8) sum.
  new EqualSum(cage17, cage20),

  // "=" mark on the border below R6C7/above R7C7, centred in column 7 (on
  // the box border): cage 16 (R6C6,R6C7) sum equals cage 25 (R7C7,R8C7)
  // sum.
  new EqualSum(cage16, cage25),

  // "=" mark on the border between R7C1 and R7C2: cage 21
  // (R7C1,R8C1,R8C2) sum equals cage 18 (R6C2,R7C2) sum.
  new EqualSum(cage21, cage18),

  // "^" mark on the border below R8C7/above R9C7, centred in column 7,
  // point up: cage 25 (R7C7,R8C7) is the smaller sum, i.e. cage 29
  // (R9C7,R9C8,R9C9, total 11) > cage 25.
  cageGreaterThan(cage29, cage25),
];
