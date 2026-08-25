// Title: unknown
// Author: Unknown
// Video: https://www.youtube.com/watch?v=IFHOtse62Jo
// Source: https://app.crackingthecryptic.com/webapp/B42dn4M8pn

// Standard sudoku: rows, columns, and 3x3 boxes each contain 1-9 (enforced by
// Shape('9x9') and the box regions below). No other constraints apply.

// Givens transcribed from payload `cells`.
const givens = [
  ['R1C1', 1], ['R1C5', 8], ['R1C9', 6],
  ['R2C2', 2], ['R2C4', 4], ['R2C8', 7],
  ['R3C3', 3], ['R3C7', 5],
  ['R4C3', 4], ['R4C6', 7], ['R4C8', 1],
  ['R5C1', 5], ['R5C5', 3], ['R5C9', 8],
  ['R6C2', 6], ['R6C4', 2], ['R6C7', 9],
  ['R7C3', 7], ['R7C7', 2],
  ['R8C2', 8], ['R8C6', 9], ['R8C8', 3],
  ['R9C1', 9], ['R9C5', 6], ['R9C9', 4],
];

return [
  new Shape('9x9'),
  ...givens.map(([cell, value]) => new Given(cell, value)),
];
