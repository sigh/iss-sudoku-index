// Title: David and Goliath
// Author: Bill Murphy
// Video: https://www.youtube.com/watch?v=bYOwPT0KfTk
// Source: https://tinyurl.com/7hanbxm2

// Normal sudoku rules apply. Each capsule must contain one low digit
// (1,2,3,4,5) and one high digit (5,6,7,8,9); 5 satisfies either role.
// The 16 capsules below are the drawn two-cell pairs (fpuzzles "arrow"
// entries with no line, i.e. bulb+locator only, no sum shaft) -- each pair
// is orthogonally adjacent within one row or column, so normal sudoku
// already forces the two cells to differ.

const givens = [
  ['R1C3', 7], ['R1C5', 3], ['R1C7', 8], ['R1C8', 4],
  ['R2C1', 1], ['R2C7', 7],
  ['R3C1', 3], ['R3C2', 5], ['R3C9', 6],
  ['R4C4', 6], ['R4C6', 8],
  ['R6C4', 3], ['R6C6', 9],
  ['R7C1', 7], ['R7C8', 1], ['R7C9', 4],
  ['R8C3', 1], ['R8C9', 5],
  ['R9C2', 2], ['R9C3', 8], ['R9C5', 5], ['R9C7', 6],
];

// Capsule cell pairs, transcribed from the drawn two-cell capsule shapes
// (each has no sum-arrow shaft, distinguishing it from an arrow clue).
const capsules = [
  ['R1C1', 'R1C2'],
  ['R2C2', 'R2C3'],
  ['R3C3', 'R3C4'],
  ['R4C4', 'R4C5'],
  ['R4C6', 'R5C6'],
  ['R3C7', 'R4C7'],
  ['R2C8', 'R3C8'],
  ['R1C9', 'R2C9'],
  ['R6C5', 'R6C6'],
  ['R7C6', 'R7C7'],
  ['R8C7', 'R8C8'],
  ['R9C8', 'R9C9'],
  ['R5C4', 'R6C4'],
  ['R6C3', 'R7C3'],
  ['R7C2', 'R8C2'],
  ['R8C1', 'R9C1'],
];

// One low digit (<=5) and one high digit (>=5) per capsule.
const capsuleKey = Pair.fnToKey(
  (a, b) => (a <= 5 && b >= 5) || (b <= 5 && a >= 5), 9);

return [
  new Shape('9x9'),
  ...givens.map(([cell, value]) => new Given(cell, value)),
  ...capsules.map(([a, b]) => new Pair(capsuleKey, 'Capsule', a, b)),
];
