// Title: Oct 4, 2021: Pairs/Ratio
// Author: clover!
// Video: https://www.youtube.com/watch?v=nwmF0fIEiC8
// Source: https://tinyurl.com/9exrn29n

// Normal sudoku rules apply. A white dot joins digits that are consecutive.
// A black dot joins digits in a 1:2 ratio. Not all possible dots are
// necessarily given, so undotted adjacent cells carry no negative
// constraint (WhiteDot/BlackDot are used unscoped, without StrictKropki).

// Givens, from the payload grid.
const givens = [
  ['R1C1', 9],
  ['R2C2', 7],
  ['R2C8', 3],
  ['R3C7', 8],
  ['R7C3', 7],
  ['R8C2', 1],
  ['R8C8', 9],
  ['R9C9', 7],
];

// White-dot (consecutive) pairs, from the payload's "difference" list.
const whiteDots = [
  ['R5C1', 'R5C2'],
  ['R6C2', 'R5C2'],
  ['R6C2', 'R6C3'],
  ['R6C3', 'R7C3'],
  ['R7C4', 'R7C3'],
  ['R8C4', 'R7C4'],
  ['R5C8', 'R5C9'],
  ['R4C8', 'R5C8'],
  ['R4C7', 'R4C8'],
  ['R3C7', 'R4C7'],
  ['R3C6', 'R3C7'],
  ['R2C6', 'R3C6'],
  ['R4C6', 'R5C6'],
  ['R6C4', 'R5C4'],
];

// Black-dot (1:2 ratio) pairs, from the payload's "ratio" list.
const blackDots = [
  ['R1C5', 'R2C5'],
  ['R2C5', 'R2C4'],
  ['R3C4', 'R2C4'],
  ['R3C4', 'R3C3'],
  ['R4C3', 'R3C3'],
  ['R4C2', 'R4C3'],
  ['R9C5', 'R8C5'],
  ['R8C5', 'R8C6'],
  ['R7C6', 'R7C7'],
  ['R7C6', 'R8C6'],
  ['R6C7', 'R7C7'],
  ['R6C8', 'R6C7'],
  ['R4C4', 'R5C4'],
  ['R5C6', 'R6C6'],
  ['R8C7', 'R9C7'],
  ['R2C3', 'R1C3'],
];

return [
  ...givens.map(([cell, value]) => new Given(cell, value)),
  ...whiteDots.map(cells => new WhiteDot(...cells)),
  ...blackDots.map(cells => new BlackDot(...cells)),
];
