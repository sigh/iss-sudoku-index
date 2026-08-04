// Title: Honey Dipper
// Author: Lughny
// Video: https://www.youtube.com/watch?v=Hh62HAmFZAc
// Source: https://app.crackingthecryptic.com/sudoku/F339rtJT6q

// Normal sudoku rules apply (standard boxes, matching the payload's regions).
// Green lines: Whisper(5) - adjacent cells differ by at least 5.
// Purple lines: Renban - the cells hold a set of consecutive digits, no
// repeats, in any order.
// White dot: WhiteDot - the two cells differ by 1.
// Cages: Cage - no repeats, sum to the printed total (the rules' "digit in
// the top left corner" is the standard cage-total display convention; a
// literal single-digit reading is impossible since every total here exceeds
// 9).

// Purple (Renban) lines. The payload stores 10 separate stroke entries; some
// share one endpoint cell with another entry (e.g. R4C9 below), which reads
// as two independent lines crossing at that cell rather than one path,
// since a single Renban line cannot branch.
const renbans = [
  ['R5C2', 'R6C1'],
  ['R1C6', 'R2C5'],
  ['R1C8', 'R2C7'],
  ['R6C3', 'R7C2', 'R8C1'],
  ['R4C7', 'R5C6', 'R6C5', 'R7C4'],
  ['R8C5', 'R9C4'],
  ['R4C9', 'R5C8'],
  ['R5C9', 'R4C9', 'R3C9', 'R2C9'],
  ['R8C8', 'R9C9'],
  ['R2C3', 'R3C2', 'R4C3'],
].map(cells => new Renban(...cells));

// Green (Whisper) lines. Same per-entry treatment as the purple lines above;
// R3C4, R4C5 and R8C7 are each shared between two separate green entries.
const whispers = [
  ['R1C5', 'R1C4', 'R2C3'],
  ['R2C3', 'R3C4'],
  ['R2C5', 'R3C4', 'R4C3', 'R5C2'],
  ['R2C7', 'R3C6', 'R4C5', 'R5C4', 'R6C3'],
  ['R3C8', 'R4C7'],
  ['R4C5', 'R5C6', 'R6C7', 'R5C8'],
  ['R7C4', 'R8C3', 'R9C2'],
  ['R5C9', 'R6C9', 'R7C8', 'R8C7', 'R9C6', 'R9C5'],
  ['R8C7', 'R7C6', 'R8C5'],
].map(cells => new Whisper(5, ...cells));

// Killer cages, each with an explicit total.
const cages = [
  new Cage(25, 'R4C3', 'R5C2', 'R5C3', 'R5C4', 'R6C3'),
  new Cage(16, 'R4C7', 'R5C7', 'R5C8', 'R5C9', 'R6C7'),
  new Cage(18, 'R2C5', 'R3C4', 'R3C5', 'R3C6'),
  new Cage(18, 'R7C4', 'R7C5', 'R7C6', 'R8C5'),
];

return [
  new Shape('9x9'),
  new Given('R9C1', 4),
  // White dot: drawn as a small edge mark between R3C1 and R3C2 (white
  // fill, black border, no printed digit).
  new WhiteDot('R3C1', 'R3C2'),
  ...cages,
  ...renbans,
  ...whispers,
];
