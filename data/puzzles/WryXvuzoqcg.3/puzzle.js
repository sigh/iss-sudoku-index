// Title: January 5, 2022: XV Sudoku
// Author: Eric Fox
// Video: https://www.youtube.com/watch?v=WryXvuzoqcg
// Source: https://tinyurl.com/msw68sfp

// Normal sudoku rules apply (default row/column/box all-different). X marks
// an orthogonally adjacent pair that sums to 10; V marks an orthogonally
// adjacent pair that sums to 5. "For clarity, all Xs and Vs are given" (and
// the payload's own "negative": ["xv"] flag) means every unmarked adjacent
// pair does NOT sum to 10 or 5, so the native StrictXV negative applies.

const givens = [
  ['R1C3', 4], ['R1C4', 8], ['R1C5', 1],
  ['R2C2', 1], ['R2C6', 2], ['R2C7', 6],
  ['R3C8', 7],
  ['R4C8', 2],
  ['R6C2', 9],
  ['R7C2', 5],
  ['R8C3', 2], ['R8C4', 1], ['R8C8', 6],
  ['R9C5', 5], ['R9C6', 7], ['R9C7', 4],
];

// X (sum to 10) pairs, as drawn.
const xPairs = [
  ['R4C3', 'R3C3'],
  ['R4C4', 'R3C4'],
  ['R4C5', 'R3C5'],
  ['R4C2', 'R5C2'],
];

// V (sum to 5) pairs, as drawn.
const vPairs = [
  ['R7C5', 'R6C5'],
  ['R7C6', 'R6C6'],
  ['R7C7', 'R6C7'],
  ['R6C8', 'R5C8'],
];

return [
  new Shape('9x9'),

  ...givens.map(([cell, value]) => new Given(cell, value)),

  ...xPairs.map(([a, b]) => new X(a, b)),
  ...vPairs.map(([a, b]) => new V(a, b)),
  new StrictXV(),
];
