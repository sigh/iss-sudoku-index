// Title: Quad Sums Sudoku
// Author: udukos
// Video: https://www.youtube.com/watch?v=gxU_q1Hl4TE
// Source: https://app.crackingthecryptic.com/sudoku/j3RRHDn7M9

// Normal sudoku rules apply. Three of the four digits touching a circle sum
// to the fourth digit. Not all circles are necessarily given.
//
// Each circle sits at the intersection of a 2x2 block of cells; the rule
// does not say which of the four is the "sum" digit, so each circle is
// encoded as a disjunction over all four choices of which cell holds the
// sum. "Not all circles are necessarily given" means only the drawn
// intersections carry the rule -- no claim is made about unmarked ones, so
// undrawn 2x2 blocks are left unconstrained.

const quads = [
  ['R1C6', 'R1C7', 'R2C6', 'R2C7'],
  ['R2C6', 'R2C7', 'R3C6', 'R3C7'],
  ['R4C4', 'R4C5', 'R5C4', 'R5C5'],
  ['R4C5', 'R4C6', 'R5C5', 'R5C6'],
  ['R5C4', 'R5C5', 'R6C4', 'R6C5'],
  ['R6C3', 'R6C4', 'R7C3', 'R7C4'],
  ['R8C3', 'R8C4', 'R9C3', 'R9C4'],
  ['R8C4', 'R8C5', 'R9C4', 'R9C5'],
  ['R5C1', 'R5C2', 'R6C1', 'R6C2'],
  ['R2C2', 'R2C3', 'R3C2', 'R3C3'],
  ['R1C8', 'R1C9', 'R2C8', 'R2C9'],
  ['R4C8', 'R4C9', 'R5C8', 'R5C9'],
  ['R4C7', 'R4C8', 'R5C7', 'R5C8'],
  ['R7C7', 'R7C8', 'R8C7', 'R8C8'],
  ['R7C8', 'R7C9', 'R8C8', 'R8C9'],
];

// For a quad [a, b, c, d], each of the four EqualSum constraints encodes
// "three of the four sum to the remaining one" for one choice of which
// cell is the remaining (summed-to) one: the other three as one segment
// equal the chosen one as a single-cell segment.
const quadSumConstraints = quads.map(([a, b, c, d]) => new Or([
  new EqualSum([b, c, d], [a]),
  new EqualSum([a, c, d], [b]),
  new EqualSum([a, b, d], [c]),
  new EqualSum([a, b, c], [d]),
]));

return [
  new Shape('9x9'),
  new Given('R4C9', 6),
  new Given('R9C4', 6),
  ...quadSumConstraints,
];
