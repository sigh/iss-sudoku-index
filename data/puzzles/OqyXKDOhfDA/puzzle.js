// Title: Zoom Out
// Author: Myxo
// Video: https://www.youtube.com/watch?v=OqyXKDOhfDA
// Source: https://sudokupad.app/vlkzbme0k2

// Standard 9x9 Sudoku, the three drawn givens, four grey thermometers, and
// twelve green German whisper segments are encoded.
// Givens transcribed from the grid.
const givens = [
  ['R1C8', 5],
  ['R5C5', 6],
  ['R9C2', 8],
];

// Thermometers transcribed bulb-first from the grey lines and circular bulbs.
const thermos = [
  ['R4C1', 'R3C2', 'R2C3', 'R1C4'],
  ['R6C9', 'R7C8', 'R8C7', 'R9C6'],
  ['R8C5', 'R7C4', 'R6C3', 'R5C4'],
  ['R2C5', 'R3C6', 'R4C7', 'R5C6'],
];

// German whisper segments transcribed from the green lines.
const whispers = [
  ['R1C2', 'R1C3'], ['R2C1', 'R3C1'], ['R7C9', 'R8C9'],
  ['R9C7', 'R9C8'], ['R3C5', 'R4C5'], ['R6C5', 'R7C5'],
  ['R5C7', 'R5C8'], ['R5C2', 'R5C3'], ['R9C3', 'R9C4'],
  ['R6C1', 'R7C1'], ['R3C9', 'R4C9'], ['R1C6', 'R1C7'],
];

return [
  new Shape('9x9'),
  ...givens.map(([cell, value]) => new Given(cell, value)),
  ...thermos.map(cells => new Thermo(...cells)),
  ...whispers.map(cells => new Whisper(5, ...cells)),
];
