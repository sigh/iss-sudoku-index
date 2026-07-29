// Title: Zag
// Author: zetamath
// Video: https://www.youtube.com/watch?v=EcoOi5Up-jo
// Source: https://sudokupad.app/LJqq7g8d8d

// Normal Sudoku rules apply. The orange line partitions into contiguous groups
// that each sum to 10. Each grey arrow's arm sums to its circled first cell.
// The listed cells transcribe the drawn orange line and arrows in path order.
const tenLine = [
  'R3C1', 'R2C1', 'R1C1', 'R1C2', 'R1C3', 'R1C4', 'R2C4', 'R3C4',
  'R4C4', 'R4C5', 'R3C5', 'R3C6', 'R3C7', 'R3C8', 'R4C8', 'R4C7',
  'R4C6', 'R5C6', 'R5C7', 'R6C7', 'R7C7', 'R8C7', 'R8C6', 'R9C6',
  'R9C5', 'R9C4', 'R8C4', 'R7C3', 'R8C2', 'R7C2', 'R6C2', 'R5C2',
];

const arrows = [
  ['R3C3', 'R2C3', 'R2C2', 'R3C2'],
  ['R2C6', 'R1C6', 'R1C5', 'R2C5'],
  ['R6C3', 'R5C4', 'R4C3'],
  ['R1C8', 'R1C9', 'R2C9'],
  ['R4C2', 'R4C1', 'R5C1'],
];

return [
  new Shape('9x9'),
  new SumLine(10, ...tenLine),
  ...arrows.map(cells => new Arrow(...cells)),
];
