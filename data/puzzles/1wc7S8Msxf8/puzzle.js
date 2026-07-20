// Title: Fount
// Author: Yarr
// Video: https://www.youtube.com/watch?v=1wc7S8Msxf8
// Source: https://sudokupad.app/srlefwqhfo

// Connected source fragments of the same colour are joined into complete lines.
const renbans = [
  ['R6C4', 'R5C4', 'R4C4', 'R3C4', 'R3C5', 'R3C6'],
  ['R2C5', 'R2C6', 'R1C6', 'R1C7'],
  ['R3C3', 'R3C2', 'R3C1', 'R4C1', 'R5C1', 'R5C2'],
  ['R3C7', 'R3C8', 'R3C9', 'R4C9', 'R5C9'],
  ['R4C5', 'R4C6', 'R5C6', 'R6C6', 'R6C5', 'R5C5'],
  ['R6C7', 'R6C8', 'R6C9', 'R7C9', 'R7C8'],
];

const whispers = [
  ['R2C4', 'R2C3', 'R2C2'],
  ['R4C3', 'R5C3', 'R6C3', 'R7C3', 'R8C3', 'R8C4'],
  ['R9C2', 'R9C3'],
  ['R8C6', 'R8C7'],
];

const whiteDots = [
  ['R3C5', 'R2C5'],
  ['R6C1', 'R7C1'],
  ['R1C4', 'R1C5'],
  ['R2C8', 'R1C8'],
  ['R4C8', 'R4C9'],
];

return [
  new Shape('9x9'),
  ...renbans.map(cells => new Renban(...cells)),
  ...whispers.map(cells => new Whisper(5, ...cells)),
  ...whiteDots.map(cells => new WhiteDot(...cells)),
  new BlackDot('R8C5', 'R7C5'),
];
