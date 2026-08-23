// Title: Boxed In
// Author: Cane Puzzles & Andrewsarchus
// Video: https://www.youtube.com/watch?v=z-qjVBf8Q6Y
// Source: https://app.crackingthecryptic.com/sudoku/H48M7RbPdG

// Normal sudoku rules apply (standard 3x3 box regions).
// Neighbouring digits on an orange line have a difference of at least 5:
// Whisper(5, ...) per orange segment.
// Digits on a blue line form a set of consecutive, non-repeating digits in
// any order: Renban(...) per blue line.
// A ninth orange-coloured payload entry has no waypoints and renders
// nothing; it is not a drawn clue and is omitted.

const whispers = [
  ['R2C2', 'R1C2'],
  ['R2C5', 'R2C6'],
  ['R2C8', 'R2C9'],
  ['R4C7', 'R5C7'],
  ['R6C7', 'R7C7'],
  ['R7C4', 'R8C4'],
  ['R8C1', 'R9C1'],
  ['R5C1', 'R5C2'],
].map((cells) => new Whisper(5, ...cells));

const renbans = [
  ['R1C3', 'R2C3', 'R3C3', 'R3C2'],
  ['R4C1', 'R4C2', 'R4C3', 'R5C3'],
  ['R2C4', 'R3C4', 'R3C5', 'R3C6'],
  ['R3C7', 'R3C8', 'R3C9', 'R4C9'],
  ['R4C5', 'R4C4', 'R5C4', 'R6C4'],
  ['R7C3', 'R8C3', 'R9C3', 'R9C4'],
  ['R8C7', 'R8C8', 'R7C8'],
  ['R8C9', 'R9C9', 'R9C8'],
  ['R9C6', 'R9C7'],
].map((cells) => new Renban(...cells));

return [
  new Shape('9x9'),
  new Given('R6C8', 1),
  ...whispers,
  ...renbans,
];
