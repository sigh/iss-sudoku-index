// Title: Ictoansigta
// Author: Scor
// Video: https://www.youtube.com/watch?v=2lzGnDUOvk4
// Source: https://app.crackingthecryptic.com/sudoku/9mBDpM486d

// Normal sudoku rules apply (standard rows/cols/boxes, no givens). The rising
// diagonal (R9C1..R1C9) must not repeat. White dots mark adjacent cells that
// differ by 1; black dots mark adjacent cells in a 1:2 ratio. The rules state
// "Not all dots are given", so undrawn adjacent pairs carry no relation
// (no StrictKropki negative). Grey cells are restricted to even digits.

// Grey (shaded, #CFCFCF fill) cells.
const evenCells = [
  'R1C1', 'R1C7', 'R3C1', 'R3C9', 'R7C1', 'R7C9', 'R9C3',
];

// White-dot (#FFFFFF fill) adjacent pairs.
const whiteDotPairs = [
  ['R3C8', 'R3C9'], ['R1C7', 'R1C8'], ['R2C9', 'R3C9'], ['R1C7', 'R2C7'],
  ['R1C6', 'R2C6'], ['R2C5', 'R2C6'], ['R3C5', 'R4C5'], ['R4C4', 'R5C4'],
  ['R5C6', 'R6C6'], ['R6C5', 'R7C5'], ['R8C4', 'R8C5'], ['R8C4', 'R9C4'],
  ['R8C3', 'R9C3'], ['R9C2', 'R9C3'], ['R7C1', 'R8C1'], ['R7C1', 'R7C2'],
  ['R4C1', 'R5C1'], ['R3C1', 'R4C1'], ['R5C9', 'R6C9'], ['R6C9', 'R7C9'],
];

// Black-dot (#000000 fill) adjacent pairs.
const blackDotPairs = [
  ['R6C6', 'R7C6'], ['R3C4', 'R4C4'],
];

return [
  new Shape('9x9'),

  // Rising diagonal (bottom-left R9C1 to top-right R1C9) matches ISS's
  // "direction 1" diagonal option, drawn by the single line in the payload.
  new Diagonal(1),

  ...evenCells.map(cell => new Given(cell, 2, 4, 6, 8)),

  ...whiteDotPairs.map(([a, b]) => new WhiteDot(a, b)),
  ...blackDotPairs.map(([a, b]) => new BlackDot(a, b)),
];
