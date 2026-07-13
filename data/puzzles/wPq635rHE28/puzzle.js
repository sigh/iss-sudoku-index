// Title: RAT RUN: Hit and Miss
// Author: Marty Sears
// Video: https://www.youtube.com/watch?v=wPq635rHE28
// Source: https://sudokupad.app/k4zgmts5h9

// Normal sudoku rules apply (standard 9x9 boxes, no givens).

// Blackcurrants: one digit is double the other (native 2:1 ratio dot).
const blackcurrants = [
  ['R8C3', 'R8C4'],
  ['R9C4', 'R9C5'],
  ['R3C6', 'R4C6'],
];

// Grapes: the two digits differ by at least 5.
const grapeKey = Pair.fnToKey((a, b) => Math.abs(a - b) >= 5, 9);
const grapes = [
  ['R6C3', 'R6C4'],
  ['R5C4', 'R6C4'],
  ['R5C5', 'R6C5'],
  ['R6C5', 'R7C5'],
  ['R2C5', 'R3C5'],
];

return [
  new Shape('9x9'),
  ...blackcurrants.map(cells => new BlackDot(...cells)),
  ...grapes.map(cells => new Pair(grapeKey, 'grape', ...cells)),
];
