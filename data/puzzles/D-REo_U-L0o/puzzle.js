// Title: Orbit
// Author: Gerhard1963
// Video: https://www.youtube.com/watch?v=D-REo_U-L0o
// Source: https://sudokupad.app/5ukl9ip012

// Standard Sudoku, Orbital Whispers, the drawn non-negative Kropki dots, and the
// marked rising diagonal are encoded below.

const orbitalWhisperLines = [
  ['R5C3', 'R4C3', 'R3C4', 'R3C5'],
  ['R7C5', 'R7C6', 'R6C7', 'R5C7'],
  ['R8C1', 'R9C2'],
  ['R8C9', 'R9C8'],
  ['R1C8', 'R2C9'],
  ['R1C2', 'R2C1'],
];

const orbitalWhispers = orbitalWhisperLines.map(cells => new Whisper(8, ...cells));

// Dot coordinates transcribed from the drawn white and black Kropki marks.
const whiteDots = [
  ['R2C1', 'R3C1'], ['R1C2', 'R1C3'], ['R9C7', 'R9C8'],
  ['R7C9', 'R8C9'], ['R5C3', 'R5C4'], ['R5C6', 'R5C7'],
  ['R2C5', 'R3C5'], ['R7C5', 'R8C5'], ['R2C8', 'R2C9'],
  ['R8C2', 'R9C2'], ['R9C3', 'R9C4'], ['R1C6', 'R1C7'],
  ['R6C9', 'R7C9'], ['R3C1', 'R4C1'], ['R3C1', 'R3C2'],
  ['R7C8', 'R7C9'], ['R1C3', 'R1C4'], ['R9C6', 'R9C7'],
  ['R4C9', 'R5C9'], ['R5C1', 'R6C1'], ['R2C6', 'R2C7'],
  ['R8C3', 'R8C4'],
];
const whiteKropki = whiteDots.map(cells => new WhiteDot(...cells));

return [
  new Shape('9x9'),
  ...orbitalWhispers,
  ...whiteKropki,
  new BlackDot('R7C1', 'R7C2'),
  new Diagonal(1),
];
