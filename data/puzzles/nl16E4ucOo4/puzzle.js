// Title: Equal Sums
// Author: Emre Kolotoglu
// Video: https://www.youtube.com/watch?v=nl16E4ucOo4
// Source: https://app.crackingthecryptic.com/sudoku/8Q3DntNJg6
//
// Rules: normal sudoku, digits cannot repeat within a cage, and every cage
// sums to the same (unstated) total. Cages are drawn with no printed total,
// so each is AllDifferent-only; the shared total is left free and tied
// across cages with one EqualSum over all 17 cages as segments. Cells
// outside every cage carry no cage constraint.

const cages = [
  ['R1C2', 'R1C3'],
  ['R2C2', 'R2C3', 'R3C2', 'R3C3'],
  ['R2C4', 'R3C4'],
  ['R1C6', 'R2C6'],
  ['R3C6', 'R3C7', 'R3C8'],
  ['R1C9', 'R2C9', 'R3C9'],
  ['R4C8', 'R4C9'],
  ['R4C5', 'R4C6', 'R4C7'],
  ['R4C1', 'R4C2'],
  ['R4C4', 'R5C4', 'R5C5'],
  ['R6C3', 'R6C4', 'R6C5'],
  ['R5C7', 'R6C7', 'R6C8', 'R7C7'],
  ['R5C9', 'R6C9', 'R7C9', 'R8C9'],
  ['R6C1', 'R7C1', 'R7C2', 'R8C1'],
  ['R8C2', 'R9C2'],
  ['R7C5', 'R7C6', 'R8C5', 'R8C6'],
  ['R9C5', 'R9C6', 'R9C7'],
];

return [
  new Shape('9x9'),
  ...cages.map(cells => new AllDifferent(...cells)),
  new EqualSum(...cages),
];
