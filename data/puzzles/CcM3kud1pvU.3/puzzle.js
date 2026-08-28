// Title: Nov 1, 2021: Between Sudoku
// Author: Sam Cappleman-Lynes
// Video: https://www.youtube.com/watch?v=CcM3kud1pvU
// Source: https://tinyurl.com/pr64cfvn

// Normal Sudoku. On each drawn between line, every interior digit is
// strictly between the values in its two circled endpoint cells.

// Given digits transcribed from the payload's grid array.
const givens = [
  ['R1C2', 1], ['R1C5', 4], ['R1C9', 8],
  ['R2C7', 3],
  ['R3C2', 6], ['R3C5', 9],
  ['R4C9', 4],
  ['R5C3', 3], ['R5C7', 7],
  ['R6C1', 9],
  ['R7C5', 1], ['R7C8', 4],
  ['R8C3', 6],
  ['R9C1', 1], ['R9C5', 5], ['R9C8', 8],
];

// Paths transcribed from the circular-ended lines, in their drawn order.
const betweenLines = [
  ['R1C2', 'R1C3', 'R1C4', 'R1C5'],
  ['R9C5', 'R9C6', 'R9C7', 'R9C8'],
  ['R3C2', 'R3C3', 'R3C4', 'R3C5'],
  ['R7C5', 'R7C6', 'R7C7', 'R7C8'],
  ['R5C3', 'R5C4', 'R5C5', 'R5C6', 'R5C7'],
  ['R6C1', 'R7C1', 'R8C1', 'R9C1'],
  ['R1C9', 'R2C9', 'R3C9', 'R4C9'],
  ['R2C7', 'R3C7', 'R4C7', 'R5C7'],
  ['R8C3', 'R7C3', 'R6C3', 'R5C3'],
];

return [
  new Shape('9x9'),
  ...givens.map(([cell, value]) => new Given(cell, value)),
  ...betweenLines.map(cells => new Between(...cells)),
];
