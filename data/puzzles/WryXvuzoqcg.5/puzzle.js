// Title: Kropki Pairs
// Author: Tyrgannus
// Video: https://www.youtube.com/watch?v=WryXvuzoqcg
// Source: https://app.crackingthecryptic.com/sudoku/BMm4LGNQ7M

// Normal Sudoku rules apply. White dots mean consecutive digits, black dots
// mean a 2:1 ratio, both on adjacent cells only. "Not all dots are shown"
// means unmarked adjacent pairs carry no implication, so no negative
// (StrictKropki) constraint is added.
const givens = [
  ['R1C1', 2], ['R1C9', 8], ['R2C2', 7], ['R2C4', 8], ['R2C8', 6],
  ['R4C8', 9], ['R6C2', 1], ['R8C2', 9], ['R8C6', 2], ['R8C8', 1],
  ['R9C1', 1], ['R9C9', 9],
];
const whiteDots = [
  ['R2C1', 'R3C1'], ['R6C1', 'R7C1'], ['R7C1', 'R8C1'],
  ['R5C2', 'R5C3'], ['R3C5', 'R4C5'], ['R7C5', 'R8C5'], ['R8C5', 'R9C5'],
  ['R5C6', 'R5C7'], ['R9C6', 'R9C7'], ['R5C8', 'R5C9'],
];
const blackDots = [
  ['R1C3', 'R1C4'], ['R1C5', 'R2C5'], ['R2C5', 'R3C5'],
  ['R2C9', 'R3C9'], ['R3C9', 'R4C9'],
  ['R5C1', 'R5C2'], ['R5C3', 'R5C4'], ['R5C7', 'R5C8'],
  ['R6C5', 'R7C5'], ['R7C9', 'R8C9'],
];
return [
  new Shape('9x9'),
  ...givens.map(([cell, value]) => new Given(cell, value)),
  ...whiteDots.map(cells => new WhiteDot(...cells)),
  ...blackDots.map(cells => new BlackDot(...cells)),
];
