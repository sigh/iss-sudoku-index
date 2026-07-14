// Title: Decode Presented by RTX
// Author: Yahya Alasady
// Video: https://www.youtube.com/watch?v=eopPSdrMKUY
// Source: https://sudokupad.app/ceyt69ga5p

// Red and blue paths are split by box because their sums apply separately
// within every 3x3 box. Repeated path endpoints are counted only once.

const whispers = [
  ['R5C2', 'R5C3', 'R5C4'],
  ['R4C8', 'R4C7', 'R4C6'],
  ['R6C8', 'R6C7', 'R6C6'],
];

const renbans = [
  ['R4C2', 'R4C3', 'R4C4'],
  ['R6C2', 'R6C3', 'R6C4'],
  ['R5C8', 'R5C7', 'R5C6'],
];

const blueBoxSegments = [
  ['R1C1', 'R1C2', 'R2C1', 'R3C1'],
  ['R4C1', 'R5C1'],
  ['R7C7', 'R7C8', 'R8C7', 'R8C8'],
];

const redBoxSegments = [
  ['R1C8', 'R1C9', 'R2C9', 'R3C9'],
  ['R4C9', 'R5C9'],
  ['R7C2', 'R7C3', 'R8C2', 'R8C3'],
];

const oddCircles = [
  'R1C1', 'R2C5', 'R2C9', 'R3C1',
  'R3C9', 'R4C9', 'R7C2', 'R8C9',
];

const evenCircles = [
  'R1C9', 'R2C1', 'R2C8', 'R3C2', 'R4C1',
  'R5C1', 'R5C5', 'R5C9', 'R7C4', 'R9C9',
];

return [
  new Shape('9x9'),
  new Given('R6C1', 9),
  new Given('R8C6', 9),

  new Cage(11, 'R1C6', 'R1C7'),
  new Cage(4, 'R1C3', 'R1C4'),

  ...whispers.map(cells => new Whisper(5, ...cells)),
  ...renbans.map(cells => new Renban(...cells)),

  ...blueBoxSegments.map(cells => new Sum(14, ...cells)),
  ...redBoxSegments.map(cells => new Sum(17, ...cells)),

  ...oddCircles.map(cell => new Given(cell, 1, 3, 5, 7, 9)),
  ...evenCircles.map(cell => new Given(cell, 2, 4, 6, 8)),
];
