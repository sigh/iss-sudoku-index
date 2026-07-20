// Title: Let's Get Kraken
// Author: James Kopp
// Video: https://www.youtube.com/watch?v=4vZi1NDZTYU
// Source: https://sudokupad.app/foesxbaf60

// Grey thermometers are nondecreasing rather than strictly increasing.
const weakThermoKey = Pair.fnToKey((a, b) => a <= b, 9);
const thermometers = [
  ['R6C5', 'R7C4', 'R8C3', 'R9C3'],
  ['R6C5', 'R7C6', 'R8C7', 'R9C7'],
  ['R4C6', 'R3C7', 'R3C8', 'R2C9', 'R1C9'],
  ['R4C4', 'R3C3', 'R3C2', 'R2C2', 'R1C1'],
];

const blueLines = [
  ['R6C1', 'R5C2', 'R5C3', 'R5C4', 'R4C5', 'R5C6', 'R5C7', 'R5C8', 'R4C9'],
  ['R8C1', 'R8C2', 'R7C3', 'R6C4', 'R5C5', 'R6C6', 'R7C7', 'R8C8', 'R8C9'],
];

// Repeat the first cell to constrain the closing edge of the green loop.
const greenLoop = [
  'R6C7', 'R7C6', 'R7C5', 'R7C4', 'R6C3', 'R5C3', 'R4C3',
  'R3C4', 'R3C5', 'R3C6', 'R4C7', 'R5C7', 'R6C7',
];

return [
  new Shape('9x9'),

  new Cage(8, 'R6C3', 'R6C4'),
  new Cage(8, 'R3C9', 'R4C9'),
  new Cage(8, 'R5C5', 'R6C5'),
  new Cage(8, 'R4C3', 'R4C4'),
  new Cage(8, 'R2C7', 'R2C8'),

  ...thermometers.map(cells => new Pair(weakThermoKey, 'weak thermo', ...cells)),
  ...blueLines.map(cells => new RegionSumLine(...cells)),
  new Whisper(5, ...greenLoop),
];
