// Title: Untitled
// Author: Rishi Puri
// Video: https://www.youtube.com/watch?v=1AxVH20xhH4
// Source: https://cracking-the-cryptic.web.app/sudoku/fJbnN63gBJ

// Normal sudoku (rows, columns, 3x3 boxes, digits 1-9), three givens, and
// every grey-shaded cell contains an even digit. Nothing is omitted.
//
// The source states no rules in words, so the parity reading is taken from the
// drawing: the shaded set has exactly four cells in every row, column and box,
// which is the count of the even digits 2, 4, 6, 8 (the odd digits number
// five); the decorative frame repeats the same grey fill against the even rows
// and even columns on all four edges; and the shaded given R6C4 is even while
// the two unshaded givens are odd.

// The 36 grey-shaded cells, as drawn, listed row by row.
const SHADED = [
  'R1C1', 'R1C3', 'R1C5', 'R1C6',
  'R2C5', 'R2C7', 'R2C8', 'R2C9',
  'R3C1', 'R3C3', 'R3C5', 'R3C8',
  'R4C4', 'R4C7', 'R4C8', 'R4C9',
  'R5C2', 'R5C4', 'R5C6', 'R5C8',
  'R6C1', 'R6C2', 'R6C3', 'R6C4',
  'R7C2', 'R7C3', 'R7C7', 'R7C9',
  'R8C1', 'R8C4', 'R8C5', 'R8C6',
  'R9C2', 'R9C6', 'R9C7', 'R9C9',
];

return [
  new Shape('9x9'),

  // Givens, all on the anti-diagonal.
  new Given('R4C6', 9),
  new Given('R5C5', 5),
  new Given('R6C4', 6),

  // A parity clue is a candidate restriction: restrict each shaded cell to the
  // even digits.
  ...SHADED.map((cell) => new Given(cell, 2, 4, 6, 8)),
];
