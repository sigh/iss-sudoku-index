// Title: Greenbelt
// Author: Titus
// Video: https://www.youtube.com/watch?v=sGeS7Io-EUc
// Source: https://sudokupad.app/jeyw4ftg8q

// Normal Sudoku, German whispers on every drawn green edge, and the circle-counting rule.
const greenLines = [
  ['R9C5', 'R8C6', 'R7C7', 'R6C8', 'R5C9'],
  ['R6C2', 'R6C1', 'R7C2', 'R8C3', 'R8C4', 'R9C5'],
  ['R2C2', 'R1C2', 'R2C3', 'R2C4', 'R3C5', 'R4C6', 'R4C7', 'R3C8', 'R4C8', 'R5C9'],
  ['R3C2', 'R4C2', 'R5C2'],
  ['R5C3', 'R5C2', 'R5C1'],
  ['R5C4', 'R5C5', 'R5C6'],
  ['R7C5', 'R6C5', 'R5C5'],
  ['R8C5', 'R7C5'],
  ['R2C7', 'R2C8', 'R2C9'],
  ['R7C9', 'R8C9'],
  ['R8C8', 'R8C7', 'R9C6'],
  ['R4C1', 'R5C1'],
];

// The drawn circles in the source.
const circles = [
  'R1C2', 'R2C4', 'R3C5', 'R3C8', 'R5C9', 'R6C8',
  'R7C7', 'R8C6', 'R9C5', 'R8C3', 'R7C2', 'R6C1',
  'R2C3', 'R4C8', 'R8C4', 'R6C2', 'R4C7', 'R2C2',
  'R8C2', 'R6C3', 'R2C1', 'R7C4', 'R1C9', 'R4C6',
];

const whisperEdges = greenLines.map(line => new Whisper(5, ...line));

return [
  new Shape('9x9'),
  ...whisperEdges,
  new CountingCircles(...circles),
];
