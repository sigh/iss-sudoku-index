// Title: Studious
// Author: James Sinclair
// Video: https://www.youtube.com/watch?v=qEGLhzb_IZE
// Source: https://sudokupad.app/james-sinclair/studious

// Green lines are German whispers with a minimum adjacent difference of 5.
const whispers = [
  new Whisper(5, 'R1C1', 'R1C2', 'R1C3', 'R2C3', 'R2C2', 'R2C1'),
  new Whisper(5, 'R9C9', 'R8C9', 'R7C9', 'R7C8', 'R8C8', 'R9C8'),
  new Whisper(5, 'R2C9', 'R1C9', 'R1C8', 'R1C7'),
  new Whisper(5, 'R2C5', 'R3C4', 'R4C5'),
];

const renbans = [
  new Renban('R3C5', 'R3C6', 'R4C7', 'R5C7'),
  new Renban('R6C1', 'R7C1', 'R8C1', 'R9C2', 'R9C3', 'R9C4'),
  new Renban('R6C6', 'R6C7', 'R5C8'),
];

// Each Arrow lists its one-cell bulb first and its arm cells afterward.
const arrows = [
  new Arrow('R9C7', 'R8C7', 'R7C7'),
  new Arrow('R3C3', 'R3C2', 'R3C1'),
  new Arrow('R6C5', 'R7C4', 'R7C3'),
  new Arrow('R6C5', 'R6C4', 'R5C4'),
];

return [
  new Shape('9x9'),
  ...whispers,
  ...renbans,
  ...arrows,
];
