// Title: Alleyway Dance
// Author: Ryan W.
// Video: https://www.youtube.com/watch?v=YL-Mf2KXR88
// Source: https://sudokupad.app/3yhq2n7z2q
//
// Normal sudoku rules apply (standard 3x3 boxes, no givens). Digits do not
// repeat within a cage. Each cage's digits sum to the same (unstated) total.
//
// Encoding: each cage is AllDifferent (distinct digits, no stated sum), and
// EqualSum ties all 14 cages to one shared total. 25 of the 81 cells belong
// to no cage and are unconstrained beyond the base row/column/box rules.

const CAGES = [
  ['R1C1', 'R1C2', 'R1C3'],
  ['R2C1', 'R2C2', 'R2C3', 'R3C2', 'R3C3'],
  ['R1C7', 'R2C7', 'R3C7', 'R3C8', 'R4C8'],
  ['R1C9', 'R2C8', 'R2C9', 'R3C9', 'R4C9'],
  ['R3C4', 'R3C5', 'R4C5'],
  ['R1C4', 'R1C5', 'R2C5'],
  ['R3C1', 'R4C1', 'R4C2', 'R4C3', 'R5C3'],
  ['R4C7', 'R5C6', 'R5C7', 'R6C7', 'R6C8'],
  ['R4C4', 'R5C4', 'R6C4'],
  ['R9C3', 'R9C4', 'R9C5'],
  ['R5C5', 'R6C5', 'R6C6', 'R7C5', 'R7C6'],
  ['R8C7', 'R8C8', 'R8C9', 'R9C7', 'R9C8'],
  ['R5C2', 'R6C2', 'R7C2'],
  ['R7C3', 'R8C2', 'R8C3', 'R9C1', 'R9C2'],
];

return [
  new Shape('9x9'),
  ...CAGES.map(cage => new AllDifferent(...cage)),
  new EqualSum(...CAGES),
];
