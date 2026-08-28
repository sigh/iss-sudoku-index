// Title: Oct 23, 2021: Consec Pairs
// Author: Sam Cappleman-Lynes
// Video: https://www.youtube.com/watch?v=bHhinEJrUxg
// Source: https://tinyurl.com/kfrypbm7

// Normal sudoku rules (default rows/cols/boxes). A white dot between two
// orthogonally adjacent cells means the digits are consecutive. The rules
// explicitly state undotted pairs carry no constraint either way, so no
// negative/exhaustive rule applies to unmarked edges.

// Given digits, transcribed from the payload's grid values.
const givens = [
  ['R1C1', 8], ['R1C4', 3],
  ['R2C4', 6],
  ['R3C3', 5], ['R3C7', 6],
  ['R4C1', 4], ['R4C2', 7],
  ['R5C5', 1],
  ['R6C8', 4], ['R6C9', 7],
  ['R7C3', 4], ['R7C7', 5],
  ['R8C6', 3],
  ['R9C6', 6], ['R9C9', 2],
];

// White-dot pairs, transcribed from the payload's `difference` array. None
// of the 20 entries carries an explicit `value`, which defaults to 1
// (consecutive) -- matching the ruleset's sole dot type one-for-one.
const whiteDots = [
  ['R4C1', 'R5C1'], ['R5C1', 'R6C1'],
  ['R4C2', 'R5C2'], ['R5C2', 'R6C2'],
  ['R5C8', 'R6C8'], ['R4C8', 'R5C8'],
  ['R4C9', 'R5C9'], ['R5C9', 'R6C9'],
  ['R1C4', 'R1C5'], ['R1C5', 'R1C6'],
  ['R2C5', 'R2C6'], ['R2C4', 'R2C5'],
  ['R8C4', 'R8C5'], ['R8C5', 'R8C6'],
  ['R9C5', 'R9C6'], ['R9C4', 'R9C5'],
  ['R7C1', 'R7C2'], ['R7C2', 'R7C3'],
  ['R3C7', 'R3C8'], ['R3C8', 'R3C9'],
];

return [
  new Shape('9x9'),
  ...givens.map(([cell, value]) => new Given(cell, value)),
  ...whiteDots.map(([a, b]) => new WhiteDot(a, b)),
];
