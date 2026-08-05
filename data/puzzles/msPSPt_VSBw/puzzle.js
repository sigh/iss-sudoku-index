// Title: Equilibrium
// Author: Mad-Tyas
// Video: https://www.youtube.com/watch?v=msPSPt_VSBw
// Source: https://app.crackingthecryptic.com/sudoku/hMtLm7n8Ft

// Normal Sudoku rules apply. Every drawn pale-grey line has the same digit sum;
// repeats on a line are allowed unless normal Sudoku already forbids them.
// The cell lists transcribe the 18 drawn lines. The first line returns to its
// starting cell only to close the drawing, so that cell is listed once for its sum.
const lines = [
  ['R1C1', 'R2C1', 'R2C2', 'R1C2'],
  ['R1C4', 'R2C4', 'R3C5'],
  ['R1C5', 'R2C5', 'R3C6'],
  ['R1C6', 'R2C6', 'R3C7'],
  ['R1C7', 'R1C8', 'R2C9'],
  ['R2C7', 'R3C8', 'R3C9'],
  ['R4C5', 'R4C6', 'R5C6'],
  ['R3C4', 'R4C4', 'R4C3'],
  ['R4C1', 'R4C2', 'R5C3'],
  ['R5C1', 'R5C2', 'R6C3'],
  ['R6C1', 'R6C2', 'R7C3'],
  ['R7C1', 'R8C1', 'R9C2'],
  ['R9C3', 'R8C3', 'R7C4'],
  ['R8C5', 'R7C6', 'R6C7', 'R5C8'],
  ['R5C5', 'R6C6', 'R7C7'],
  ['R5C4', 'R6C4', 'R6C5'],
  ['R9C7', 'R8C7', 'R7C8', 'R7C9'],
  ['R8C9', 'R9C9', 'R9C8'],
];

return [
  new Shape('9x9'),
  new EqualSum(...lines),
];
