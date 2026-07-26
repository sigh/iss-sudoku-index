// Title: Astraeus
// Author: oklux
// Video: https://www.youtube.com/watch?v=S1Xj4-tTcA4
// Source: https://sudokupad.app/wcqbcsw8lr

// Normal sudoku, standard 3x3 boxes, no givens. Renban lines: each contains a
// set of non-repeating consecutive digits, in any order. Thermometers: digits
// increase strictly from the round bulb end. A single V mark on the edge
// between R1C1 and R2C1: that pair must sum to 5.

const thermos = [
  ['R5C3', 'R4C4', 'R4C5', 'R5C6'],
  ['R5C4', 'R6C5', 'R6C6', 'R5C7'],
  ['R3C9', 'R2C9', 'R1C9'],
  ['R7C1', 'R8C1', 'R9C1'],
];

const renbans = [
  ['R8C4', 'R7C4', 'R7C5'],
  ['R8C5', 'R9C5', 'R9C6'],
  ['R7C6', 'R8C6'],
  ['R6C9', 'R6C8', 'R7C8', 'R8C8', 'R9C8'],
  ['R4C9', 'R4C8', 'R3C8', 'R2C8', 'R1C8'],
  ['R4C1', 'R4C2', 'R3C2', 'R2C2', 'R1C2'],
  ['R6C1', 'R6C2', 'R7C2', 'R8C2', 'R9C2'],
  ['R6C3', 'R7C3'],
  ['R2C4', 'R3C4', 'R3C5'],
  ['R1C4', 'R1C5', 'R2C5'],
  ['R2C6', 'R3C6'],
];

return [
  new Shape('9x9'),
  ...thermos.map((cells) => new Thermo(...cells)),
  ...renbans.map((cells) => new Renban(...cells)),
  new V('R1C1', 'R2C1'),
];
