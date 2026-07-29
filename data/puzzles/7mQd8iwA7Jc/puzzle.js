// Title: Sir Bri Sudoku
// Author: olima
// Video: https://www.youtube.com/watch?v=7mQd8iwA7Jc
// Source: https://app.crackingthecryptic.com/cgqcfwnwmi

// Normal Sudoku rules apply. Green lines are German whispers with difference 5.
// Purple lines are renban lines. The listed black dots mark 1:2 ratios; absent
// dots impose no negative Kropki rule. Line coordinates transcribe the drawn clues.
const renbans = [
  ['R6C1', 'R5C1', 'R4C1', 'R4C2', 'R5C3', 'R5C2', 'R6C3', 'R6C2'],
  ['R5C5', 'R6C5'],
  ['R2C3', 'R3C3'],
  ['R9C4', 'R8C4', 'R7C5', 'R8C6', 'R9C6'],
  ['R6C8', 'R5C8', 'R4C8', 'R5C9', 'R6C9'],
];

const whispers = [
  ['R1C2', 'R1C1', 'R2C1', 'R2C2', 'R3C2', 'R3C1'],
  ['R6C4', 'R5C4', 'R4C5'],
  ['R5C6', 'R5C7'],
  ['R9C1', 'R8C1', 'R7C1', 'R8C2', 'R7C3', 'R8C3', 'R9C3'],
  ['R7C6', 'R8C7', 'R9C7'],
  ['R7C8', 'R8C7'],
  ['R9C6', 'R9C7'],
  ['R8C5', 'R7C6'],
  ['R6C6', 'R5C6', 'R4C6', 'R4C7', 'R5C7', 'R6C7'],
  ['R3C4', 'R2C4', 'R1C4', 'R1C5', 'R2C5'],
  ['R3C6', 'R2C5'],
  ['R2C4', 'R2C5'],
  ['R8C4', 'R9C5', 'R8C6'],
  ['R4C7', 'R3C6'],
];

// The three black-dot pairs are the drawn 1:2 ratio clues.
const blackDots = [
  ['R4C5', 'R5C5'],
  ['R1C3', 'R2C3'],
  ['R7C7', 'R8C7'],
];

return [
  new Shape('9x9'),
  ...renbans.map((cells) => new Renban(...cells)),
  ...whispers.map((cells) => new Whisper(5, ...cells)),
  ...blackDots.map((cells) => new BlackDot(...cells)),
];
