// Title: January 20, 2022: Ernst
// Author: Philip Newman
// Video: https://www.youtube.com/watch?v=g0fQoSHld5Y
// Source: https://tinyurl.com/23cscfwa

// Normal sudoku rules (default rows/cols/boxes). Along green lines, digits
// must differ by at least 5 -- two separate German-whisper lines that meet at
// a shared endpoint at each end (R1C4, R8C6), encoded as two independent
// Whisper(5) constraints rather than one merged path, since the payload's
// `whispers`/`line` arrays list them as two distinct strokes.

// Given digits, transcribed from the payload's grid array.
const givens = [
  ['R1C1', 1],
  ['R1C2', 2],
  ['R2C5', 7],
  ['R3C7', 2],
  ['R4C3', 1],
  ['R4C7', 3],
  ['R6C3', 4],
  ['R6C7', 6],
  ['R7C3', 5],
  ['R8C5', 8],
  ['R9C8', 5],
  ['R9C9', 6],
];

// Green whisper line cell orders, transcribed from the payload's `lines`/`whispers` arrays.
const whisperA = [
  'R1C4', 'R1C5', 'R1C6', 'R1C7', 'R2C7', 'R2C8', 'R3C8', 'R4C8',
  'R4C9', 'R5C9', 'R6C9', 'R7C9', 'R7C8', 'R7C7', 'R8C7', 'R8C6',
];
const whisperB = [
  'R8C6', 'R9C6', 'R9C5', 'R9C4', 'R9C3', 'R8C3', 'R8C2', 'R7C2',
  'R6C2', 'R6C1', 'R5C1', 'R4C1', 'R3C1', 'R3C2', 'R3C3', 'R2C3',
  'R2C4', 'R1C4',
];

return [
  new Shape('9x9'),
  ...givens.map(([cell, value]) => new Given(cell, value)),
  new Whisper(5, ...whisperA),
  new Whisper(5, ...whisperB),
];
