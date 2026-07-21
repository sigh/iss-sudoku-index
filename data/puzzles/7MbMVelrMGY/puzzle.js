// Title: Keypad Cross Out
// Author: Greenscribble24
// Video: https://www.youtube.com/watch?v=7MbMVelrMGY
// Source: https://sudokupad.app/kllmj2p8f7

// Every coloured line is simultaneously entropic and modular.
const colouredLines = [
  ['R4C5', 'R5C5', 'R6C5'],
  ['R4C2', 'R5C2', 'R6C3'],
  ['R6C9', 'R7C9', 'R8C9'],
  ['R1C4', 'R1C5', 'R2C5'],
  [
    'R7C4', 'R6C3', 'R5C3', 'R4C3', 'R3C4', 'R3C5',
    'R3C6', 'R4C6', 'R4C7', 'R5C7',
  ],
  ['R9C7', 'R8C7', 'R9C8'],
];

const betweenLines = [
  ['R5C1', 'R4C1', 'R3C1'],
  ['R1C9', 'R2C9', 'R3C9', 'R4C9'],
  ['R5C9', 'R6C9', 'R5C8'],
  ['R6C7', 'R6C8', 'R7C8'],
  ['R8C2', 'R9C3', 'R9C4'],
  ['R1C4', 'R1C5', 'R2C5'],
  ['R4C3', 'R5C3', 'R6C3'],
];

const givens = [
  ['R1C9', 3],
  ['R6C3', 1],
  ['R6C7', 2],
  ['R7C8', 5],
  ['R8C9', 2],
  ['R9C1', 3],
  ['R9C8', 8],
];

return [
  new Shape('9x9'),
  ...givens.map(([cell, value]) => new Given(cell, value)),
  new Diagonal(-1), // Marked main diagonal, R1C1-R9C9.
  ...betweenLines.map(cells => new Between(...cells)),
  ...colouredLines.map(cells => new Entropic(...cells)),
  ...colouredLines.map(cells => new Modular(3, ...cells)),
];
