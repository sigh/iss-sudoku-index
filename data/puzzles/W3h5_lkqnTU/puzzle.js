// Title: Compression
// Author: Jay Dyer
// Video: https://www.youtube.com/watch?v=W3h5_lkqnTU
// Source: https://sudokupad.app/7xe7r6dwgb

// Normal Sudoku rules apply. Each blue line is a Region Sum Line: its portions
// within 3x3 boxes have equal sums, independently for each drawn line.
// Drawn blue Region Sum Line paths, in payload order.
const regionSumLines = [
  ['R4C1', 'R3C2', 'R2C3', 'R2C2'],
  ['R3C3', 'R4C3', 'R5C3'],
  ['R7C2', 'R8C2', 'R9C2', 'R9C3', 'R8C4', 'R7C4'],
  ['R8C3', 'R7C3', 'R6C4', 'R5C4'],
  ['R3C5', 'R2C5', 'R1C5', 'R1C6', 'R1C7', 'R2C7', 'R3C7'],
  ['R2C6', 'R3C6', 'R4C7'],
  ['R4C5', 'R5C6', 'R5C7', 'R4C8', 'R3C9', 'R2C9', 'R1C8'],
  ['R5C8', 'R6C8', 'R7C8', 'R8C8', 'R9C8', 'R9C9'],
  ['R8C9', 'R7C9', 'R6C9', 'R5C9'],
  ['R5C5', 'R6C5', 'R7C5', 'R8C6', 'R9C6', 'R9C7', 'R8C7'],
];

return [
  new Shape('9x9'),
  ...regionSumLines.map(cells => new RegionSumLine(...cells)),
];
