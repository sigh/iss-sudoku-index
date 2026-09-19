// Title: Greater-Than Killer Sudoku
// Author: Unknown
// Video: https://www.youtube.com/watch?v=x5F9AcNgPc8
// Source: https://www.dailykillersudoku.com/puzzle/17283

// Normal sudoku (default row/col/box AllDifferent). Every cage forbids
// repeated digits inside it; a cage with a printed total also sums to it.
// Six small marks drawn on cage borders relate two adjacent cages' sums: a
// chevron ("<"/">"/"^"/"v"; no "=" occurs here) whose point aims at the
// smaller of the two sums, for a strict-order relation.
//
// `Cage(0, ...)` emits only the AllDifferent when no total is printed. Cage
// 2 (total 13), cage 21 (total 8) and cage 23 (total 9) sit in a relation
// *and* carry a printed total, so they get `Cage(sum, ...)` below and are
// not repeated; cages 1, 3, 25, 27, 28, 29, 30 and 31 sit in a relation with
// no printed total, so they get `Cage(0, ...)` alongside the relation
// constraints instead of in the plain no-total list.

const totalledCages = [
  [13, 'R2C1', 'R2C2'],                                  // cage 2
  [8, 'R1C4', 'R2C4'],                                    // cage 4
  [16, 'R1C5', 'R2C5'],                                   // cage 5
  [11, 'R1C6', 'R2C6'],                                   // cage 6
  [5, 'R3C1', 'R3C2'],                                    // cage 8
  [25, 'R3C5', 'R3C6', 'R3C7', 'R4C7', 'R5C7'],            // cage 9
  [12, 'R2C7', 'R2C8', 'R3C8'],                            // cage 10
  [19, 'R3C3', 'R4C2', 'R4C3', 'R5C2'],                    // cage 11
  [12, 'R3C4', 'R4C4'],                                    // cage 12
  [8, 'R4C8', 'R4C9'],                                     // cage 13
  [16, 'R4C1', 'R5C1'],                                    // cage 14
  [14, 'R4C5', 'R4C6', 'R5C6'],                            // cage 15
  [13, 'R5C8', 'R5C9'],                                    // cage 16
  [10, 'R6C1', 'R6C2'],                                    // cage 17
  [18, 'R5C4', 'R5C5', 'R6C4', 'R6C5'],                    // cage 19
  [10, 'R6C6', 'R6C7'],                                    // cage 20
  [8, 'R6C8', 'R6C9'],                                     // cage 21
  [22, 'R7C1', 'R7C2', 'R7C3', 'R8C3', 'R9C3'],            // cage 22
  [9, 'R7C4', 'R7C5'],                                     // cage 23
];

// Cages with no printed total and no relation mark: still real cages
// (digits inside may not repeat), each getting a bare Cage(0, ...).
const noTotalCages = [
  ['R1C7', 'R1C8', 'R1C9', 'R2C9', 'R3C9'],  // cage 7
  ['R5C3', 'R6C3'],                          // cage 18
  ['R7C6', 'R7C7', 'R8C5', 'R8C6'],          // cage 24
  ['R8C1', 'R8C2', 'R9C1', 'R9C2'],          // cage 26
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

const cage1 = ['R1C1', 'R1C2'];
const cage2 = ['R2C1', 'R2C2'];
const cage3 = ['R1C3', 'R2C3'];
const cage21 = ['R6C8', 'R6C9'];
const cage23 = ['R7C4', 'R7C5'];
const cage25 = ['R7C8', 'R7C9'];
const cage27 = ['R8C4', 'R9C4'];
const cage28 = ['R8C7', 'R9C7'];
const cage29 = ['R8C8', 'R9C8'];
const cage30 = ['R8C9', 'R9C9'];
const cage31 = ['R9C5', 'R9C6'];
const relationCages = [cage1, cage3, cage25, cage27, cage28, cage29, cage30, cage31];

return [
  new Shape('9x9'),

  ...totalledCages.map(([sum, ...cells]) => new Cage(sum, ...cells)),
  ...noTotalCages.map(cells => new Cage(0, ...cells)),
  ...relationCages.map(cells => new Cage(0, ...cells)),

  // "<" mark between R1C2 and R1C3, point left: cage 1 (R1C1,R1C2) is
  // smaller, i.e. cage 1 < cage 3 (R1C3,R2C3).
  cageGreaterThan(cage3, cage1),

  // ">" mark between R2C2 and R2C3, point right: cage 3 (R1C3,R2C3) is
  // smaller, i.e. cage 2 (R2C1,R2C2, total 13) > cage 3.
  cageGreaterThan(cage2, cage3),

  // "v" mark on the border below R6C8/R6C9 and above R7C8, point down:
  // cage 25 (R7C8,R7C9) is smaller, i.e. cage 21 (R6C8,R6C9, total 8) >
  // cage 25.
  cageGreaterThan(cage21, cage25),

  // "^" mark on the border below R7C4/R7C5 and above R8C4, point up: cage
  // 23 (R7C4,R7C5, total 9) is smaller, i.e. cage 27 (R8C4,R9C4) > cage 23.
  cageGreaterThan(cage27, cage23),

  // ">" mark between R8C8 and R8C9, point right: cage 30 (R8C9,R9C9) is
  // smaller, i.e. cage 29 (R8C8,R9C8) > cage 30.
  cageGreaterThan(cage29, cage30),

  // ">" mark between R9C6 and R9C7, point right: cage 28 (R8C7,R9C7) is
  // smaller, i.e. cage 31 (R9C5,R9C6) > cage 28.
  cageGreaterThan(cage31, cage28),
];
