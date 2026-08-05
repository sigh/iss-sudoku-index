// Title: 11/3/22: The Thin White Lines
// Author: Philip Newman
// Video: https://www.youtube.com/watch?v=esVk3NovHEE
// Source: https://tinyurl.com/47atyp7x

// Normal Sudoku rules apply. Each drawn white dot marks consecutive digits;
// unmarked adjacent pairs are unrestricted.
// Givens transcribed from the puzzle grid.
const GIVENS = [
  ['R3C1', 4], ['R4C2', 9], ['R5C3', 3], ['R6C4', 1],
  ['R7C5', 5], ['R8C6', 1], ['R9C7', 1],
];

// White-dot edges transcribed from the drawn dots.
const DOTS = [
  ['R2C1', 'R1C1'], ['R2C1', 'R2C2'], ['R2C2', 'R3C2'],
  ['R3C2', 'R3C3'], ['R4C3', 'R3C3'], ['R4C3', 'R4C4'],
  ['R4C4', 'R5C4'], ['R5C4', 'R5C5'], ['R6C5', 'R5C5'],
  ['R6C5', 'R6C6'], ['R6C6', 'R7C6'], ['R7C6', 'R7C7'],
  ['R7C7', 'R8C7'], ['R8C8', 'R8C7'], ['R9C8', 'R8C8'],
  ['R9C9', 'R9C8'], ['R7C9', 'R8C9'], ['R7C8', 'R7C9'],
  ['R6C8', 'R7C8'], ['R6C7', 'R6C8'], ['R6C7', 'R5C7'],
  ['R5C7', 'R5C6'], ['R5C6', 'R4C6'], ['R4C5', 'R4C6'],
  ['R4C5', 'R3C5'], ['R3C5', 'R3C4'], ['R2C4', 'R3C4'],
  ['R2C4', 'R2C3'], ['R2C3', 'R1C3'],
];

return [
  new Shape('9x9'),
  ...GIVENS.map(([cell, value]) => new Given(cell, value)),
  ...DOTS.map(([a, b]) => new WhiteDot(a, b)),
];
