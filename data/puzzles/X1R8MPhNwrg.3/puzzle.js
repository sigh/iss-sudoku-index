// Title: October 27, 2021: Paired Pairs
// Author: Philip Newman
// Video: https://www.youtube.com/watch?v=X1R8MPhNwrg
// Source: https://tinyurl.com/6stjwvnp

// Normal sudoku rules apply. Digits in cells separated by a white dot must be
// consecutive. Digits in cells separated by a black dot must have a 2:1
// ratio. Digits in cells separated by an X must sum to 10. Digits in cells
// separated by a V must sum to 5. No exhaustiveness clause is stated, so
// unmarked adjacent pairs are unconstrained (e.g. an unmarked pair may still
// happen to be consecutive).

// White dots (payload "difference", unmarked value defaults to 1 = consecutive).
const whiteDots = [
  ['R5C4', 'R5C5'],
  ['R2C4', 'R3C4'],
  ['R8C7', 'R8C6'],
  ['R7C4', 'R7C5'],
  ['R8C3', 'R7C3'],
  ['R3C6', 'R3C7'],
  ['R4C1', 'R4C2'],
  ['R6C8', 'R6C9'],
  ['R7C9', 'R8C9'],
  ['R2C7', 'R1C7'],
];

// Black dots (payload "ratio", unmarked value defaults to 2 = 2:1 ratio).
const blackDots = [
  ['R5C3', 'R5C4'],
  ['R5C8', 'R5C7'],
  ['R4C4', 'R5C4'],
  ['R6C6', 'R7C6'],
  ['R7C5', 'R7C6'],
  ['R5C2', 'R4C2'],
  ['R6C9', 'R7C9'],
  ['R8C3', 'R9C3'],
  ['R9C4', 'R9C3'],
  ['R1C6', 'R1C7'],
];

// X marks (payload "xv" entries with value "X"): sum to 10.
const xMarks = [
  ['R5C5', 'R5C6'],
  ['R5C2', 'R5C3'],
  ['R2C4', 'R2C3'],
  ['R7C3', 'R7C4'],
  ['R3C5', 'R3C6'],
  ['R2C7', 'R3C7'],
  ['R2C1', 'R3C1'],
];

// V marks (payload "xv" entries with value "V"): sum to 5.
const vMarks = [
  ['R5C6', 'R5C7'],
  ['R6C6', 'R5C6'],
  ['R4C4', 'R3C4'],
  ['R7C6', 'R8C6'],
  ['R3C5', 'R3C4'],
  ['R5C8', 'R6C8'],
  ['R3C1', 'R4C1'],
];

return [
  new Shape('9x9'),
  ...whiteDots.map(cells => new WhiteDot(...cells)),
  ...blackDots.map(cells => new BlackDot(...cells)),
  ...xMarks.map(cells => new X(...cells)),
  ...vMarks.map(cells => new V(...cells)),
];
