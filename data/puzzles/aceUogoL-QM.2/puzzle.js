// Title: Jun 3, 2022: Kropki Pairs
// Author: Sam Cappleman-Lynes
// Video: https://www.youtube.com/watch?v=aceUogoL-QM
// Source: https://tinyurl.com/4y3mj3a5

// Normal sudoku. White dots mark consecutive pairs, black dots mark 1:2 ratio
// pairs. The rules state unmarked cell pairs may or may not hold such a
// relationship, so no negative (StrictKropki) constraint applies.

// Givens, from the puzzle's printed grid.
const givens = [
  ['R1C7', 7],
  ['R2C2', 5],
  ['R2C8', 9],
  ['R3C3', 3],
  ['R3C9', 1],
  ['R4C4', 3],
  ['R5C5', 9],
  ['R6C6', 8],
  ['R7C1', 9],
  ['R7C7', 3],
  ['R8C2', 7],
  ['R8C8', 8],
  ['R9C3', 5],
];

const whiteDots = [
  ['R4C5', 'R4C6'],
  ['R5C6', 'R4C6'],
  ['R5C7', 'R5C6'],
  ['R5C7', 'R6C7'],
  ['R6C7', 'R6C8'],
  ['R3C5', 'R4C5'],
  ['R7C8', 'R6C8'],
  ['R3C4', 'R3C5'],
  ['R7C8', 'R7C9'],
  ['R8C9', 'R7C9'],
  ['R2C4', 'R3C4'],
  ['R2C4', 'R2C3'],
  ['R2C3', 'R1C3'],
  ['R1C2', 'R1C3'],
];

const blackDots = [
  ['R4C3', 'R5C3'],
  ['R5C4', 'R5C3'],
  ['R5C4', 'R6C4'],
  ['R6C5', 'R6C4'],
  ['R4C2', 'R4C3'],
  ['R4C2', 'R3C2'],
  ['R7C5', 'R6C5'],
  ['R3C1', 'R3C2'],
  ['R7C6', 'R7C5'],
  ['R7C6', 'R8C6'],
  ['R8C7', 'R8C6'],
  ['R2C1', 'R3C1'],
  ['R8C7', 'R9C7'],
  ['R9C7', 'R9C8'],
];

return [
  ...givens.map(([cell, value]) => new Given(cell, value)),
  ...whiteDots.map(cells => new WhiteDot(...cells)),
  ...blackDots.map(cells => new BlackDot(...cells)),
];
