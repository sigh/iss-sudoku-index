// Title: Hairgrips
// Author: Malrog
// Video: https://www.youtube.com/watch?v=VslFJ0OhlDc
// Source: https://sudokupad.app/bpxqqx422g

// The sweets and strawberry-lace paths are read from the photographed cake.
const thermometers = [
  ['R2C1', 'R2C2', 'R2C3', 'R2C4', 'R3C4', 'R3C3', 'R3C2'],
  ['R1C8', 'R2C8', 'R3C8', 'R4C8', 'R4C7', 'R3C7', 'R2C7'],
  ['R9C2', 'R8C2', 'R7C2', 'R6C2', 'R6C3', 'R7C3', 'R8C3'],
  ['R7C6', 'R7C7', 'R7C8', 'R7C9', 'R6C9', 'R6C8', 'R6C7'],
];

const evenCells = ['R1C3', 'R3C9', 'R5C5', 'R7C1', 'R8C9'];

const blackDots = [
  ['R1C5', 'R2C5'],
  ['R2C3', 'R3C3'],
  ['R3C7', 'R3C8'],
  ['R7C7', 'R8C7'],
  ['R8C4', 'R9C4'],
];

return [
  new Shape('9x9'),
  ...thermometers.map(cells => new Thermo(...cells)),
  ...evenCells.map(cell => new Given(cell, 2, 4, 6, 8)),
  ...blackDots.map(cells => new BlackDot(...cells)),
];
