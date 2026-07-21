// Title: Ridden hopes?
// Author: Chloe
// Video: https://www.youtube.com/watch?v=QpD13CSRpJA
// Source: https://sudokupad.app/7v9g7ly94m

// Both main diagonals contain no repeated digit. Outlined cages sum to 13,
// green-line neighbours differ by at least 5, and the black-dot pair is 2:1.
const whisperLines = [
  ['R3C1', 'R2C1', 'R1C1', 'R1C2', 'R1C3', 'R2C2'],
  ['R2C8', 'R1C7', 'R2C7', 'R3C7', 'R3C8', 'R3C9'],
  ['R8C2', 'R9C3', 'R8C3', 'R7C3', 'R7C2', 'R7C1'],
  ['R7C9', 'R8C9', 'R9C9', 'R9C8', 'R9C7', 'R8C8'],
  ['R2C5', 'R3C4', 'R3C5', 'R3C6', 'R2C6', 'R1C6'],
  ['R8C5', 'R7C4', 'R8C4', 'R9C4', 'R9C5', 'R9C6'],
].map(cells => new Whisper(5, ...cells));

return [
  new Shape('9x9'),
  new Diagonal(1),
  new Diagonal(-1),
  new Cage(13, 'R6C8', 'R7C8'),
  new Cage(13, 'R3C2', 'R4C2'),
  new Cage(13, 'R5C5', 'R6C5'),
  ...whisperLines,
  new BlackDot('R8C2', 'R8C3'),
];
