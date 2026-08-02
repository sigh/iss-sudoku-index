// Title: Leehwnip
// Author: Miky
// Video: https://www.youtube.com/watch?v=95lVtJVSH4A
// Source: https://sudokupad.app/sj0yv59u4t

// Normal Sudoku. Grey circles are odd and grey squares are even. Each golden
// Nabner line is a non-repeating set with no two digits consecutive.
const nabner = PairX.fnToKey((a, b) => Math.abs(a - b) > 1, 9);
const lines = [
  ['R6C3', 'R7C2', 'R8C2', 'R9C2'],
  ['R4C1', 'R3C2', 'R2C2', 'R1C2'],
  ['R6C7', 'R7C8', 'R8C8', 'R9C8'],
  ['R4C9', 'R3C8', 'R2C8', 'R1C8'],
  ['R5C1', 'R5C2', 'R5C3', 'R4C4'],
  ['R6C6', 'R5C7', 'R5C8', 'R5C9'],
  ['R8C3', 'R9C4', 'R9C5', 'R9C6'],
  ['R8C7', 'R7C6', 'R7C5', 'R7C4'],
  ['R2C3', 'R3C4', 'R3C5', 'R3C6'],
  ['R2C7', 'R1C6', 'R1C5', 'R1C4'],
  ['R2C6', 'R1C7'],
  ['R4C2', 'R3C1'],
];

return [
  new Shape('9x9'),
  new Given('R5C5', 2), new Given('R6C5', 7), new Given('R8C5', 5),
  new Given('R1C2', 1, 3, 5, 7, 9), new Given('R3C8', 1, 3, 5, 7, 9),
  new Given('R4C1', 1, 3, 5, 7, 9), new Given('R4C9', 1, 3, 5, 7, 9),
  new Given('R5C4', 1, 3, 5, 7, 9), new Given('R5C6', 1, 3, 5, 7, 9),
  new Given('R6C3', 2, 4, 6, 8), new Given('R6C7', 2, 4, 6, 8),
  new Given('R7C2', 2, 4, 6, 8), new Given('R9C8', 2, 4, 6, 8),
  // Each literal array is one separately drawn golden line.
  ...lines.map((cells) => new PairX(nabner, 'Nabner', ...cells)),
];
