// Title: Jan 28, 2021: Consec Pairs
// Author: Sam Cappleman-Lynes
// Video: https://www.youtube.com/watch?v=gZRw1oD5eck
// Source: https://tinyurl.com/2p8w9ct5

// Normal sudoku rules apply. A white dot between two orthogonally adjacent
// cells means the digits are consecutive. No exhaustive-marking clause is
// given, so unmarked adjacent pairs carry no constraint.

// Givens (16), transcribed from the payload's grid values.
const givens = [
  ['R1C2', 1], ['R1C8', 5], ['R2C3', 3], ['R2C5', 5], ['R2C9', 7],
  ['R3C6', 7], ['R4C1', 7], ['R5C3', 1], ['R5C7', 3], ['R6C9', 9],
  ['R7C4', 5], ['R8C1', 1], ['R8C5', 9], ['R8C7', 5], ['R9C2', 5],
  ['R9C8', 3],
];

const whiteDots = [
  ['R1C2', 'R2C2'], ['R1C7', 'R1C8'], ['R1C9', 'R2C9'],
  ['R2C3', 'R2C4'], ['R2C5', 'R3C5'], ['R3C6', 'R3C7'],
  ['R4C1', 'R4C2'], ['R4C3', 'R5C3'], ['R5C7', 'R6C7'],
  ['R6C8', 'R6C9'], ['R7C3', 'R7C4'], ['R7C5', 'R8C5'],
  ['R8C1', 'R9C1'], ['R8C6', 'R8C7'], ['R8C8', 'R9C8'],
  ['R9C2', 'R9C3'],
];

return [
  new Shape('9x9'),

  ...givens.map(([cell, value]) => new Given(cell, value)),
  ...whiteDots.map(([a, b]) => new WhiteDot(a, b)),
];
