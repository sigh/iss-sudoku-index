// Title: Addition by Subtraction
// Author: Cane_Puzzles
// Video: https://www.youtube.com/watch?v=SEdHTfSPD3Q
// Source: https://sudokupad.app/wixrf6c2bx

// Gray lines are thermometers, listed from bulb to tip.
const thermometers = [
  ['R5C7', 'R4C6', 'R3C5'],
  ['R5C3', 'R6C4', 'R7C5'],
  ['R9C7', 'R8C7', 'R7C8', 'R7C9'],
  ['R1C3', 'R2C3', 'R3C2', 'R3C1'],
  ['R1C7', 'R2C7', 'R2C8', 'R3C8', 'R3C9'],
  ['R9C3', 'R8C3', 'R8C2', 'R7C2', 'R7C1'],
  ['R9C6', 'R9C5', 'R9C4', 'R8C4'],
  ['R2C4', 'R1C4', 'R1C5'],
].map(cells => new Thermo(...cells));

// The two purple strokes form one connected five-cell Renban set.
const purpleCross = new Renban('R4C5', 'R5C4', 'R5C5', 'R5C6', 'R6C5');

// Adjacent digits on green lines differ by at least 5.
const greenLines = [
  new Whisper(5, 'R4C1', 'R4C2'),
  new Whisper(5, 'R6C7', 'R6C8'),
];

return [
  new Shape('9x9'),
  ...thermometers,
  purpleCross,
  ...greenLines,
];
