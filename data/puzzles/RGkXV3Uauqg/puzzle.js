// Title: Connectivity
// Author: Fenners
// Video: https://www.youtube.com/watch?v=RGkXV3Uauqg
// Source: https://sudokupad.app/vagzppve3v

// The central pink clue is one connected Renban drawn as two stroke entries.
const renbans = [
  new Renban('R3C5', 'R2C6', 'R1C5'),
  new Renban('R5C1', 'R6C2', 'R5C3'),
  new Renban('R9C4', 'R9C5', 'R8C6'),
  new Renban('R6C8', 'R5C9', 'R4C9'),
  new Renban(
    'R5C5', 'R5C6', 'R6C5', 'R6C6', 'R7C7',
    'R8C8', 'R8C9', 'R9C9', 'R9C8',
  ),
];

const regionSumLines = [
  new RegionSumLine('R4C1', 'R3C2', 'R2C2', 'R2C3', 'R1C4'),
  new RegionSumLine('R7C9', 'R7C8', 'R6C7', 'R7C6', 'R8C7', 'R9C7'),
];

const whispers = [
  new Whisper(5, 'R3C2', 'R3C3', 'R2C3'),
  new Whisper(5, 'R7C4', 'R7C5'),
  new Whisper(5, 'R4C7', 'R5C7'),
  new Whisper(5, 'R3C6', 'R3C7'),
  new Whisper(5, 'R6C3', 'R7C3'),
];

const arrows = [
  new Arrow('R7C2', 'R8C2', 'R9C2'),
  new Arrow('R2C7', 'R2C8', 'R2C9'),
  new Arrow('R4C4', 'R5C4', 'R4C5'),
  new Arrow('R2C1', 'R1C1', 'R1C2'),
];

return [
  new Shape('9x9'),
  ...renbans,
  ...regionSumLines,
  ...whispers,
  ...arrows,
];
