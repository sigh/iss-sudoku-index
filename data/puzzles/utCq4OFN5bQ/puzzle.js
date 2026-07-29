// Title: Hippo Birdie
// Author: Blobz
// Video: https://www.youtube.com/watch?v=utCq4OFN5bQ
// Source: https://sudokupad.app/blobz/hippo-birdie

// Standard 0-8 Sudoku. Adjacent digits on each green line differ by at least 5.
const greenLines = [
  ['R3C5', 'R2C4', 'R2C3', 'R3C2', 'R4C2', 'R5C2', 'R6C2', 'R7C2',
    'R8C3', 'R8C4', 'R7C5', 'R6C5', 'R5C5', 'R4C4', 'R4C3', 'R5C2'],
  ['R1C7', 'R1C8'],
  ['R9C3', 'R9C4'],
  // This drawn green line is closed, so its first cell is repeated to bind its final edge.
  ['R5C6', 'R6C6', 'R7C6', 'R8C7', 'R8C8', 'R7C9', 'R6C9', 'R5C9',
    'R4C9', 'R3C9', 'R2C8', 'R2C7', 'R3C6', 'R4C6', 'R5C6'],
];

// The drawn balloon cells form one group: each digit equals its number of balloons.
const balloons = [
  'R1C5', 'R1C7', 'R1C9', 'R3C2', 'R3C8', 'R4C5', 'R4C9',
  'R6C1', 'R6C4', 'R6C7', 'R7C3', 'R8C8', 'R9C2', 'R9C5',
];

return [
  new Shape('9x9', '0-8'),
  new Given('R6C5', 6),
  new Given('R6C6', 0),
  ...greenLines.map(cells => new Whisper(5, ...cells)),
  new CountingCircles(...balloons),
];
