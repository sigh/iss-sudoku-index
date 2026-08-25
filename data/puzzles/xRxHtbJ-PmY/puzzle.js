// Title: Greater-Than Killer Sudoku
// Author: Unknown
// Video: https://www.youtube.com/watch?v=xRxHtbJ-PmY
// Source: https://sudokupad.app/8MH7NnDL4d

// Normal sudoku (default row/col/box AllDifferent). Every cage forbids
// repeated digits inside it; a cage with a printed total also sums to it.
// Four rounded badges drawn on cage borders relate two adjacent cages'
// sums: "=" for equal sums, "<" for a strict less-than read left-to-right
// (no rotation on the drawn glyph).
//
// Every no-total, no-badge cage gets an explicit AllDifferent so each cage
// is named once by some constraint, even where its cells already share a
// row, column or box and the repeat is already forbidden by the default
// sudoku constraints (cages 2, 4, 26, 30).

const totalledCages = [
  [13, 'R1C2', 'R2C2', 'R3C2'],
  [15, 'R1C4', 'R2C4'],
  [20, 'R1C5', 'R2C5', 'R3C5', 'R4C5'],
  [10, 'R1C6', 'R1C7'],
  [20, 'R1C8', 'R1C9', 'R2C9', 'R2C8'],
  [13, 'R2C6', 'R2C7'],
  [7, 'R3C6', 'R4C6'],
  [14, 'R4C1', 'R5C1', 'R4C2'],
  [29, 'R4C4', 'R5C4', 'R5C5', 'R5C6', 'R6C6'],
  [9, 'R6C7', 'R5C7', 'R5C8'],
  [20, 'R5C9', 'R6C9', 'R6C8'],
  [5, 'R6C4', 'R7C4'],
  [17, 'R6C5', 'R7C5', 'R8C5', 'R9C5'],
  [17, 'R7C8', 'R8C8', 'R9C8'],
  [8, 'R7C9', 'R8C9', 'R9C9'],
  [10, 'R8C3', 'R8C4'],
  [11, 'R9C3', 'R9C4'],
  [3, 'R8C6', 'R9C6'],
];

// No-total, no-badge cages. Cages 9, 15, 23 and 26 are named below by the
// EqualSum/RellikCage badge constraints instead of here.
const noTotalCagesNeedingAllDifferent = [
  ['R1C1', 'R2C1', 'R3C1'],       // cage 2
  ['R1C3', 'R2C3'],               // cage 4
  ['R3C8', 'R3C7', 'R4C7'],       // cage 12
  ['R3C9', 'R4C9', 'R4C8'],       // cage 13
  ['R7C1', 'R6C1', 'R6C2'],       // cage 19
  ['R7C2', 'R7C3', 'R6C3'],       // cage 20
  ['R8C7', 'R9C7'],               // cage 30
];

return [
  new Shape('9x9'),

  ...totalledCages.map(([sum, ...cells]) => new Cage(sum, ...cells)),
  ...noTotalCagesNeedingAllDifferent.map(cells => new AllDifferent(...cells)),

  // "=" badge just below R3C3: cage 9 (R3C3,R3C4) sum equals cage 15
  // (R4C3,R5C3,R5C2) sum.
  new EqualSum(['R3C3', 'R3C4'], ['R4C3', 'R5C3', 'R5C2']),

  // "=" badge on the R3C8/R3C9 border: cage 12 sum equals cage 13 sum.
  new EqualSum(['R3C8', 'R3C7', 'R4C7'], ['R3C9', 'R4C9', 'R4C8']),

  // "=" badge on the R7C2/R8C2 border: cage 20 sum equals cage 26 sum.
  new EqualSum(['R7C2', 'R7C3', 'R6C3'], ['R8C1', 'R8C2', 'R9C2', 'R9C1']),

  // "<" badge on the R7C7/R7C8 border: cage 23 (R7C6,R7C7) sum is less than
  // cage 24 (R7C8,R8C8,R9C8) sum, which is fixed at 17 by its own Cage
  // total above. R7C6/R7C7 share row 7, so they are already forced
  // distinct; the largest sum two distinct 1-9 digits can reach is
  // 8+9=17, so "sum < 17" is exactly "the two cells are not {8,9}", i.e.
  // no subset of the cage may sum to 17 -- RellikCage(17, ...) states that
  // directly without needing an auxiliary Var for the comparison.
  new RellikCage(17, 'R7C6', 'R7C7'),
];
