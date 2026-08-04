// Title: Whispering Angels
// Author: Tanadien Whiteowl
// Video: https://www.youtube.com/watch?v=873YfJFeE3k
// Source: https://app.crackingthecryptic.com/sudoku/p7HHFthmjN

// Normal sudoku rules apply. Neighbouring cells on a green line must differ
// by at least 5 (Whisper's default difference). A purple line must contain a
// set of consecutive nonrepeating digits, in any order (Renban).

const GIVENS = [
  ['R1C5', 2],
  ['R2C2', 3],
  ['R6C8', 1],
  ['R7C5', 6],
  ['R7C8', 5],
  ['R8C1', 4],
];

// Green whisper lines, one continuous stroke each (payload lines[], colour
// #A3E048), one near each corner.
const WHISPER_LINES = [
  ['R1C9', 'R1C8', 'R1C7', 'R2C7', 'R3C8', 'R3C9'],
  ['R3C1', 'R2C1', 'R1C2', 'R2C3', 'R3C3'],
  ['R7C1', 'R7C2', 'R7C3', 'R8C3', 'R9C3', 'R9C2', 'R9C1'],
  ['R7C7', 'R8C7', 'R9C7', 'R9C8', 'R8C9', 'R7C9'],
];

// Purple renban lines, one continuous stroke each (payload lines[], colour
// #D23BE7), crossing the centre band.
const RENBAN_LINES = [
  ['R4C1', 'R4C2', 'R4C3', 'R5C3', 'R5C4'],
  ['R4C5', 'R5C5', 'R6C5'],
  ['R5C6', 'R5C7', 'R4C7', 'R4C8', 'R4C9'],
];

const givens = GIVENS.map(([cell, value]) => new Given(cell, value));
const whispers = WHISPER_LINES.map(cells => new Whisper(...cells));
const renbans = RENBAN_LINES.map(cells => new Renban(...cells));

return [
  new Shape('9x9'),
  ...givens,
  ...whispers,
  ...renbans,
];
