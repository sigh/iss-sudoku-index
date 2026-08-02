// Title: Re-framed
// Author: Nordy & Riffclown
// Video: https://www.youtube.com/watch?v=tyw9YGGvTP4
// Source: https://sudokupad.app/9JLLbT9Jj7

// Standard Sudoku. The cell-aligned blue path is a region-sum line, rotated at
// a box boundary so each visit to a 3x3 box is one segment. Three off-centre
// blue frames are omitted because their cell paths are not recoverable. Grey
// paths are sum-10 lines and green paths are German whispers.
// The listed cell paths come from the coloured drawn lines.
const blueFrame = ['R4C5', 'R5C5', 'R5C4', 'R5C3', 'R5C2', 'R4C2', 'R3C2', 'R2C2', 'R2C3', 'R2C4', 'R2C5', 'R3C5'];
const greyTenLines = [
  ['R5C8', 'R5C7', 'R5C6', 'R5C5', 'R5C4', 'R5C3', 'R5C2'],
  ['R8C2', 'R7C2', 'R6C2', 'R5C2', 'R4C2', 'R3C2', 'R2C2'],
  ['R7C8', 'R6C8', 'R5C8', 'R4C8'],
];
const greenWhispers = [
  ['R7C5', 'R6C5', 'R5C5', 'R4C5'],
  ['R2C2', 'R2C3', 'R2C4', 'R2C5', 'R2C6', 'R2C7', 'R2C8'],
];

return [
  new Shape('9x9'),
  new RegionSumLine(...blueFrame),
  ...greyTenLines.map(cells => new SumLine(10, ...cells)),
  ...greenWhispers.map(cells => new Whisper(5, ...cells)),
];
