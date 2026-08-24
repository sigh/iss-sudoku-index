// Title: unknown
// Author: Unknown
// Video: https://www.youtube.com/watch?v=7OQBkugAnhI
// Source: https://app.crackingthecryptic.com/sudoku/FgdN736433

// Standard sudoku: rows, columns, and 3x3 boxes each contain 1-9 (enforced by
// Shape('9x9') and the box regions below). No other constraints apply.

// Givens transcribed from payload `cells`.
const givens = [
  ['R1C1', 3], ['R1C4', 2], ['R1C6', 7], ['R1C7', 9],
  ['R2C5', 9], ['R2C6', 1],
  ['R3C1', 2], ['R3C3', 9], ['R3C4', 3], ['R3C8', 5],
  ['R4C3', 7], ['R4C6', 3], ['R4C7', 4],
  ['R5C2', 6], ['R5C3', 3], ['R5C5', 1], ['R5C8', 8],
  ['R6C3', 5], ['R6C4', 6], ['R6C7', 3],
  ['R7C2', 4], ['R7C6', 5], ['R7C7', 2], ['R7C9', 9],
  ['R8C4', 9],
  ['R9C3', 2], ['R9C4', 1], ['R9C5', 4], ['R9C6', 6], ['R9C9', 8],
];

return [
  new Shape('9x9'),
  ...givens.map(([cell, value]) => new Given(cell, value)),
];
