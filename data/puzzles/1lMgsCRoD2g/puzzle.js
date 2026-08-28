// Title: unknown
// Author: Unknown
// Video: https://www.youtube.com/watch?v=1lMgsCRoD2g
// Source: https://cracking-the-cryptic.web.app/sudoku/2J2fRGP4Tn

// Rules, from the puzzle's first publication as "Sudoku Variants Series (048)
// - XV" by Richard (Logic Masters Deutschland, id 00023A):
//   Place the digits from 1 tot 9 in every row, column and 3x3-block. All
//   horizontally and vertically neighboring digits with the sum 10 are marked
//   with X, all horizontally and vertically neighboring digits with the sum 5
//   are marked with V.
// "All ... are marked" makes both mark families exhaustive, which is the
// negative half StrictXV supplies: an unmarked orthogonally adjacent pair sums
// to neither 5 nor 10. Nothing is omitted.

// The 17 drawn edge marks, each a white "X"/"V" label centred on the shared
// edge of the two cells named.
const xPairs = [
  ['R1C3', 'R2C3'],
  ['R2C1', 'R3C1'],
  ['R6C2', 'R7C2'],
  ['R7C3', 'R8C3'],
  ['R6C3', 'R6C4'],
  ['R7C4', 'R7C5'],
  ['R8C4', 'R9C4'],
  ['R7C8', 'R8C8'],
  ['R7C9', 'R8C9'],
  ['R3C8', 'R3C9'],
  ['R1C8', 'R1C9'],
  ['R3C6', 'R3C7'],
  ['R5C5', 'R5C6'],
];

const vPairs = [
  ['R2C8', 'R2C9'],
  ['R5C7', 'R5C8'],
  ['R7C3', 'R7C4'],
  ['R4C1', 'R5C1'],
];

return [
  new Shape('9x9'),

  new Given('R2C5', 1),
  new Given('R8C5', 2),

  ...xPairs.map(([a, b]) => new X(a, b)),
  ...vPairs.map(([a, b]) => new V(a, b)),

  new StrictXV(),
];
