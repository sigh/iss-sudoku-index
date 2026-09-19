// Title: Greater-Than Killer Sudoku
// Author: Unknown
// Video: https://www.youtube.com/watch?v=zNx-CVXOTEc
// Source: https://www.dailykillersudoku.com/puzzle/17032

// Normal sudoku (default row/col/box AllDifferent). Every cage forbids
// repeated digits inside it; a cage with a printed total also sums to it.
// Four small marks drawn on cage borders relate two adjacent cages' sums:
// "=" for equal sums, and a chevron ("<"/">"/"v") whose point aims at the
// smaller of the two sums, for a strict-order relation.
//
// `Cage(0, ...)` emits only the AllDifferent when no total is printed. Cage 1
// (total 10), cage 14 (total 11) and cage 21 (total 14) sit in a relation
// *and* carry a printed total, so they get `Cage(sum, ...)` below and are not
// repeated; cages 2, 6, 9 and 26 sit in a relation with no printed total, so
// they get `Cage(0, ...)` alongside the relation constraints instead of in
// the plain no-total list.

const totalledCages = [
  [10, 'R1C1', 'R1C2'],                                // cage 1
  [20, 'R1C4', 'R1C5', 'R1C6', 'R1C7'],                 // cage 3
  [13, 'R1C8', 'R2C8'],                                 // cage 4
  [21, 'R2C4', 'R2C5', 'R3C4', 'R4C4'],                 // cage 7
  [10, 'R2C6', 'R2C7'],                                 // cage 8
  [27, 'R3C9', 'R4C9', 'R5C9', 'R6C9', 'R7C9'],         // cage 13
  [11, 'R4C1', 'R5C1', 'R5C2', 'R6C1'],                 // cage 14
  [34, 'R4C2', 'R4C3', 'R5C3', 'R6C2', 'R6C3'],         // cage 15
  [19, 'R5C4', 'R5C5', 'R5C6'],                         // cage 16
  [29, 'R6C4', 'R7C4', 'R8C4', 'R8C5'],                 // cage 17
  [10, 'R6C5', 'R7C5'],                                 // cage 18
  [21, 'R6C6', 'R6C7', 'R7C6', 'R7C7'],                 // cage 19
  [7, 'R7C1', 'R7C2'],                                  // cage 20
  [14, 'R7C3', 'R8C3', 'R9C3'],                         // cage 21
  [7, 'R8C6', 'R8C7'],                                  // cage 23
  [6, 'R8C8', 'R9C8'],                                  // cage 24
  [12, 'R8C9', 'R9C9'],                                 // cage 25
];

// Cages with no printed total and no relation mark: still real cages
// (digits inside may not repeat), each getting a bare Cage(0, ...).
const noTotalCages = [
  ['R1C9', 'R2C9'],                                  // cage 5
  ['R3C5', 'R4C5'],                                  // cage 10
  ['R3C6', 'R3C7', 'R4C6', 'R4C7'],                  // cage 11
  ['R3C8', 'R4C8', 'R5C7', 'R5C8', 'R6C8', 'R7C8'],  // cage 12
  ['R8C1', 'R8C2'],                                  // cage 22
  ['R9C4', 'R9C5', 'R9C6', 'R9C7'],                  // cage 27
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
const cage2 = ['R1C3', 'R2C3', 'R3C3'];
const cage6 = ['R2C1', 'R2C2'];
const cage9 = ['R3C1', 'R3C2'];
const cage14 = ['R4C1', 'R5C1', 'R5C2', 'R6C1'];
const cage21 = ['R7C3', 'R8C3', 'R9C3'];
const cage26 = ['R9C1', 'R9C2'];

return [
  new Shape('9x9'),

  ...totalledCages.map(([sum, ...cells]) => new Cage(sum, ...cells)),
  ...noTotalCages.map(cells => new Cage(0, ...cells)),

  // Cage 2, 6, 9 and 26 are used in the relation constraints below, and
  // still each need their own AllDifferent (a total cage gets that from
  // Cage(sum, ...) above; cage 1, 14 and 21 already have it there).
  new Cage(0, ...cage2),
  new Cage(0, ...cage6),
  new Cage(0, ...cage9),
  new Cage(0, ...cage26),

  // "<" mark between R1C2 and R1C3, point left: cage 1 (total 10) is
  // smaller, i.e. cage 2 > 10.
  cageGreaterThan(cage2, cage1),

  // "=" mark between R2C2 and R2C3: cage 6 sum equals cage 2 sum.
  new EqualSum(cage6, cage2),

  // "v" mark below R3C1/above R4C1, point down: cage 14 (total 11) is
  // smaller, i.e. cage 9 > 11.
  cageGreaterThan(cage9, cage14),

  // ">" mark between R9C2 and R9C3, point right: cage 21 (total 14) is
  // smaller, i.e. cage 26 > 14.
  cageGreaterThan(cage26, cage21),
];
