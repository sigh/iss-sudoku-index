// Title: Weird Bug
// Author: Jay Dyer
// Video: https://www.youtube.com/watch?v=ZLfC5xE1jH0
// Source: https://sudokupad.app/by04qqkuna

// Normal Sudoku applies. Each purple line contains a non-repeating consecutive
// set in any order. Digits joined by a black dot are in a 1:2 ratio.

// Purple line paths transcribed from the source's eight Renban entries.
const renbans = [
  ['R3C6', 'R2C6', 'R1C5'],
  ['R6C3', 'R6C2', 'R5C1'],
  ['R4C4', 'R5C5', 'R6C6'],
  ['R4C5', 'R5C6', 'R4C6', 'R3C7', 'R2C8'],
  ['R6C5', 'R5C4', 'R6C4', 'R7C3', 'R8C2'],
  ['R9C6', 'R9C7', 'R8C7', 'R7C8', 'R7C9', 'R6C9'],
  ['R3C9', 'R4C8', 'R5C7'],
  ['R7C5', 'R8C4', 'R9C3'],
];

// Black-dot cell pairs transcribed from the source's ratio entries.
const blackDots = [
  ['R3C7', 'R3C8'], ['R2C7', 'R3C7'], ['R7C3', 'R8C3'],
  ['R7C3', 'R7C2'], ['R7C7', 'R7C6'], ['R7C7', 'R6C7'],
  ['R4C6', 'R4C5'], ['R6C4', 'R6C5'], ['R1C4', 'R1C3'],
  ['R3C1', 'R4C1'],
];

return [
  new Shape('9x9'),
  ...renbans.map((cells) => new Renban(...cells)),
  ...blackDots.map(([a, b]) => new BlackDot(a, b)),
];
