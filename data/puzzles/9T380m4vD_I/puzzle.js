// Title: Throuples
// Author: Scruffamudda
// Video: https://www.youtube.com/watch?v=9T380m4vD_I
// Source: https://app.crackingthecryptic.com/sudoku/r9rLrppHpT

// Normal sudoku rules apply (default row/column/box all-different).
// A white circle marked "3" or "6" between two adjacent cells means those two
// digits differ by exactly that amount. A circle marked "V" means the pair
// sums to 5; a circle marked "X" means the pair sums to 10. The rules state
// that not every valid difference-3/6, V, or X pair is necessarily marked, so
// unmarked adjacent pairs carry no constraint (a non-exhaustive clue set).

const diff3 = Pair.fnToKey((a, b) => Math.abs(a - b) === 3, 9);
const diff6 = Pair.fnToKey((a, b) => Math.abs(a - b) === 6, 9);

// Difference-3 circles (edge overlays printed "3").
const diff3Pairs = [
  ['R1C1', 'R1C2'],
  ['R1C4', 'R2C4'],
  ['R3C8', 'R3C9'],
  ['R2C9', 'R3C9'],
  ['R4C7', 'R4C8'],
  ['R5C8', 'R6C8'],
  ['R7C9', 'R8C9'],
  ['R9C7', 'R9C8'],
  ['R9C1', 'R9C2'],
  ['R6C1', 'R7C1'],
  ['R6C2', 'R7C2'],
];

// Difference-6 circles (edge overlays printed "6").
const diff6Pairs = [
  ['R1C2', 'R1C3'],
  ['R2C3', 'R2C4'],
  ['R1C6', 'R1C7'],
  ['R3C5', 'R4C5'],
  ['R4C9', 'R5C9'],
  ['R8C9', 'R9C9'],
  ['R9C6', 'R9C7'],
  ['R8C3', 'R8C4'],
  ['R9C2', 'R9C3'],
  ['R7C1', 'R8C1'],
  ['R3C2', 'R4C2'],
];

// V circles (sum to 5).
const vPairs = [
  ['R5C2', 'R5C3'],
  ['R6C5', 'R6C6'],
];

// X circles (sum to 10).
const xPairs = [
  ['R5C5', 'R6C5'],
];

const diff3Constraints = diff3Pairs.map(
  ([a, b]) => new Pair(diff3, 'Difference3', a, b));
const diff6Constraints = diff6Pairs.map(
  ([a, b]) => new Pair(diff6, 'Difference6', a, b));
const vConstraints = vPairs.map(([a, b]) => new V(a, b));
const xConstraints = xPairs.map(([a, b]) => new X(a, b));

return [
  new Shape('9x9'),
  ...diff3Constraints,
  ...diff6Constraints,
  ...vConstraints,
  ...xConstraints,
];
