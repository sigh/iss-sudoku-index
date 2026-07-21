// Title: Some Like It Hot
// Author: James Kopp
// Video: https://www.youtube.com/watch?v=XgcOW24QN8o
// Source: https://sudokupad.app/8i5xr72ala

// Digits strictly increase along each thermometer from its bulb to its tip.
const thermometers = [
  ['R2C1', 'R1C1', 'R1C2', 'R2C2'],
  ['R1C8', 'R1C9', 'R2C9', 'R2C8'],
  ['R8C1', 'R8C2', 'R9C2'],
  ['R8C8', 'R8C9', 'R9C9'],
  ['R4C2', 'R4C3', 'R3C3', 'R3C4', 'R3C5', 'R4C5'],
  ['R6C2', 'R6C3', 'R7C3', 'R7C4', 'R7C5', 'R6C5'],
  ['R4C9', 'R4C8', 'R3C8', 'R3C7', 'R3C6', 'R4C6'],
  ['R6C6', 'R7C6', 'R7C7', 'R7C8', 'R6C8', 'R6C9'],
];

return [
  new Shape('9x9'),
  ...thermometers.map(cells => new Thermo(...cells)),
];
