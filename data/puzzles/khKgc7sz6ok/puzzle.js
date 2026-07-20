// Title: Threedoku
// Author: James Kopp
// Video: https://www.youtube.com/watch?v=khKgc7sz6ok
// Source: https://sudokupad.app/jwyxh2qwad

// Orange lines require adjacent digits to differ by at least four.
const orangeLines = [
  ['R1C1', 'R1C2', 'R1C3', 'R2C3', 'R3C3', 'R3C2', 'R3C1'],
  ['R2C3', 'R2C2'],
  ['R1C7', 'R1C8', 'R1C9', 'R2C9', 'R3C9', 'R3C8', 'R3C7'],
  ['R2C9', 'R2C8'],
  ['R7C1', 'R7C2', 'R7C3', 'R8C3', 'R9C3', 'R9C2', 'R9C1'],
  ['R8C3', 'R8C2'],
  ['R7C7', 'R7C8', 'R7C9', 'R8C9', 'R9C9', 'R9C8', 'R9C7'],
  ['R8C9', 'R8C8'],
  ['R6C7', 'R7C6', 'R8C5'],
  ['R4C3', 'R3C4', 'R2C5'],
  ['R7C4', 'R6C3', 'R5C2'],
  ['R3C6', 'R4C7', 'R5C8'],
].map(cells => new Whisper(4, ...cells));

const sumThreeCages = [
  new Cage(3, 'R2C3', 'R2C4'),
  new Cage(3, 'R3C2', 'R4C2'),
  new Cage(3, 'R9C5', 'R9C6'),
  new Cage(3, 'R6C7', 'R7C7'),
];

return [
  new Shape('9x9'),
  ...orangeLines,
  ...sumThreeCages,
  new Given('R5C5', 2, 4, 6, 8),
];
