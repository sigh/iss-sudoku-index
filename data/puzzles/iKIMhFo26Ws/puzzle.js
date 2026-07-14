// Title: RAT RUN 25: Mod Cons
// Author: Marty Sears
// Video: https://www.youtube.com/watch?v=iKIMhFo26Ws
// Source: https://sudokupad.app/z3tyv4nda6

// Normal sudoku rules apply (standard 9x9 boxes, no givens).

// Blackcurrants: one digit is double the other (native 2:1 ratio dot).
const blackcurrants = [
  ['R1C5', 'R1C6'],
  ['R1C7', 'R1C8'],
  ['R3C3', 'R4C3'],
  ['R3C4', 'R4C4'],
  ['R3C5', 'R4C5'],
  ['R4C8', 'R5C8'],
  ['R5C7', 'R5C8'],
];

// Purple arrows (one-way doors): the arrow always points to the smaller of
// the two digits it sits between, independent of which cell either rat's
// path passes through. GreaterThan(a, b) requires a > b on adjacent cells.
const arrowGreater = [
  ['R2C7', 'R2C8'], // arrow points to R2C8 (smaller)
  ['R2C6', 'R2C5'], // arrow points to R2C5 (smaller)
  ['R3C4', 'R3C5'], // arrow points to R3C5 (smaller)
  ['R3C4', 'R2C4'], // arrow points to R2C4 (smaller)
];

return [
  new Shape('9x9'),
  ...blackcurrants.map(cells => new BlackDot(...cells)),
  ...arrowGreater.map(cells => new GreaterThan(...cells)),
];
