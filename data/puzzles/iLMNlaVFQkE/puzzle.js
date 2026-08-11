// Title: That's 3 in the Corner
// Author: Epsalon
// Video: https://www.youtube.com/watch?v=iLMNlaVFQkE
// Source: https://app.crackingthecryptic.com/sudoku/27FLhTPrhL

// Normal sudoku (standard 3x3 boxes, confirmed against the payload's own
// `regions`). Along each thermometer digits strictly increase from the bulb
// to its tip(s); several bulbs are drawn with more than one arm (a shared
// shaft that forks), each arm encoded as its own Thermo starting at the
// bulb. A white dot joins two consecutive digits; "not all such dots are
// given" is a rules statement about the drawing, not an encodable negative,
// so no constraint is added for unmarked adjacent pairs. The purple box
// (R4-6,C4-6) is a magic square: every 3-cell row, column, and diagonal of
// it sums to the same total. That total is forced to 15 independent of the
// solution -- the box already holds each of 1-9 once (box AllDifferent), so
// its 3 rows sum to 45 and, being equal, each is 45/3=15 -- so it is encoded
// directly as Sum(15, ...) rather than with a free shared total. Sum (not
// Cage) is used throughout: distinctness within each row/column/diagonal is
// already covered by the box's AllDifferent.

const THERMOS = [
  // Bulb R2C3, three arms.
  ['R2C3', 'R1C3', 'R1C2', 'R1C1'],
  ['R2C3', 'R2C2', 'R2C1'],
  ['R2C3', 'R3C3', 'R3C2', 'R3C1'],
  // Bulb R3C5, four arms.
  ['R3C5', 'R3C4'],
  ['R3C5', 'R3C6'],
  ['R3C5', 'R2C5'],
  ['R3C5', 'R4C5', 'R5C5'],
  // Bulb R3C7, two arms sharing the R3C7-R3C8-R3C9-R2C9 shaft.
  ['R3C7', 'R3C8', 'R3C9', 'R2C9', 'R1C9', 'R1C8', 'R1C7'],
  ['R3C7', 'R3C8', 'R3C9', 'R2C9', 'R2C8'],
  // Bulb R7C1, two arms sharing the R7C1-R7C2-R7C3-R8C3 shaft.
  ['R7C1', 'R7C2', 'R7C3', 'R8C3', 'R9C3', 'R9C2', 'R9C1'],
  ['R7C1', 'R7C2', 'R7C3', 'R8C3', 'R8C2'],
  // Bulb R8C8, two arms sharing the R8C8-R8C9 shaft.
  ['R8C8', 'R8C9', 'R7C9', 'R7C8', 'R7C7'],
  ['R8C8', 'R8C9', 'R9C9', 'R9C8', 'R9C7'],
];

// White dots: R4C3/R4C4, R5C1/R6C1, R5C7/R5C8 (edge-anchored marks in the payload).
const DOTS = [
  ['R4C3', 'R4C4'],
  ['R5C1', 'R6C1'],
  ['R5C7', 'R5C8'],
];

// Magic-square box (R4-6, C4-6): 3 rows, 3 columns, 2 diagonals, all summing to 15.
const MAGIC_LINES = [
  ['R4C4', 'R4C5', 'R4C6'],
  ['R5C4', 'R5C5', 'R5C6'],
  ['R6C4', 'R6C5', 'R6C6'],
  ['R4C4', 'R5C4', 'R6C4'],
  ['R4C5', 'R5C5', 'R6C5'],
  ['R4C6', 'R5C6', 'R6C6'],
  ['R4C4', 'R5C5', 'R6C6'],
  ['R4C6', 'R5C5', 'R6C4'],
];

return [
  new Shape('9x9'),

  ...THERMOS.map((cells) => new Thermo(...cells)),
  ...DOTS.map(([a, b]) => new WhiteDot(a, b)),
  ...MAGIC_LINES.map((cells) => new Sum(15, ...cells)),
];
