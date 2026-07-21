// Title: 10 x 10 = 100
// Author: Aad van de Wetering
// Video: https://www.youtube.com/watch?v=fl8BuC4cPZY
// Source: https://sudokupad.app/78ps2l3dox

// Each drawn line sums to 10. The first four are two-colour strokes in the
// source artwork, but each coincident pair represents one line.
const sumLines = [
  ['R1C1', 'R2C2'],
  ['R2C8', 'R1C9'],
  ['R8C8', 'R9C9'],
  ['R8C2', 'R9C1'],
  ['R5C1', 'R6C2', 'R7C3', 'R8C4', 'R9C5'],
  ['R1C5', 'R2C6', 'R3C7', 'R4C8', 'R5C9'],
  ['R6C4', 'R5C5', 'R4C6'],
  ['R1C5', 'R2C4', 'R3C3', 'R4C2', 'R5C1'],
  ['R9C5', 'R8C6', 'R7C7', 'R6C8', 'R5C9'],
  ['R4C4', 'R5C5', 'R6C6'],
];

return [
  new Shape('9x9'),
  new Given('R4C4', 1),
  new Given('R6C1', 7),
  new Given('R9C6', 2),
  ...sumLines.map(cells => new Sum(10, ...cells)),
];
