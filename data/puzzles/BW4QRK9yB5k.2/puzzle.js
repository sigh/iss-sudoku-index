// Title: August 29, 2022: Kropki Pairs
// Author: Freddie Hand
// Video: https://www.youtube.com/watch?v=BW4QRK9yB5k
// Source: https://tinyurl.com/2urndpps

// Normal sudoku rules. White dots (WhiteDot) mark orthogonally adjacent
// cell pairs that must be consecutive; black dots (BlackDot) mark pairs
// that must be in a 2:1 ratio. No negative constraint: dots are not
// exhaustive, so unmarked adjacent pairs are left unconstrained.

const givens = [
  new Given('R2C5', 1),
  new Given('R3C3', 8),
  new Given('R3C7', 2),
  new Given('R5C2', 7),
  new Given('R5C5', 9),
  new Given('R5C8', 3),
  new Given('R7C3', 6),
  new Given('R7C7', 4),
  new Given('R8C5', 5),
];

// Drawn white-dot pairs, from the geometry summary.
const whiteDotPairs = [
  ['R7C8', 'R8C8'],
  ['R8C7', 'R8C8'],
  ['R2C8', 'R2C7'],
  ['R2C8', 'R3C8'],
  ['R2C6', 'R2C7'],
  ['R8C7', 'R8C6'],
  ['R5C6', 'R5C7'],
  ['R9C9', 'R8C9'],
  ['R7C5', 'R6C5'],
  ['R3C4', 'R4C4'],
  ['R8C5', 'R9C5'],
  ['R5C1', 'R5C2'],
];

// Drawn black-dot pairs, from the geometry summary.
const blackDotPairs = [
  ['R2C2', 'R2C3'],
  ['R3C2', 'R2C2'],
  ['R7C2', 'R8C2'],
  ['R8C3', 'R8C2'],
  ['R2C4', 'R2C3'],
  ['R8C4', 'R8C3'],
  ['R5C4', 'R5C3'],
  ['R2C1', 'R1C1'],
  ['R4C5', 'R3C5'],
  ['R7C6', 'R6C6'],
  ['R2C5', 'R1C5'],
  ['R5C8', 'R5C9'],
];

const whiteDots = whiteDotPairs.map(pair => new WhiteDot(...pair));
const blackDots = blackDotPairs.map(pair => new BlackDot(...pair));

return [
  new Shape('9x9'),
  ...givens,
  ...whiteDots,
  ...blackDots,
];
