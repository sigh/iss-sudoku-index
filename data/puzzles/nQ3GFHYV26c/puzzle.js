// Title: Foggy Fireworks
// Author: Chloe
// Video: https://www.youtube.com/watch?v=nQ3GFHYV26c
// Source: https://sudokupad.app/r411ysr073

// Fog controls clue reveal in the source UI and adds no final-grid constraint.
const thermos = [
  ['R3C7', 'R2C6', 'R2C5'],
  ['R3C7', 'R2C7', 'R1C8', 'R1C9'],
  ['R3C7', 'R3C8', 'R3C9'],
  ['R3C7', 'R3C6', 'R4C5'],
  ['R3C7', 'R4C8', 'R5C8'],
].map(cells => new Thermo(...cells));

const regionSumLines = [
  ['R6C4', 'R5C4', 'R4C4', 'R3C3'],
  ['R6C2', 'R5C2', 'R6C3', 'R7C4', 'R7C3', 'R8C2'],
  ['R7C5', 'R6C5', 'R5C6'],
].map(cells => new RegionSumLine(...cells));

const whispers = [
  ['R1C1', 'R2C2', 'R3C2', 'R4C2', 'R3C3', 'R3C4'],
  ['R2C3', 'R1C4', 'R1C5'],
].map(cells => new Whisper(5, ...cells));

const renbans = [
  ['R6C7', 'R7C8', 'R8C8', 'R9C8'],
  ['R9C7', 'R8C7', 'R7C6'],
].map(cells => new Renban(...cells));

const entropicLines = [
  ['R9C3', 'R8C3', 'R7C2', 'R7C1'],
  ['R9C4', 'R8C4', 'R7C5'],
  ['R8C1', 'R9C2'],
].map(cells => new Entropic(...cells));

const whiteDots = [
  new WhiteDot('R6C4', 'R7C4'),
  new WhiteDot('R6C8', 'R6C9'),
  new WhiteDot('R7C5', 'R7C6'),
];

return [
  new Shape('9x9'),
  new Given('R6C7', 3),
  new Given('R9C9', 6),
  ...thermos,
  ...regionSumLines,
  ...whispers,
  ...renbans,
  ...entropicLines,
  ...whiteDots,
  new Given('R1C6', 1, 3, 5, 7, 9),
  new Given('R4C9', 1, 3, 5, 7, 9),
];
