// Title: From Albany to Buffalo
// Author: Walking Writer
// Video: https://www.youtube.com/watch?v=BfH8FXE2ffE
// Source: https://sudokupad.app/fmcdu9br5g

// Box borders split the blue line into equal-sum segments.
const blueLine = [
  'R5C5', 'R4C5', 'R3C5', 'R3C6', 'R3C7',
  'R2C8', 'R3C9', 'R3C8', 'R4C8', 'R5C8',
];

const greenLines = [
  ['R8C1', 'R7C2', 'R6C3', 'R5C4', 'R6C5', 'R7C6', 'R8C5', 'R9C4'],
  ['R3C5', 'R4C4'],
];
const orangeLine = ['R6C5', 'R5C6', 'R4C7', 'R3C8'];

return [
  new Shape('9x9'),

  new Given('R1C1', 2),
  new Given('R1C6', 8),
  new Given('R2C6', 3),
  new Given('R3C1', 3),
  new Given('R4C2', 6),
  new Given('R5C3', 3),
  new Given('R6C9', 5),
  new Given('R7C8', 2),
  new Given('R8C7', 8),
  new Given('R9C6', 1),

  new RegionSumLine(...blueLine),
  ...greenLines.map(cells => new Whisper(5, ...cells)),
  new Whisper(4, ...orangeLine),
  new BlackDot('R2C8', 'R3C8'),
  new Given('R1C2', 1, 3, 5, 7, 9),
  new Given('R1C3', 1, 3, 5, 7, 9),
];
