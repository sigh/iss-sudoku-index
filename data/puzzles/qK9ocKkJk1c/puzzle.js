// Title: Happy Birthday Finnegan!
// Author: Radiantsongbird
// Video: https://www.youtube.com/watch?v=qK9ocKkJk1c
// Source: https://sudokupad.app/17lce99tzd

// Adjacent digits on each green line differ by at least 5.
const whisperLines = [
  [
    'R6C9', 'R5C8', 'R4C8', 'R3C8', 'R2C8', 'R1C7', 'R2C6', 'R3C6',
    'R4C5', 'R4C4', 'R5C3', 'R5C2', 'R6C1', 'R7C2', 'R7C3', 'R7C4',
    'R8C5', 'R9C6',
  ],
  ['R7C2', 'R6C3'],
  ['R2C7', 'R3C7'],
];

// Box borders split each blue line into equal-sum segments.
const regionSumLines = [
  ['R9C5', 'R8C6', 'R7C7', 'R6C8', 'R5C9'],
  ['R3C2', 'R3C3', 'R2C4', 'R1C4', 'R1C3', 'R2C2'],
  ['R2C5', 'R3C5', 'R3C4', 'R4C3', 'R4C2'],
  ['R8C2', 'R8C3', 'R9C4', 'R9C3', 'R9C2'],
];

return [
  new Shape('9x9'),
  new Given('R1C9', 5),
  new Given('R2C3', 8),
  new Given('R2C4', 1),
  new Given('R2C5', 5),
  new Given('R5C6', 1),
  new Given('R7C7', 8),
  new Given('R9C2', 5),
  ...whisperLines.map(cells => new Whisper(5, ...cells)),
  ...regionSumLines.map(cells => new RegionSumLine(...cells)),
  new Quad('R8C5', 8, 1, 5),
  new Quad('R5C1', 8, 1, 5),
  new BlackDot('R5C3', 'R5C4'),
];
