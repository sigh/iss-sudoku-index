// Title: Inchworms
// Author: dumediat
// Video: https://www.youtube.com/watch?v=AiuDikp_bLQ
// Source: https://sudokupad.app/82dowa2bt5

// Standard 9x9 Sudoku rules are supplied by Shape.
const renbanLines = [
  ['R5C4', 'R5C5', 'R5C6'],
  ['R9C2', 'R8C2', 'R7C2'],
  ['R7C1', 'R8C1', 'R9C1'],
  ['R3C8', 'R2C8', 'R1C8'],
  ['R9C8', 'R8C8', 'R7C8', 'R6C8'],
  ['R6C9', 'R7C9', 'R8C9'],
  ['R7C7', 'R8C7', 'R9C7'],
  ['R6C3', 'R7C4', 'R7C5'],
].map(cells => new Renban(...cells));

const whisperLines = [
  ['R4C2', 'R3C2', 'R2C2', 'R1C2'],
  ['R5C1', 'R5C2', 'R6C2', 'R5C3'],
  ['R5C7', 'R4C8', 'R5C8', 'R5C9'],
  ['R1C9', 'R2C9', 'R3C9'],
  ['R7C3', 'R8C4', 'R8C3'],
  ['R1C7', 'R2C6', 'R2C7'],
].map(cells => new Whisper(5, ...cells));

const parityCells = [
  new Given('R7C3', 1, 3, 5, 7, 9),
  new Given('R8C3', 1, 3, 5, 7, 9),
  new Given('R1C6', 2, 4, 6, 8),
  new Given('R1C7', 2, 4, 6, 8),
];

const xPairs = [
  ['R9C6', 'R9C7'],
  ['R9C3', 'R9C4'],
  ['R4C9', 'R5C9'],
  ['R2C6', 'R3C6'],
  ['R1C3', 'R2C3'],
  ['R2C4', 'R3C4'],
].map(cells => new X(...cells));

return [
  new Shape('9x9'),
  ...renbanLines,
  ...whisperLines,
  ...parityCells,
  new BlackDot('R3C1', 'R4C1'),
  ...xPairs,
];
