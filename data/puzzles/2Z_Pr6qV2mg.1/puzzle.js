// Title: Dec 9, 2021: Kropkidrome
// Author: clover!
// Video: https://www.youtube.com/watch?v=2Z_Pr6qV2mg
// Source: https://tinyurl.com/2p9y8ut7

// Normal sudoku rules apply. Each grey line's digits form a palindrome
// (reads the same forwards and backwards). White dots mark consecutive
// pairs; black dots mark 1:2 ratio pairs. Not all dots are given, so
// unmarked adjacent pairs carry no constraint (StrictKropki does not apply).

const givens = [
  ['R1C1', 4], ['R1C9', 3], ['R2C7', 9], ['R5C1', 9],
  ['R5C9', 1], ['R8C3', 1], ['R9C1', 2], ['R9C9', 8],
];

const palindromes = [
  ['R2C2', 'R2C3', 'R3C4', 'R3C5'],
  ['R2C5', 'R2C6', 'R3C7', 'R3C8'],
  ['R5C9', 'R5C8', 'R5C7', 'R6C6', 'R6C5', 'R6C4'],
  ['R5C1', 'R5C2', 'R5C3', 'R4C4', 'R4C5', 'R4C6'],
  ['R7C2', 'R7C3', 'R8C4', 'R8C5'],
  ['R7C5', 'R7C6', 'R8C7', 'R8C8'],
];

// White dots (consecutive), from the payload's `difference` array.
const whiteDots = [
  ['R2C2', 'R2C3'], ['R2C3', 'R2C4'], ['R3C6', 'R3C7'], ['R5C2', 'R5C3'],
  ['R5C4', 'R5C3'], ['R5C4', 'R5C5'], ['R5C6', 'R5C5'], ['R5C7', 'R5C6'],
  ['R5C8', 'R5C7'], ['R7C6', 'R7C5'], ['R8C4', 'R8C5'], ['R7C1', 'R6C1'],
  ['R7C1', 'R8C1'], ['R3C9', 'R4C9'], ['R3C9', 'R2C9'], ['R9C7', 'R9C8'],
  ['R8C9', 'R9C9'], ['R1C3', 'R1C2'], ['R2C1', 'R1C1'],
];

// Black dots (1:2 ratio), from the payload's `ratio` array.
const blackDots = [
  ['R3C5', 'R3C4'], ['R2C6', 'R2C5'], ['R7C5', 'R8C5'],
];

return [
  new Shape('9x9'),
  ...givens.map(([cell, value]) => new Given(cell, value)),
  ...palindromes.map(cells => new Palindrome(...cells)),
  ...whiteDots.map(cells => new WhiteDot(...cells)),
  ...blackDots.map(cells => new BlackDot(...cells)),
];
