// Title: Regional Renbans
// Author: Derek LeClair
// Video: https://www.youtube.com/watch?v=g7YE5xR5-G4
// Source: https://sudokupad.app/61g1ssiok4

// Normal sudoku. Purple lines are divided by box borders into equal-sum
// segments, and each segment is a renban.

const regionSumLines = [
  ['R1C5', 'R1C6', 'R1C7', 'R1C8', 'R1C9'],
  ['R2C1', 'R3C1', 'R4C1'],
  ['R9C5', 'R9C4', 'R9C3', 'R9C2', 'R8C2'],
  ['R8C5', 'R8C6', 'R8C7'],
  ['R6C9', 'R7C9', 'R8C9'],
  ['R7C8', 'R7C7', 'R7C6'],
  ['R5C5', 'R4C4', 'R5C3', 'R6C2', 'R5C1'],
  ['R4C8', 'R3C8', 'R3C7', 'R2C7'],
  ['R2C5', 'R2C4', 'R3C4', 'R3C3'],
  ['R5C7', 'R5C6', 'R6C6'],
];

const renbanSegments = [
  ['R1C5', 'R1C6'],
  ['R1C7', 'R1C8', 'R1C9'],
  ['R2C1', 'R3C1'],
  ['R9C5', 'R9C4'],
  ['R9C3', 'R9C2', 'R8C2'],
  ['R8C5', 'R8C6'],
  ['R7C9', 'R8C9'],
  ['R7C8', 'R7C7'],
  ['R5C5', 'R4C4'],
  ['R5C3', 'R6C2', 'R5C1'],
  ['R3C8', 'R3C7', 'R2C7'],
  ['R2C5', 'R2C4', 'R3C4'],
  ['R5C6', 'R6C6'],
];

return [
  new Shape('9x9'),
  ...regionSumLines.map(cells => new RegionSumLine(...cells)),
  ...renbanSegments.map(cells => new Renban(...cells)),
];
