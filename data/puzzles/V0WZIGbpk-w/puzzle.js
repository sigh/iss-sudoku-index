// Title: Kritzeleien
// Author: Myxo
// Video: https://www.youtube.com/watch?v=V0WZIGbpk-w
// Source: https://sudokupad.app/9jas258m1s

// Standard Sudoku rules apply. Blue lines are region sum lines: box borders
// divide a line into segments having equal sums. Pink lines are renban lines:
// their digits are distinct and form a consecutive set in any order.

const regionSumLines = [
  ['R5C2', 'R4C1', 'R3C1', 'R4C2', 'R3C2', 'R2C2'],
  ['R5C3', 'R4C3', 'R3C3', 'R4C4', 'R3C4', 'R2C4'],
  ['R5C6', 'R4C5', 'R3C5', 'R4C6', 'R3C6', 'R2C6'],
  ['R5C8', 'R4C7', 'R3C7', 'R4C8', 'R3C8', 'R2C8'],
];

const renbanLines = [
  ['R8C1', 'R7C1', 'R6C1', 'R6C2', 'R7C2', 'R8C2'],
  ['R5C4', 'R6C4', 'R6C3', 'R7C3', 'R7C4', 'R8C4'],
  ['R5C5', 'R6C5', 'R7C5', 'R6C6', 'R7C6', 'R8C6'],
  ['R5C7', 'R6C7', 'R7C7', 'R6C8', 'R7C8', 'R8C8'],
];

return [
  new Shape('9x9'),
  new Given('R7C9', 8),
  ...regionSumLines.map(cells => new RegionSumLine(...cells)),
  ...renbanLines.map(cells => new Renban(...cells)),
];
