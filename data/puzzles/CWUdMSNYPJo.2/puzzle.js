// Title: My first Irrequadri
// Author: damasosos92
// Video: https://www.youtube.com/watch?v=CWUdMSNYPJo
// Source: https://sudokupad.app/nz3ntjqn78

// Digits 1-9 do not repeat in each row, column, or drawn 9-cell region.
// Adjacent digits on every green line differ by at least 5.
const shape = new Shape('6x6', 9);

// Region cells transcribed from the four outlined irregular regions.
const regions = [
  ['R1C1', 'R1C2', 'R1C3', 'R2C1', 'R3C1', 'R4C1', 'R5C1', 'R6C1', 'R6C2'],
  ['R3C3', 'R3C4', 'R4C3', 'R4C4', 'R4C5', 'R5C4', 'R5C5', 'R6C3', 'R6C4'],
  ['R2C2', 'R2C3', 'R2C4', 'R2C5', 'R3C2', 'R3C5', 'R4C2', 'R5C2', 'R5C3'],
  ['R1C4', 'R1C5', 'R1C6', 'R2C6', 'R3C6', 'R4C6', 'R5C6', 'R6C5', 'R6C6'],
];

// Green-line paths transcribed from the drawn line segments.
const whispers = [
  ['R6C2', 'R5C2', 'R4C2', 'R4C3', 'R4C4', 'R4C5', 'R5C5', 'R6C5'],
  ['R4C6', 'R4C5', 'R3C5', 'R2C5', 'R1C5', 'R1C6', 'R2C6'],
  ['R2C5', 'R2C4'],
  ['R2C1', 'R1C1', 'R1C2', 'R2C2', 'R3C2', 'R4C2', 'R4C1'],
  ['R3C3', 'R3C4'],
  ['R5C1', 'R6C1'],
];

return [
  shape,
  new NoBoxes(),
  new RegionSize(9),
  ...regions.map(cells => new Jigsaw('6x6~9', ...cells)),
  new Given('R6C3', 6),
  ...whispers.map(cells => new Whisper(5, ...cells)),
];
