// Title: unknown
// Author: Unknown
// Video: https://www.youtube.com/watch?v=mWQNO2Cl7Z0
// Source: https://app.crackingthecryptic.com/6Jg2PBGPBL

// Standard sudoku: rows, columns, and 3x3 boxes each contain 1-9 (enforced by
// Shape('9x9') and the default box regions). No other constraints apply.

// Givens transcribed from payload `cells`.
const givens = [
  ['R1C2', 7], ['R1C5', 2], ['R1C7', 5], ['R1C8', 1],
  ['R2C9', 2],
  ['R3C2', 6], ['R3C7', 3], ['R3C9', 7],
  ['R4C1', 5], ['R4C5', 7], ['R4C8', 4],
  ['R5C3', 9], ['R5C7', 2], ['R5C9', 5],
  ['R6C1', 8], ['R6C4', 5], ['R6C7', 6],
  ['R7C2', 1], ['R7C4', 3], ['R7C5', 9], ['R7C6', 6],
  ['R9C1', 7], ['R9C9', 9],
];

return [
  new Shape('9x9'),
  ...givens.map(([cell, value]) => new Given(cell, value)),
];
