// Title: Michael Palin
// Author: starwarigami
// Video: https://www.youtube.com/watch?v=UXDbsO674B0
// Source: https://app.crackingthecryptic.com/sudoku/8bDR7nBJft

// Normal sudoku, 9x9, no givens. 71 of 81 cells are enclosed in one of 27
// cages (provenance: the drawn cages array); the remaining 10 cells belong
// to no cage and carry no cage constraint. No cage has a displayed total --
// each cage's total is its own cells' sum, otherwise unconstrained.
// "Digits cannot repeat within a cage" is redundant with base sudoku for
// every cage confined to a single row, column, or box (all cages here except
// #18 and #19, which each span two boxes and several rows/columns), so only
// those two get an explicit AllDifferent.
// Five grey lines are drawn over the cages, each a cell path split at cage
// boundaries (a sixth line entry has no coordinates and draws nothing).
// "Along each line, the cage totals form a
// palindrome, reading the same from each end" -- the rules' own worked
// example (R1C1+R1C2+R2C1 = R6C1+R7C1) is exactly the first-vs-last cage
// pair on the first line below, confirming the walk order and pairing.
// EqualSum ties each symmetric pair of cage totals directly (no total is
// given to pin, so no auxiliary Var is needed); an odd-length line's centre
// cage is left unconstrained by the rule.

const cages = {
  0: ['R2C1', 'R1C1', 'R1C2'],
  1: ['R1C3'],
  2: ['R2C3', 'R2C2'],
  3: ['R3C2'],
  4: ['R4C2'],
  5: ['R5C3', 'R6C3', 'R6C2'],
  6: ['R6C1', 'R7C1'],
  7: ['R7C2', 'R7C3'],
  8: ['R8C2', 'R8C3', 'R8C4'],
  9: ['R9C1', 'R9C2'],
  10: ['R9C3', 'R9C4', 'R9C5'],
  11: ['R8C5'],
  12: ['R7C4', 'R7C5', 'R7C6'],
  13: ['R8C6', 'R9C6'],
  14: ['R9C7'],
  15: ['R8C7', 'R7C7', 'R6C7'],
  16: ['R6C8', 'R7C8', 'R8C8', 'R9C8'],
  17: ['R6C9', 'R7C9'],
  18: ['R5C8', 'R5C9', 'R4C9', 'R3C9', 'R2C9', 'R1C9', 'R1C8'],
  19: ['R2C8', 'R3C8', 'R3C7', 'R4C7', 'R5C7'],
  20: ['R2C6', 'R3C6'],
  21: ['R1C4', 'R2C4', 'R3C4', 'R3C5', 'R2C5', 'R1C5'],
  22: ['R1C6', 'R1C7'],
  23: ['R2C7'],
  24: ['R4C4', 'R5C4', 'R5C5', 'R4C5', 'R6C5'],
  25: ['R6C4'],
  26: ['R4C6', 'R5C6', 'R6C6'],
};

// Each drawn line's ordered cage-id walk, cage boundary to cage boundary.
const lineCageOrder = [
  [0, 1, 2, 3, 4, 5, 6],
  [21, 20, 22, 23, 19, 18],
  [25, 24, 26, 15],
  [17, 16, 14, 13, 12, 7],
  [9, 10, 11, 8],
];

// Symmetric (first/last, second/second-last, ...) cage-id pairs per line.
const palindromePairs = lineCageOrder.flatMap(order => {
  const pairs = [];
  for (let i = 0, j = order.length - 1; i < j; i++, j--) {
    pairs.push([order[i], order[j]]);
  }
  return pairs;
});

// Cages spanning more than one row, column, and box: their no-repeat clause
// is not already implied by base sudoku.
const nonRedundantCages = [18, 19];

return [
  ...nonRedundantCages.map(id => new AllDifferent(...cages[id])),
  ...palindromePairs.map(([a, b]) => new EqualSum(cages[a], cages[b])),
];
