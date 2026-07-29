// Title: Pressure Zone
// Author: Riffclown
// Video: https://www.youtube.com/watch?v=QSApWot65yc
// Source: https://app.crackingthecryptic.com/5ol2he9bbw

// Normal Sudoku rules apply. Grey thermometers increase from bulb to tip.
// Givens and thermometer paths are transcribed from the drawn puzzle data.
const givens = [
  ['R2C2', 9], ['R2C8', 5], ['R3C3', 1], ['R3C7', 9],
  ['R4C4', 5], ['R4C6', 3], ['R6C4', 2], ['R6C6', 1],
  ['R7C3', 3], ['R7C7', 5], ['R8C2', 8], ['R8C8', 6],
];

const thermos = [
  ['R7C5', 'R7C6', 'R6C7', 'R5C6'],
  ['R5C7', 'R4C7', 'R3C6', 'R4C5'],
  ['R5C3', 'R6C3', 'R7C4', 'R6C5'],
  ['R5C7', 'R5C8', 'R5C9'],
  ['R5C3', 'R5C2', 'R5C1'],
  ['R7C5', 'R8C5', 'R9C5', 'R9C6', 'R9C7'],
  ['R7C5', 'R8C5', 'R9C5', 'R9C4', 'R9C3'],
  ['R3C5', 'R3C4', 'R4C3', 'R5C4'],
  ['R3C5', 'R2C5', 'R1C4', 'R1C3'],
  ['R3C5', 'R2C5', 'R1C6', 'R1C7'],
  ['R8C7', 'R7C8', 'R6C8'],
  ['R8C3', 'R7C2', 'R6C2'],
  ['R4C2', 'R3C2', 'R2C3'],
  ['R4C8', 'R3C8', 'R2C7'],
];

return [
  new Shape('9x9'),
  ...givens.map(([cell, value]) => new Given(cell, value)),
  ...thermos.map(cells => new Thermo(...cells)),
];
