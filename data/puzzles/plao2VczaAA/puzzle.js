// Title: Spinning Top
// Author: Phistomefel
// Video: https://www.youtube.com/watch?v=plao2VczaAA
// Source: https://sudokupad.app/1imy136lv4

// Pink lines are renban lines; green lines are German whispers with difference 5.
const renbanLines = [
  ['R8C9', 'R9C8'],
  ['R4C7', 'R3C8', 'R4C9', 'R5C9'],
  ['R7C4', 'R8C3', 'R9C4', 'R9C5'],
  ['R5C7', 'R6C6', 'R7C5'],
  ['R5C5', 'R4C4'],
  ['R2C7', 'R1C7', 'R1C6', 'R1C5'],
  ['R7C2', 'R7C1', 'R6C1', 'R5C1'],
  ['R2C2', 'R3C3'],
];

const whisperLines = [
  ['R7C5', 'R7C6', 'R8C7', 'R9C6'],
  ['R5C7', 'R6C7', 'R7C8', 'R6C9'],
  // Repeat the first cell to enforce the closing edge of the central loop.
  ['R5C6', 'R4C5', 'R5C4', 'R6C5', 'R5C6'],
  ['R2C4', 'R3C4', 'R4C4', 'R4C3', 'R4C2'],
];

return [
  new Shape('9x9'),
  new Given('R2C8', 1),
  new Given('R8C2', 8),
  new Given('R8C8', 6),
  ...renbanLines.map(cells => new Renban(...cells)),
  ...whisperLines.map(cells => new Whisper(5, ...cells)),
];
