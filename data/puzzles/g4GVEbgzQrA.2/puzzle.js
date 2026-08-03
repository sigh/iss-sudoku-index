// Title: 5/31/23: Consec Pairs Quads
// Author: clover!
// Video: https://www.youtube.com/watch?v=g4GVEbgzQrA
// Source: https://tinyurl.com/393vzv6u

// Normal sudoku (default row/column/box all-different; standard 3x3 boxes).
//
// Large circles (Quad): every listed value must appear somewhere in the
// circle's surrounding 2x2 area, counted with multiplicity. Every circle
// here lists the same digit twice, so each Quad below requires that digit to
// appear at least twice among its four surrounding cells.
//
// White dots (WhiteDot): the two joined cells are consecutive. Payload
// `difference` entries carry no `value`, the f-puzzles default of 1.

const givens = [
  ['R2C2', 8], ['R2C8', 1], ['R5C2', 4], ['R5C8', 6], ['R8C2', 9],
  ['R8C3', 6], ['R8C5', 3], ['R8C7', 4], ['R8C8', 8],
];

// Cells and digit read off the payload's `quadruple` array (values [d, d]).
const QUADS = [
  { topLeft: 'R3C2', digit: 3 },
  { topLeft: 'R1C3', digit: 2 },
  { topLeft: 'R3C7', digit: 5 },
  { topLeft: 'R1C6', digit: 7 },
  { topLeft: 'R6C7', digit: 3 },
  { topLeft: 'R6C2', digit: 7 },
];
const quads = QUADS.map(q => new Quad(q.topLeft, q.digit, q.digit));

// Dot pairs read off the payload's `difference` array.
const WHITE_DOTS = [
  ['R3C2', 'R3C3'], ['R4C2', 'R4C3'], ['R2C3', 'R1C3'], ['R1C4', 'R2C4'],
  ['R3C7', 'R3C8'], ['R4C7', 'R4C8'], ['R2C7', 'R1C7'], ['R2C6', 'R1C6'],
  ['R6C3', 'R6C2'], ['R7C3', 'R7C2'], ['R6C7', 'R6C8'], ['R7C7', 'R7C8'],
  ['R6C4', 'R6C3'], ['R7C4', 'R7C3'], ['R6C6', 'R6C7'], ['R7C6', 'R7C7'],
];
const whiteDots = WHITE_DOTS.map(([a, b]) => new WhiteDot(a, b));

return [
  new Shape('9x9'),
  ...givens.map(([cell, value]) => new Given(cell, value)),
  ...quads,
  ...whiteDots,
];
