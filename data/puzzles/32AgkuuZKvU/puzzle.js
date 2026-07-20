// Title: wicked
// Author: arctan
// Video: https://www.youtube.com/watch?v=32AgkuuZKvU
// Source: https://sudokupad.app/ota96nsdfv

// Pink lines are renbans; green lines are German whispers with difference 5.
const renbans = [
  new Renban('R6C3', 'R5C3', 'R4C3'),
  new Renban('R7C4', 'R7C5', 'R7C6'),
  new Renban('R7C1', 'R7C2', 'R7C3', 'R8C3', 'R9C3'),
];

const whispers = [
  new Whisper(5, 'R3C4', 'R3C5', 'R3C6'),
  new Whisper(5, 'R6C7', 'R5C7', 'R4C7'),
  new Whisper(5, 'R1C8', 'R2C7', 'R3C8', 'R2C9'),
];

const xClues = [
  new X('R1C3', 'R2C3'),
  new X('R7C8', 'R7C9'),
  new X('R4C1', 'R5C1'),
  new X('R9C5', 'R9C6'),
  new X('R5C9', 'R6C9'),
  new X('R1C4', 'R1C5'),
  new X('R1C6', 'R2C6'),
  new X('R4C8', 'R4C9'),
];

const vClues = [
  new V('R8C7', 'R9C7'),
  new V('R3C1', 'R3C2'),
  new V('R4C4', 'R5C4'),
  new V('R6C5', 'R6C6'),
];

return [
  new Shape('9x9'),
  new Given('R2C2', 7),
  new Given('R8C8', 8),
  ...renbans,
  ...whispers,
  ...xClues,
  ...vClues,
];
