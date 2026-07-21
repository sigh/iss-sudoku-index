// Title: Los Tres Amigos
// Author: Blobz
// Video: https://www.youtube.com/watch?v=A7VFa7wg4OM
// Source: https://sudokupad.app/blobz/los-tres-amigos

// Each loop starts immediately after a box crossing. This keeps every Region
// Sum segment contiguous without duplicating a cell at the cyclic join.
const loops = [
  [
    'R4C1', 'R5C2', 'R5C3', 'R5C4', 'R4C5', 'R3C5',
    'R2C5', 'R1C4', 'R1C3', 'R1C2', 'R2C1', 'R3C1',
  ],
  [
    'R7C9', 'R8C9', 'R9C8', 'R9C7', 'R9C6', 'R8C5',
    'R7C5', 'R6C5', 'R5C6', 'R5C7', 'R5C8', 'R6C9',
  ],
  [
    'R3C4', 'R3C5', 'R3C6', 'R4C7', 'R5C7', 'R6C7',
    'R7C6', 'R7C5', 'R7C4', 'R6C3', 'R5C3', 'R4C3',
  ],
];

const greyCircles = [
  'R1C3', 'R1C9', 'R2C2', 'R2C5', 'R3C5', 'R3C8',
  'R4C2', 'R4C8', 'R5C4', 'R5C6', 'R6C1', 'R6C7',
  'R7C1', 'R7C3', 'R8C4', 'R8C6', 'R9C7', 'R9C9',
];

const noTotalCages = [
  [
    'R2C2', 'R2C3', 'R2C4',
    'R3C2', 'R3C3', 'R3C4',
    'R4C2', 'R4C3', 'R4C4',
  ],
  [
    'R6C6', 'R6C7', 'R6C8',
    'R7C6', 'R7C7', 'R7C8',
    'R8C6', 'R8C7', 'R8C8',
  ],
];

const lineTypes = {
  // Repeat two cells so every cyclic window of three is checked.
  entropic: cells => new Entropic(...cells, cells[0], cells[1]),
  // Repeat one cell so the closing edge is checked.
  whisper: cells => new Whisper(5, ...cells, cells[0]),
  regionSum: cells => new RegionSumLine(...cells),
};

const assignments = [
  ['entropic', 'whisper', 'regionSum'],
  ['entropic', 'regionSum', 'whisper'],
  ['whisper', 'entropic', 'regionSum'],
  ['whisper', 'regionSum', 'entropic'],
  ['regionSum', 'entropic', 'whisper'],
  ['regionSum', 'whisper', 'entropic'],
].map(types => new And(types.map((type, index) => lineTypes[type](loops[index]))));

return [
  new Shape('9x9'),
  ...noTotalCages.map(cells => new AllDifferent(...cells)),
  new Cage(8, 'R8C1', 'R9C1'),
  ...greyCircles.map(cell => new Given(cell, 1, 9)),
  new Or(assignments),
];
