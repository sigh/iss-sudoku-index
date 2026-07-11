// Title: Medium Kropki Sudoku
// Author: Adrian Klausen
// Video: https://www.youtube.com/watch?v=-c9lo7lYxp8
// Source: https://sudokupad.app/abqgxi5fg2

// Normal sudoku with given digits. Kropki dots: digits on a white dot are
// consecutive, digits on a black dot are in a 1:2 ratio. No negative
// constraint.

const blackDots = [
  ['R5C1', 'R5C2'],
  ['R5C8', 'R5C9'],
];

const whiteDots = [
  ['R1C2', 'R2C2'],
  ['R1C3', 'R2C3'],
  ['R2C3', 'R2C4'],
  ['R3C3', 'R3C4'],
  ['R3C3', 'R4C3'],
  ['R3C2', 'R4C2'],
  ['R3C1', 'R3C2'],
  ['R2C1', 'R2C2'],
  ['R6C2', 'R7C2'],
  ['R6C3', 'R7C3'],
  ['R7C3', 'R7C4'],
  ['R8C3', 'R8C4'],
  ['R8C3', 'R9C3'],
  ['R8C2', 'R9C2'],
  ['R8C1', 'R8C2'],
  ['R7C1', 'R7C2'],
  ['R7C6', 'R7C7'],
  ['R8C6', 'R8C7'],
  ['R8C7', 'R9C7'],
  ['R8C8', 'R9C8'],
  ['R8C8', 'R8C9'],
  ['R7C8', 'R7C9'],
  ['R6C8', 'R7C8'],
  ['R6C7', 'R7C7'],
  ['R3C7', 'R4C7'],
  ['R3C8', 'R4C8'],
  ['R3C8', 'R3C9'],
  ['R2C8', 'R2C9'],
  ['R1C8', 'R2C8'],
  ['R1C7', 'R2C7'],
  ['R2C6', 'R2C7'],
  ['R3C6', 'R3C7'],
];

return [
  new Shape('9x9'),
  new Given('R1C1', 2),
  new Given('R1C5', 8),
  new Given('R1C9', 9),
  new Given('R2C5', 5),
  new Given('R5C1', 6),
  new Given('R5C5', 4),
  new Given('R5C9', 2),
  new Given('R8C5', 9),
  new Given('R9C1', 8),
  new Given('R9C5', 1),
  new Given('R9C9', 3),
  ...blackDots.map(([a, b]) => new BlackDot(a, b)),
  ...whiteDots.map(([a, b]) => new WhiteDot(a, b)),
];
