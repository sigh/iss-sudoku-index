// Title: April 18, 2023: Succession
// Author: Philip Newman
// Video: https://www.youtube.com/watch?v=3xSu51Mcm80
// Source: https://tinyurl.com/48zmtvd7

// Normal sudoku (rows/cols/boxes) plus AntiKing (no repeated digit a king's
// move apart), WhiteDot (consecutive) and BlackDot (2:1 ratio) between the
// drawn dot pairs. The ruleset states no negative constraint: absence of a
// dot means nothing, so undotted adjacent pairs are left unconstrained.

// White dots (consecutive pairs), from the "difference" clue list.
const whiteDots = [
  ['R6C3', 'R7C3'],
  ['R7C3', 'R7C4'],
  ['R3C6', 'R3C7'],
  ['R3C7', 'R4C7'],
  ['R7C4', 'R8C4'],
  ['R2C6', 'R3C6'],
  ['R8C4', 'R8C5'],
  ['R2C5', 'R2C6'],
  ['R5C2', 'R6C2'],
  ['R4C8', 'R5C8'],
];

// Black dots (2:1 ratio pairs), from the "ratio" clue list.
const blackDots = [
  ['R3C3', 'R3C4'],
  ['R3C3', 'R4C3'],
  ['R6C7', 'R7C7'],
  ['R7C6', 'R7C7'],
  ['R4C2', 'R4C3'],
  ['R6C7', 'R6C8'],
  ['R5C1', 'R5C2'],
  ['R5C8', 'R5C9'],
];

return [
  new Shape('9x9'),
  new Given('R1C1', 7),
  new Given('R1C9', 8),
  new Given('R2C2', 8),
  new Given('R2C8', 7),
  new Given('R5C5', 6),
  new Given('R8C2', 7),
  new Given('R8C8', 9),
  new Given('R9C1', 9),
  new Given('R9C9', 7),
  new AntiKing(),
  ...whiteDots.map(cells => new WhiteDot(...cells)),
  ...blackDots.map(cells => new BlackDot(...cells)),
];
