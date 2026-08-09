// Title: Propulsion
// Author: randomra
// Video: https://www.youtube.com/watch?v=EsBf1OrPk7U
// Source: https://app.crackingthecryptic.com/sudoku/nHhdmbMtRp

// Normal sudoku rules apply (standard 3x3 boxes, no givens).
// Digits along an arrow sum to the digit in that arrow's circle -> one
// Arrow(circle, ...arm) per arrow, circle cell read from the drawn bulb.
// Cells separated by an X sum to 10 -> X per marked pair. "Not all
// possible Xs are given" means unmarked adjacent pairs carry no
// constraint, so this is the plain (non-strict) X class.

const arrows = [
  ['R2C4', 'R2C3', 'R2C2', 'R2C1'],
  ['R4C4', 'R4C3', 'R4C2', 'R4C1'],
  ['R6C6', 'R7C6', 'R8C6', 'R9C6'],
  ['R6C8', 'R7C8', 'R8C8', 'R9C8'],
  ['R3C7', 'R2C8', 'R1C9'],
  ['R6C4', 'R7C3', 'R8C2'],
];

// Edge coordinates from the drawn white "X" text markers.
const xs = [
  ['R1C1', 'R1C2'],
  ['R3C1', 'R3C2'],
  ['R2C6', 'R2C7'],
  ['R3C6', 'R4C6'],
  ['R3C8', 'R4C8'],
  ['R4C6', 'R4C7'],
  ['R5C2', 'R5C3'],
  ['R7C1', 'R7C2'],
  ['R7C4', 'R7C5'],
  ['R8C7', 'R9C7'],
  ['R8C9', 'R9C9'],
];

return [
  new Shape('9x9'),
  ...arrows.map(cells => new Arrow(...cells)),
  ...xs.map(cells => new X(...cells)),
];
