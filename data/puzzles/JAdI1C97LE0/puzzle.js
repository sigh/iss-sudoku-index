// Title: Rolling Wave
// Author: Lizzy01
// Video: https://www.youtube.com/watch?v=JAdI1C97LE0
// Source: https://sudokupad.app/fb3Hh9r7r4

// Normal Sudoku rules apply. Each blue line has equal digit sums in the
// segments created by 3x3 box borders; every grey, circular-bulbed line is a
// thermometer increasing from its bulb. The listed cells are transcribed from
// the corresponding drawn blue strokes and grey lines.
const blueLines = [
  ['R7C5', 'R7C6', 'R8C6', 'R8C5', 'R8C4', 'R8C3', 'R7C2'],
  ['R4C2', 'R4C1', 'R5C1', 'R6C1', 'R7C1', 'R8C2'],
  ['R3C3', 'R4C3', 'R5C3'],
  ['R2C4', 'R3C4', 'R3C5', 'R3C6', 'R2C6', 'R1C6', 'R1C5', 'R1C4', 'R1C3', 'R1C2', 'R1C1', 'R2C1', 'R2C2', 'R3C2'],
  ['R8C7', 'R8C8', 'R7C8', 'R6C8'],
  ['R5C8', 'R5C7', 'R5C6', 'R5C5', 'R4C5', 'R4C6'],
  ['R7C9', 'R6C9', 'R5C9'],
  ['R4C8', 'R4C9', 'R3C9', 'R2C8', 'R1C8'],
];

const thermometers = [
  ['R1C9', 'R1C8', 'R1C7', 'R2C7'],
  ['R6C4', 'R6C5'],
  ['R9C7', 'R8C6'],
];

return [
  new Shape('9x9'),
  ...blueLines.map(cells => new RegionSumLine(...cells)),
  ...thermometers.map(cells => new Thermo(...cells)),
];
