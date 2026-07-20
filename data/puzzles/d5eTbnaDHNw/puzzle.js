// Title: Aargh!
// Author: Jaxar
// Video: https://www.youtube.com/watch?v=d5eTbnaDHNw
// Source: https://sudokupad.app/7ls9303nax

// Grey lines contain consecutive digits in one consistent direction.
const consecutiveKey = Pair.fnToKey((a, b) => Math.abs(a - b) === 1, 9);
const orderedConsecutive = lines => lines.flatMap(cells => [
  new Pair(consecutiveKey, 'Consecutive', ...cells),
  new Or([
    new Thermo(...cells),
    new Thermo(...cells.toReversed()),
  ]),
]);

const greyLines = [
  ['R3C4', 'R4C3', 'R5C3', 'R6C3', 'R7C4'],
  ['R3C6', 'R4C7', 'R5C7', 'R6C7', 'R7C6'],
  ['R5C9', 'R6C8'],
];

const pinkLines = [
  ['R4C3', 'R4C4', 'R4C5', 'R5C6', 'R4C7'],
  ['R4C8', 'R5C8', 'R6C8', 'R7C8', 'R8C8', 'R9C8'],
];

const thermometers = [
  ['R9C7', 'R9C6', 'R8C5', 'R7C4'],
  ['R9C7', 'R9C6', 'R8C5', 'R7C6'],
  ['R9C3', 'R9C4', 'R8C5'],
];

const xEdges = [
  ['R2C5', 'R3C5'],
  ['R3C7', 'R3C8'],
  ['R3C2', 'R3C3'],
  ['R6C4', 'R7C4'],
  ['R6C5', 'R7C5'],
  ['R6C6', 'R7C6'],
];

return [
  new Shape('9x9'),

  ...orderedConsecutive(greyLines),
  ...pinkLines.map(cells => new Renban(...cells)),
  new RegionSumLine(
    'R1C2', 'R2C2', 'R3C2',
    'R4C2', 'R5C2', 'R6C2',
    'R7C2', 'R8C2', 'R9C2',
  ),
  ...thermometers.map(cells => new Thermo(...cells)),

  new Given('R5C6', 2, 4, 6, 8),
  new Given('R5C4', 1, 3, 5, 7, 9),
  ...xEdges.map(cells => new X(...cells)),
  new BlackDot('R5C5', 'R6C5'),

  new Cage(42, 'R2C4', 'R2C6', 'R3C3', 'R3C4', 'R3C5', 'R3C6', 'R3C7'),
  new Cage(13, 'R7C1', 'R7C2', 'R7C3'),
];
