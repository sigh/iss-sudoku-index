// Title: Rex Parvae
// Author: JayForty
// Video: https://www.youtube.com/watch?v=3pOnR2bP2kk
// Source: https://app.crackingthecryptic.com/sudoku/PHh2rDbdMm

// Normal sudoku rules apply. Digits along an arrow sum to the digit in that
// arrow's circle. Two diagonally adjacent cells cannot contain the same
// digit. There are no given digits.
//
// The diagonal-adjacency rule is encoded with AntiKing, which also forbids
// repeats between orthogonally adjacent cells. That extra half is not a
// tightening: any two orthogonally adjacent cells already share a row or a
// column, so standard sudoku already forbids the repeat. AntiKing therefore
// has the same solutions as a diagonal-only constraint here.

// Each entry starts with its circled bulb, followed by the arrow arm, taken
// from the drawn arrow polylines. Several arms bend twice right at the bulb
// (e.g. bulb R3C3 then left to R3C2, diagonally to R2C3, diagonally to R3C4)
// rather than running straight away from it; the drawn polyline is followed
// as given.
const arrows = [
  ['R3C3', 'R3C2', 'R2C3', 'R3C4'],
  ['R7C1', 'R6C1', 'R5C2', 'R4C3'],
  ['R7C3', 'R6C3', 'R5C4', 'R4C5'],
  ['R7C5', 'R6C5', 'R5C6', 'R4C7'],
  ['R7C7', 'R6C7', 'R5C8', 'R4C9'],
  ['R3C7', 'R3C6', 'R2C7', 'R3C8'],
  ['R9C4', 'R8C3', 'R9C2', 'R9C3'],
  ['R8C6', 'R8C7', 'R7C8', 'R7C9'],
].map(cells => new Arrow(...cells));

return [
  new Shape('9x9'),
  new AntiKing(),
  ...arrows,
];
