// Title: Heatstroke
// Author: Emmett Cito
// Video: https://www.youtube.com/watch?v=TQXcEoLc_PY
// Source: https://sudokupad.app/4otpj4l7xo

// Forked drawings are separate thermometers sharing a bulb and initial stem.
const thermometers = [
  ['R1C1', 'R1C2'],
  ['R2C2', 'R2C3', 'R1C4'],
  ['R2C2', 'R2C3', 'R3C4'],
  ['R2C8', 'R2C7', 'R1C6'],
  ['R2C8', 'R2C7', 'R3C6'],
  ['R5C7', 'R4C6', 'R3C5'],
  ['R4C8', 'R3C9'],
  ['R4C2', 'R3C3'],
  ['R5C2', 'R5C1'],
  ['R5C3', 'R4C4'],
  ['R5C3', 'R6C4'],
  ['R7C8', 'R7C7', 'R6C6'],
  ['R7C2', 'R6C3'],
  ['R8C2', 'R8C3', 'R7C4'],
  ['R8C2', 'R8C3', 'R9C4'],
  ['R8C8', 'R8C7', 'R7C6'],
  ['R8C8', 'R8C7', 'R9C6'],
  ['R9C1', 'R9C2'],
  ['R8C9', 'R9C8'],
];

return [
  new Shape('9x9'),
  ...thermometers.map(cells => new Thermo(...cells)),
];
