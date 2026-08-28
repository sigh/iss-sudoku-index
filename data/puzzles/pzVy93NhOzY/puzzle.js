// Title: unknown
// Author: Unknown
// Video: https://www.youtube.com/watch?v=pzVy93NhOzY
// Source: https://cracking-the-cryptic.web.app/sudoku/TPHt967Npg

// Normal Sudoku rules apply.
//
// Parity rule, as stated for this presentation of the puzzle: the 16 grey
// circles must ALL contain odd digits, or ALL contain even digits. The
// circles carry no individually fixed parity, so the rule is one grid-wide
// disjunction over the whole set rather than a per-cell candidate list.

const GIVENS = [
  // Printed digits, read off the grid row by row. No given sits on a circle.
  ['R1C5', 4], ['R1C8', 9],
  ['R2C6', 9], ['R2C9', 6],
  ['R3C3', 9], ['R3C7', 7],
  ['R4C4', 7], ['R4C8', 6],
  ['R5C1', 1], ['R5C5', 6], ['R5C9', 5],
  ['R6C2', 2], ['R6C6', 5],
  ['R7C3', 3], ['R7C7', 4],
  ['R8C1', 2], ['R8C4', 4], ['R8C8', 5],
  ['R9C2', 7], ['R9C5', 5],
];

// The 16 grey circles, traced as the closed diamond they are drawn as:
// R1C4 down-right to R6C9, down-left to R9C6, up-left to R4C1, up-right back
// to R1C4.
const CIRCLES = [
  'R1C4', 'R2C5', 'R3C6', 'R4C7', 'R5C8', 'R6C9',
  'R7C8', 'R8C7', 'R9C6',
  'R8C5', 'R7C4', 'R6C3', 'R5C2', 'R4C1',
  'R3C2', 'R2C3',
];

const ODD = [1, 3, 5, 7, 9];
const EVEN = [2, 4, 6, 8];

return [
  new Shape('9x9'),
  ...GIVENS.map(([cell, value]) => new Given(cell, value)),
  new Or([
    new And(CIRCLES.map(cell => new Given(cell, ...ODD))),
    new And(CIRCLES.map(cell => new Given(cell, ...EVEN))),
  ]),
];
