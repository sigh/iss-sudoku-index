// Title: January 29, 2022: Morph
// Author: Philip Newman
// Video: https://www.youtube.com/watch?v=gZRw1oD5eck
// Source: https://tinyurl.com/6kvtbxcr

// Normal sudoku rules apply. Digits separated by a white dot must be
// consecutive. The rules text states there is no negative constraint, so
// unmarked adjacent pairs are left unconstrained.
const givens = [
  ['R1C2', 2], ['R1C8', 6], ['R2C3', 4], ['R2C5', 6], ['R2C9', 8],
  ['R3C6', 8], ['R4C1', 8], ['R5C3', 6], ['R5C7', 8], ['R6C9', 4],
  ['R7C4', 8], ['R8C1', 2], ['R8C5', 4], ['R8C7', 6], ['R9C2', 6],
  ['R9C8', 8],
];
const whiteDots = [
  ['R8C1', 'R9C1'], ['R9C2', 'R9C3'], ['R7C3', 'R7C4'], ['R7C5', 'R8C5'],
  ['R8C6', 'R8C7'], ['R8C8', 'R9C8'], ['R6C9', 'R6C8'], ['R5C7', 'R6C7'],
  ['R4C3', 'R5C3'], ['R4C1', 'R4C2'], ['R2C2', 'R1C2'], ['R2C4', 'R2C3'],
  ['R3C5', 'R2C5'], ['R3C6', 'R3C7'], ['R1C8', 'R1C7'], ['R2C9', 'R1C9'],
];
return [
  new Shape('9x9'),
  ...givens.map(([cell, value]) => new Given(cell, value)),
  ...whiteDots.map(cells => new WhiteDot(...cells)),
];
