// Title: Wobbly Whispers
// Author: Ben Gaunt
// Video: https://www.youtube.com/watch?v=f3oNryTCtK4
// Source: https://sudokupad.app/7fr0yash7p

const greenWhisper = ['R9C1', 'R8C1', 'R7C1'];

// Closed lines repeat their first cell so the final adjacent pair is constrained.
const yellowLines = [
  ['R4C4', 'R5C5', 'R6C6'],
  ['R6C4', 'R5C5', 'R4C6'],
  ['R4C1', 'R4C2', 'R4C3'],
  ['R6C7', 'R6C8', 'R6C9'],
  ['R1C1', 'R2C1', 'R3C1'],
  ['R8C4', 'R8C5', 'R8C6'],
  ['R8C5', 'R9C5'],
  ['R2C4', 'R2C5', 'R2C6'],
  ['R2C5', 'R1C5'],
  ['R3C2', 'R2C3', 'R1C3'],
  ['R7C2', 'R8C3', 'R9C3'],
  ['R7C7', 'R8C7', 'R8C8', 'R7C8', 'R7C7'],
  ['R2C7', 'R3C7', 'R3C8', 'R2C8', 'R2C7'],
];

const blackDots = [
  ['R3C1', 'R4C1'],
  ['R3C9', 'R4C9'],
  ['R2C5', 'R3C5'],
  ['R7C4', 'R7C5'],
  ['R9C6', 'R9C7'],
  ['R9C2', 'R9C3'],
];

const whiteDots = [
  ['R9C3', 'R9C4'],
  ['R7C5', 'R7C6'],
  ['R9C7', 'R9C8'],
  ['R3C5', 'R4C5'],
  ['R1C8', 'R1C9'],
  ['R2C8', 'R2C9'],
  ['R3C8', 'R3C9'],
];

const wobblyKey = Pair.fnToKey(
  (a, b) => Math.abs(a - b) === 3 || Math.abs(a - b) === 4,
  9,
);

const wobblyWhispers = yellowLines.flatMap(cells => {
  const distinctCells = [...new Set(cells)];
  return [
    new Pair(wobblyKey, 'Wobbly whisper', ...cells),
    new AllDifferent(...distinctCells),
  ];
});

return [
  new Shape('9x9'),
  new Whisper(5, ...greenWhisper),
  ...wobblyWhispers,
  ...blackDots.map(cells => new BlackDot(...cells)),
  ...whiteDots.map(cells => new WhiteDot(...cells)),
];
