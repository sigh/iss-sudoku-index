// Title: 9/7/2023: Whisper Sweet 129s
// Author: Philip Newman
// Video: https://www.youtube.com/watch?v=iOpRqAgRzb0
// Source: https://tinyurl.com/2fm5jw4p

// Normal Sudoku with the nine diagonal givens and both drawn German Whispers
// lines (adjacent line digits differ by at least 5).
const givens = [
  ['R1C1', 1], ['R2C2', 2], ['R3C3', 3],
  ['R4C4', 4], ['R5C5', 5], ['R6C6', 6],
  ['R7C7', 7], ['R8C8', 8], ['R9C9', 9],
];

const whisperLines = [
  ['R4C6', 'R5C6', 'R5C7', 'R6C7', 'R6C8', 'R7C8', 'R7C7',
    'R7C6', 'R6C6', 'R6C5', 'R7C5', 'R7C4', 'R7C3', 'R6C3'],
  ['R6C4', 'R5C4', 'R5C3', 'R4C3', 'R4C2', 'R3C2', 'R3C3',
    'R3C4', 'R4C4', 'R4C5', 'R3C5', 'R3C6', 'R3C7', 'R4C7'],
];

return [
  new Shape('9x9'),
  ...givens.map(([cell, value]) => new Given(cell, value)),
  ...whisperLines.map((cells) => new Whisper(5, ...cells)),
];
