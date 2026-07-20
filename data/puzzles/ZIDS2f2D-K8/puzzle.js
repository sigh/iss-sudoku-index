// Title: Euro-Holiday: Germany
// Author: RoystonDA
// Video: https://www.youtube.com/watch?v=ZIDS2f2D-K8
// Source: https://sudokupad.app/4p33ukq3kd

// German whispers; closed paths repeat their first cell to constrain the closing edge.
const whispers = [
  ['R2C1', 'R3C2', 'R2C3', 'R1C2'],
  ['R2C4', 'R2C5', 'R2C6', 'R3C5', 'R2C4'],
  ['R2C4', 'R1C5', 'R2C6'],
  ['R4C2', 'R5C2', 'R6C2', 'R5C1', 'R4C2'],
  ['R4C2', 'R5C3', 'R6C2'],
  ['R6C7', 'R7C6', 'R8C7', 'R7C8', 'R6C7'],
  ['R4C7', 'R4C8', 'R4C9', 'R5C8', 'R4C7'],
  ['R4C7', 'R3C8', 'R4C9'],
  ['R7C4', 'R8C4', 'R9C4', 'R8C3', 'R7C4'],
  ['R7C4', 'R8C5', 'R9C4'],
];

// Grey thermometers, from bulb to tip. The final two share their R7C7 bulb.
const thermos = [
  ['R5C4', 'R5C3', 'R5C2', 'R5C1'],
  ['R1C5', 'R2C5', 'R3C5'],
  ['R7C7', 'R6C6', 'R5C5', 'R4C4', 'R3C3', 'R3C2'],
  ['R7C7', 'R8C7'],
];

const whiteDots = [
  ['R1C3', 'R1C4'],
  ['R9C5', 'R9C6'],
];

return [
  new Shape('9x9'),
  ...whispers.map(cells => new Whisper(5, ...cells)),
  ...thermos.map(cells => new Thermo(...cells)),
  ...whiteDots.map(cells => new WhiteDot(...cells)),
];
