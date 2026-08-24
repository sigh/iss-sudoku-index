// Title: Cage Encoding
// Author: WombatBreath
// Video: https://www.youtube.com/watch?v=kn1HNs0hziw
// Source: https://app.crackingthecryptic.com/sudoku/gfmrJr6HNh

// Normal sudoku rules. A black dot is a 2:1 ratio, a white dot is consecutive,
// an X sums to ten and a V sums to five; the rules say not all such marks are
// shown, so no negative/exhaustive closure is added over unmarked pairs. The
// 16 killer cages are digit-no-repeat only: their totals are never printed on
// the board (the rules use them for a post-solve letter message, computed from
// whatever sum the solved grid produces, not a value the grid must satisfy).

const cages = [
  ['R1C1', 'R2C1'],
  ['R1C3'],
  ['R1C5', 'R2C5'],
  ['R1C6', 'R1C7', 'R1C8', 'R1C9'],
  ['R3C1', 'R3C2', 'R4C1', 'R4C2', 'R5C1'],
  ['R3C4', 'R4C3', 'R4C4', 'R5C4', 'R5C5', 'R5C6'],
  ['R3C5', 'R3C6', 'R4C6'],
  ['R3C8', 'R3C9', 'R4C8', 'R4C9', 'R5C8', 'R5C9'],
  ['R6C1', 'R7C1', 'R7C2', 'R8C2'],
  ['R6C2', 'R6C3', 'R6C4', 'R7C3', 'R8C3', 'R8C4'],
  ['R6C5', 'R7C4', 'R7C5'],
  ['R6C6', 'R7C6', 'R8C5', 'R8C6', 'R8C7'],
  ['R6C8', 'R7C7', 'R7C8', 'R7C9', 'R8C8', 'R9C8'],
  ['R8C1', 'R9C1'],
  ['R9C2', 'R9C3', 'R9C4', 'R9C5', 'R9C6', 'R9C7'],
  ['R8C9', 'R9C9'],
];

const whiteDots = [
  ['R1C8', 'R2C8'], ['R2C3', 'R2C4'], ['R6C2', 'R6C3'], ['R8C6', 'R8C7'],
  ['R8C7', 'R9C7'], ['R8C7', 'R8C8'], ['R9C7', 'R9C8'], ['R9C8', 'R9C9'],
];

const blackDots = [
  ['R6C7', 'R6C8'], ['R8C5', 'R8C6'], ['R7C4', 'R8C4'], ['R6C5', 'R7C5'],
  ['R5C5', 'R6C5'], ['R2C5', 'R2C6'], ['R1C5', 'R1C6'], ['R4C1', 'R4C2'],
];

const xMarks = [
  ['R1C1', 'R1C2'], ['R1C4', 'R1C5'], ['R2C6', 'R3C6'], ['R6C6', 'R6C7'],
  ['R7C4', 'R7C5'], ['R5C3', 'R5C4'], ['R4C2', 'R4C3'],
];

const vMarks = [
  ['R3C6', 'R4C6'], ['R6C8', 'R6C9'],
];

return [
  new Shape('9x9'),
  // A cage with no printed total is a no-repeat region only.
  ...cages.map(cells => new AllDifferent(...cells)),
  ...whiteDots.map(cells => new WhiteDot(...cells)),
  ...blackDots.map(cells => new BlackDot(...cells)),
  ...xMarks.map(cells => new X(...cells)),
  ...vMarks.map(cells => new V(...cells)),
];
