// Title: Sept. 5, '23: Renban Whispers
// Author: clover!
// Video: https://www.youtube.com/watch?v=iOpRqAgRzb0
// Source: http://tinyurl.com/5ck84h8d

// Standard Sudoku with the given digits. Pink lines are Renban lines; green
// lines are German Whispers, whose adjacent digits differ by at least 5.
const givens = [
  ['R1C3', 9], ['R2C4', 1], ['R3C1', 3], ['R3C5', 5], ['R4C2', 6],
  ['R4C6', 7], ['R5C3', 8], ['R5C7', 3], ['R6C4', 3], ['R7C5', 1],
  ['R7C7', 9],
];

// Paths transcribed from the seven bold pink lines.
const renbans = [
  ['R1C2', 'R1C3', 'R1C4'], ['R3C2', 'R4C2', 'R5C2'],
  ['R3C4', 'R3C5', 'R3C6'], ['R5C4', 'R6C4', 'R7C4'],
  ['R5C6', 'R5C7', 'R5C8'], ['R6C1', 'R7C2', 'R7C3'],
  ['R8C7', 'R7C8'],
];

// Paths transcribed from the seven thin green lines.
const whispers = [
  ['R2C3', 'R2C4', 'R2C5'], ['R4C3', 'R5C3', 'R6C3'],
  ['R2C1', 'R3C1', 'R4C1'], ['R4C5', 'R4C6', 'R4C7'],
  ['R6C5', 'R7C5', 'R8C5'], ['R1C6', 'R2C7', 'R3C7'],
  ['R9C7', 'R8C8', 'R7C9'],
];

return [
  new Shape('9x9'),
  ...givens.map(([cell, value]) => new Given(cell, value)),
  ...renbans.map((cells) => new Renban(...cells)),
  ...whispers.map((cells) => new Whisper(5, ...cells)),
];
