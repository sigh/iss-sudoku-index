// Title: 9/4/22: X Xs Live in Texas
// Author: Philip Newman
// Video: https://www.youtube.com/watch?v=DPZdSA5CCjk
// Source: https://tinyurl.com/2a2fww9v

// Normal sudoku rules apply. Digits in cells separated by an X must sum to
// 10. Not all Xs are necessarily given, so unmarked adjacent pairs are
// unconstrained (no negative constraint).

// Givens transcribed from the grid array.
const givens = [
  ['R1C1', 1], ['R1C3', 8],
  ['R2C2', 2],
  ['R3C1', 4], ['R3C3', 3], ['R3C8', 7], ['R3C9', 5],
  ['R4C2', 5], ['R4C4', 4],
  ['R5C3', 6], ['R5C5', 5], ['R5C7', 4],
  ['R6C6', 6], ['R6C8', 5],
  ['R7C1', 8], ['R7C7', 7], ['R7C9', 6],
  ['R8C8', 8],
  ['R9C6', 5], ['R9C9', 9],
];

// X-marked adjacent cell pairs, transcribed from the `xv` array (all
// value="X").
const xPairs = [
  ['R1C8', 'R1C9'], ['R1C6', 'R1C7'],
  ['R2C7', 'R2C8'], ['R2C5', 'R2C6'],
  ['R3C4', 'R3C5'],
  ['R9C1', 'R9C2'], ['R9C3', 'R9C4'],
  ['R8C2', 'R8C3'], ['R8C4', 'R8C5'],
  ['R7C5', 'R7C6'],
];

return [
  new Shape('9x9'),
  ...givens.map(([cell, value]) => new Given(cell, value)),
  ...xPairs.map(([a, b]) => new Sum(10, a, b)),
];
