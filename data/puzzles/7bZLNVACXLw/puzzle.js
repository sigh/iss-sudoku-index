// Title: Unwound
// Author: Daniel Hanson
// Video: https://www.youtube.com/watch?v=7bZLNVACXLw
// Source: https://sudokupad.app/cdk4bdfoqp

// Rules:
//   Normal sudoku rules apply. Adjacent digits along a green line must differ
//   by at least 5. Digits separated by a V sum to 5 and digits separated by an X
//   sum to ten; all possible V's and X's are given.
// "All possible V's and X's are given" makes both mark families exhaustive:
// an unmarked orthogonally adjacent pair sums to neither 5 nor 10 (StrictXV).
// Nothing is omitted.

// Three green lines, cells in drawn order (consecutive cells are adjacent on the line).
const greenLines = [
  ['R9C1', 'R8C1', 'R7C1', 'R6C2', 'R5C2', 'R4C2'],
  ['R6C4', 'R5C4', 'R4C4', 'R3C5', 'R2C5', 'R1C5'],
  ['R2C8', 'R3C8', 'R4C8', 'R5C7', 'R6C7', 'R7C7'],
];

// 18 X and 4 V marks, each a white label centred on the shared edge of the two cells.
const xPairs = [
  ['R9C3', 'R9C4'], ['R3C5', 'R4C5'], ['R1C3', 'R2C3'], ['R6C4', 'R6C5'],
  ['R1C8', 'R2C8'], ['R6C7', 'R6C8'], ['R6C8', 'R7C8'], ['R7C5', 'R7C6'],
  ['R4C1', 'R5C1'], ['R2C4', 'R2C5'], ['R1C4', 'R1C5'], ['R3C5', 'R3C6'],
  ['R6C5', 'R7C5'], ['R8C5', 'R8C6'], ['R9C5', 'R9C6'], ['R8C2', 'R9C2'],
  ['R7C8', 'R7C9'], ['R3C8', 'R4C8'],
];
const vPairs = [
  ['R7C3', 'R7C4'], ['R1C9', 'R2C9'], ['R5C6', 'R6C6'], ['R7C8', 'R8C8'],
];

return [
  new Shape('9x9'),

  ...greenLines.map(cells => new Whisper(5, ...cells)),

  ...xPairs.map(([a, b]) => new X(a, b)),
  ...vPairs.map(([a, b]) => new V(a, b)),
  new StrictXV(),
];
