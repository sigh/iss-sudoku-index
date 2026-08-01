// Title: Dots and blocks!
// Author: Halen Mckenzie
// Video: https://www.youtube.com/watch?v=u80iaXoaHZo
// Source: https://app.crackingthecryptic.com/tPm3jHDRg9

// Normal Sudoku rules apply. White dots are consecutive, black dots are 1:2,
// V clues total 5, and X clues total 10. The unlabelled square decorations are omitted.
// Dot and XV coordinates are transcribed from the corresponding drawn edge marks.
const whiteDots = [
  ['R1C3', 'R1C4'], ['R3C1', 'R4C1'], ['R5C1', 'R5C2'],
  ['R6C2', 'R6C3'], ['R6C2', 'R7C2'], ['R7C3', 'R7C4'],
  ['R7C5', 'R8C5'], ['R7C6', 'R7C7'], ['R6C5', 'R6C6'],
  ['R4C4', 'R5C4'], ['R4C5', 'R4C6'], ['R3C4', 'R4C4'],
  ['R3C7', 'R3C8'], ['R4C6', 'R4C7'], ['R4C8', 'R4C9'],
  ['R3C8', 'R4C8'], ['R2C8', 'R2C9'], ['R4C8', 'R5C8'],
  ['R4C9', 'R5C9'], ['R5C8', 'R6C8'], ['R4C7', 'R5C7'],
  ['R7C9', 'R8C9'], ['R9C8', 'R9C9'], ['R9C7', 'R9C8'],
  ['R8C2', 'R9C2'],
];
const blackDots = [
  ['R4C7', 'R4C8'], ['R3C7', 'R4C7'], ['R8C6', 'R8C7'],
  ['R1C3', 'R2C3'], ['R8C1', 'R9C1'], ['R9C5', 'R9C6'],
  ['R5C2', 'R6C2'], ['R8C9', 'R9C9'],
];
const vs = [
  ['R3C5', 'R4C5'], ['R7C8', 'R7C9'], ['R1C7', 'R2C7'],
  ['R8C6', 'R9C6'], ['R5C8', 'R5C9'],
];
const xs = [
  ['R4C5', 'R5C5'], ['R8C1', 'R8C2'], ['R7C3', 'R8C3'],
];

return [
  new Shape('9x9'),
  ...whiteDots.map(([a, b]) => new WhiteDot(a, b)),
  ...blackDots.map(([a, b]) => new BlackDot(a, b)),
  ...vs.map(([a, b]) => new V(a, b)),
  ...xs.map(([a, b]) => new X(a, b)),
];
