// Title: Unknown
// Author: ahaupt
// Video: https://www.youtube.com/watch?v=vgKt7Q0HdzI
// Source: https://cracking-the-cryptic.web.app/sudoku/TQgmLDQLd7

// Normal sudoku rules apply (default row/column/box all-different from
// Shape('9x9')). Digits in a cage must sum to its printed total. Within a
// cage the digit frequencies are balanced / as equal as possible: a cage of
// N <= 9 cells holds every digit 0 or 1 times (an ordinary killer cage, sum
// <= 45); a cage of 10 <= N <= 18 cells holds every digit 1 or 2 times
// (never 0), sum between 46 and 90. Cells a knight's move apart cannot
// repeat a digit (AntiKnight). One cell, R5C5, is not covered by any cage
// (cross-checked: the eight cage cell lists cover 80 of the 81 grid cells)
// and so carries only the row/column/box and knight's-move rules.

// Cage cell lists transcribed from the puzzle's drawn cage geometry (each
// cage's own cell order).
const cages = [
  { sum: 40, cells: ['R1C1', 'R1C2', 'R1C3', 'R1C4', 'R1C5', 'R1C6', 'R2C6'] },
  { sum: 68, cells: ['R1C7', 'R2C7', 'R3C7', 'R3C6', 'R4C6', 'R5C6', 'R6C6', 'R7C6', 'R7C7', 'R7C8', 'R7C9', 'R6C9', 'R5C9', 'R4C9'] },
  { sum: 53, cells: ['R1C8', 'R2C8', 'R3C8', 'R4C8', 'R5C8', 'R6C8', 'R4C7', 'R5C7', 'R6C7', 'R1C9', 'R2C9', 'R3C9'] },
  { sum: 39, cells: ['R2C1', 'R2C2', 'R2C3', 'R2C4', 'R2C5', 'R3C5', 'R4C5'] },
  { sum: 72, cells: ['R6C1', 'R5C1', 'R4C1', 'R3C1', 'R3C2', 'R3C3', 'R3C4', 'R4C4', 'R5C4', 'R6C4', 'R7C4', 'R7C3', 'R8C3', 'R9C3'] },
  { sum: 67, cells: ['R4C2', 'R5C2', 'R6C2', 'R6C3', 'R5C3', 'R4C3', 'R7C1', 'R8C1', 'R9C1', 'R9C2', 'R8C2', 'R7C2'] },
  { sum: 31, cells: ['R6C5', 'R7C5', 'R8C5', 'R8C6', 'R8C7', 'R8C8', 'R8C9'] },
  { sum: 30, cells: ['R8C4', 'R9C4', 'R9C5', 'R9C6', 'R9C7', 'R9C9', 'R9C8'] },
];

function combinations(arr, k) {
  if (k === 0) return [[]];
  if (arr.length < k) return [];
  const [first, ...rest] = arr;
  return [
    ...combinations(rest, k - 1).map(c => [first, ...c]),
    ...combinations(rest, k),
  ];
}

// A cage with 10-18 cells holds all 9 digits, (N - 9) of them twice and the
// rest once (the "balanced / as equal as possible" rule, restated above).
// The doubled digits are unknown, but the cage's own printed total pins
// their sum: total = 45 (each digit once) + (sum of the doubled digits), so
// the doubled set is any (N - 9)-subset of 1-9 summing to (total - 45).
// This is arithmetic on the printed clue, not a fit to a solution: it
// enumerates every admissible exact multiset for the cage and requires one
// of them via Or/ContainExact (ContainExact with as many listed values as
// cells forbids any value outside the list, so this pins the multiset
// exactly while leaving cell-to-cell placement free).
function balancedConstraint({ sum, cells }) {
  const n = cells.length;
  if (n <= 9) return new Cage(sum, ...cells);

  const extra = n - 9;
  const target = sum - 45;
  const doubledSets = combinations([1, 2, 3, 4, 5, 6, 7, 8, 9], extra)
    .filter(set => set.reduce((a, b) => a + b, 0) === target);

  return new Or(doubledSets.map(doubled => {
    const values = [];
    for (let d = 1; d <= 9; d++) {
      values.push(d);
      if (doubled.includes(d)) values.push(d);
    }
    return new ContainExact(values.join('_'), ...cells);
  }));
}

return [
  new Shape('9x9'),
  new AntiKnight(),
  ...cages.map(balancedConstraint),
];
