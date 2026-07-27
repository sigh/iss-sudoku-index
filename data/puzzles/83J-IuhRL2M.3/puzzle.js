// Title: Crest of the Gorons
// Author: Wei-Hwa Huang
// Video: https://www.youtube.com/watch?v=83J-IuhRL2M
// Source: https://sudokupad.app/QBHQmPJ7mJ

// Normal sudoku rules apply (standard rows/columns/boxes, the ISS default).
// No other clues -- this is a plain sudoku, solved by the givens below.

const GIVENS = [
  ['R1C5', 2],
  ['R2C1', 5], ['R2C5', 7], ['R2C9', 3],
  ['R3C2', 3], ['R3C3', 2], ['R3C7', 9], ['R3C8', 4],
  ['R4C2', 4], ['R4C8', 6],
  ['R5C3', 9], ['R5C4', 4], ['R5C5', 3], ['R5C6', 1], ['R5C7', 5],
  ['R6C3', 1], ['R6C7', 2],
  ['R7C3', 4], ['R7C7', 1],
  ['R8C4', 8], ['R8C6', 6],
  ['R9C5', 5],
];

return [
  new Shape('9x9'),
  ...GIVENS.map(([cell, value]) => new Given(cell, value)),
];
