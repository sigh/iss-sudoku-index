// Title: 5/11/2022: Return of the King
// Author: Philip Newman
// Video: https://www.youtube.com/watch?v=G9Ve4kxxzjs
// Source: https://tinyurl.com/bdhfwn79

// Normal sudoku rules apply. Digits in diagonally adjacent cells cannot be
// the same.
//
// The diagonal-adjacency rule is encoded with AntiKing, which also forbids
// repeats between orthogonally adjacent cells. That extra half is not a
// tightening: any two orthogonally adjacent cells already share a row or a
// column, so standard sudoku already forbids the repeat. AntiKing therefore
// has the same solutions as a diagonal-only constraint here. The payload
// itself carries this rule as the boolean field `antiking: true`.

// Givens transcribed from the payload's grid array.
const givens = [
  ['R1C4', 5], ['R1C6', 7],
  ['R2C2', 7], ['R2C5', 9], ['R2C8', 4],
  ['R3C3', 8], ['R3C7', 5],
  ['R4C1', 6], ['R4C5', 1], ['R4C9', 5],
  ['R5C2', 3], ['R5C4', 4], ['R5C6', 2], ['R5C8', 1],
  ['R6C1', 7], ['R6C5', 3], ['R6C9', 8],
  ['R7C3', 7], ['R7C7', 6],
  ['R8C2', 6], ['R8C5', 2], ['R8C8', 5],
  ['R9C4', 9], ['R9C6', 6],
];

return [
  new Shape('9x9'),
  new AntiKing(),
  ...givens.map(([cell, value]) => new Given(cell, value)),
];
