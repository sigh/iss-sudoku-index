// Title: Killer Sudoku
// Author: Unknown
// Video: https://www.youtube.com/watch?v=JUyBOk1ZmbE
// Source: https://sudokupad.app/b296qMBJgL

// Normal sudoku (default row/col/box AllDifferent). Every cage forbids
// repeated digits inside it; a cage with a printed total also sums to it.
// Three rounded "=" badges are drawn on cage borders, each relating two
// adjacent cages' sums.
//
// Every no-total, no-badge cage gets an explicit AllDifferent so each cage
// is named once by some constraint, even where its cells already share a
// row, column or box and the repeat is already forbidden by the default
// sudoku constraints.

const totalledCages = [
  [14, 'R1C1', 'R1C2', 'R1C3'],
  [20, 'R1C4', 'R2C4', 'R1C5', 'R2C5', 'R3C5'],
  [8, 'R2C1', 'R2C2'],
  [17, 'R2C3', 'R3C3', 'R3C4'],
  [12, 'R3C1', 'R3C2'],
  [16, 'R2C6', 'R2C7'],
  [7, 'R3C7', 'R3C8'],
  [14, 'R3C6', 'R4C6', 'R4C5'],
  [8, 'R4C7', 'R4C8'],
  [21, 'R4C1', 'R4C2', 'R5C2', 'R5C1'],
  [13, 'R4C3', 'R5C3'],
  [25, 'R4C4', 'R5C4', 'R5C5', 'R5C6', 'R6C6'],
  [19, 'R6C1', 'R7C1', 'R8C1', 'R8C2'],
  [14, 'R9C1', 'R9C2'],
  [10, 'R6C2', 'R6C3'],
  [14, 'R6C5', 'R6C4', 'R7C4'],
  [13, 'R9C3', 'R9C4'],
  [24, 'R7C5', 'R8C5', 'R9C5', 'R9C6', 'R8C6'],
];

// No-total, no-badge cages. Cages 7, 8, 26, 27, 30 and 31 are named below by
// the EqualSum badge constraints instead of here.
const noTotalCagesNeedingAllDifferent = [
  ['R2C8', 'R2C9', 'R3C9', 'R4C9'], // cage 10
  ['R7C2', 'R7C3'],                 // cage 20
  ['R8C3', 'R8C4'],                 // cage 23
  ['R7C6', 'R7C7', 'R8C7'],         // cage 28
  ['R7C8', 'R7C9'],                 // cage 29
];

return [
  new Shape('9x9'),

  ...totalledCages.map(([sum, ...cells]) => new Cage(sum, ...cells)),
  ...noTotalCagesNeedingAllDifferent.map(cells => new AllDifferent(...cells)),

  // "=" badge on the R1C7/R1C8 border: cage 7 (R1C6,R1C7) sum equals cage 8
  // (R1C8,R1C9) sum.
  new EqualSum(['R1C6', 'R1C7'], ['R1C8', 'R1C9']),

  // "=" badge on the R5C7/R5C8 border: cage 26 (R5C7,R6C7) sum equals cage
  // 27 (R5C8,R5C9,R6C9,R6C8) sum.
  new EqualSum(['R5C7', 'R6C7'], ['R5C8', 'R5C9', 'R6C9', 'R6C8']),

  // "=" badge on the R8C8/R9C8 border: cage 30 (R8C8,R8C9) sum equals cage
  // 31 (R9C7,R9C8,R9C9) sum.
  new EqualSum(['R8C8', 'R8C9'], ['R9C7', 'R9C8', 'R9C9']),
];
