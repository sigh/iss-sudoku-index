// Title: Oh Bobbins
// Author: apetersen
// Video: https://www.youtube.com/watch?v=caYxcynuV5o
// Source: https://sudokupad.app/ushr6uitov

// The braille letters formed by the dot layout are thematic; the stated digit
// rules are represented by the Kropki and whisper constraints below.
const whiteDots = [
  ['R1C4', 'R1C5'],
  ['R2C4', 'R2C5'],
  ['R2C5', 'R2C6'],
  ['R4C1', 'R4C2'],
  ['R5C2', 'R5C3'],
  ['R6C1', 'R6C2'],
  ['R7C4', 'R7C5'],
  ['R7C5', 'R7C6'],
  ['R8C5', 'R8C6'],
  ['R9C4', 'R9C5'],
  ['R4C4', 'R4C5'],
  ['R5C4', 'R5C5'],
  ['R4C7', 'R4C8'],
  ['R5C7', 'R5C8'],
];

const blackDots = [
  ['R1C1', 'R1C2'],
  ['R2C2', 'R2C3'],
  ['R3C1', 'R3C2'],
  ['R1C7', 'R1C8'],
  ['R2C7', 'R2C8'],
  ['R7C2', 'R7C3'],
  ['R8C1', 'R8C2'],
  ['R9C7', 'R9C8'],
  ['R8C7', 'R8C8'],
  ['R7C8', 'R7C9'],
];

const greenLines = [
  ['R1C5', 'R2C5'],
  ['R7C2', 'R8C2', 'R9C3'],
  ['R5C2', 'R6C3'],
  ['R7C8', 'R8C8', 'R9C7'],
  ['R5C8', 'R6C7'],
  ['R2C2', 'R3C2'],
  ['R2C8', 'R3C8'],
  ['R4C5', 'R5C5'],
];

return [
  new Shape('9x9'),
  ...whiteDots.map(cells => new WhiteDot(...cells)),
  ...blackDots.map(cells => new BlackDot(...cells)),
  ...greenLines.map(cells => new Whisper(5, ...cells)),
];
