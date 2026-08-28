// Title: Apr 28, 2022: Consec Pairs
// Author: Sam Cappleman-Lynes
// Video: https://www.youtube.com/watch?v=liEAjQvQYe8
// Source: https://tinyurl.com/yc7mc5m8

// Normal sudoku rules apply (default row/column/box all-different from
// Shape). White dot: the two joined cells hold consecutive digits
// (WhiteDot). "Not all dots are given" is the standard non-exhaustive
// reading -- no negative constraint on undotted adjacent pairs.

const givens = [
  ['R1C1', 5], ['R1C7', 4], ['R1C9', 8],
  ['R3C3', 9], ['R3C4', 8], ['R3C9', 7],
  ['R4C3', 8], ['R4C5', 4],
  ['R6C5', 5], ['R6C7', 1],
  ['R7C1', 2], ['R7C6', 1], ['R7C7', 9],
  ['R9C1', 9], ['R9C3', 5], ['R9C9', 4],
];

// White dots, provenance: the payload's `difference` array (28 entries, no
// `value` override on any entry, so each is the default consecutive dot).
const whiteDots = [
  ['R2C6', 'R3C6'], ['R2C7', 'R3C7'], ['R3C7', 'R3C8'], ['R4C6', 'R5C6'],
  ['R3C5', 'R3C6'], ['R5C3', 'R6C3'], ['R6C2', 'R6C3'], ['R7C2', 'R7C3'],
  ['R7C3', 'R8C3'], ['R7C4', 'R8C4'], ['R7C4', 'R7C5'], ['R5C4', 'R6C4'],
  ['R1C2', 'R2C2'], ['R2C1', 'R2C2'], ['R3C1', 'R3C2'], ['R3C2', 'R4C2'],
  ['R2C3', 'R2C4'], ['R1C3', 'R2C3'], ['R6C8', 'R7C8'], ['R7C8', 'R7C9'],
  ['R8C8', 'R8C9'], ['R8C8', 'R9C8'], ['R8C7', 'R9C7'], ['R8C6', 'R8C7'],
  ['R4C7', 'R4C8'], ['R4C7', 'R5C7'], ['R4C5', 'R4C6'], ['R6C4', 'R6C5'],
];

return [
  new Shape('9x9'),
  ...givens.map(([cell, v]) => new Given(cell, v)),
  ...whiteDots.map(([a, b]) => new WhiteDot(a, b)),
];
