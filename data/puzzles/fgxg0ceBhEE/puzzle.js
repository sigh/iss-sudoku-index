// Title: Daily Killer Sudoku 18291
// Author: dailykillersudoku.com
// Video: https://www.youtube.com/watch?v=fgxg0ceBhEE
// Source: https://www.dailykillersudoku.com/puzzle/18291

// Normal killer sudoku: default row/column/box AllDifferent, and every cage
// is all-different and sums to its printed total. All 24 cages carry a
// total. No givens, no other marks.

// Cages: [total, ...cells], from the publisher's cage list (24 cages tiling
// the 81 cells; totals sum to 405).
const cages = [
  [20, 'R1C3', 'R1C4', 'R2C3'],
  [3, 'R1C8', 'R1C9'],
  [31, 'R1C1', 'R1C2', 'R2C1', 'R2C2', 'R3C1'],
  [20, 'R2C4', 'R2C5', 'R3C4', 'R4C4'],
  [38, 'R1C5', 'R1C6', 'R1C7', 'R2C6', 'R2C7', 'R2C8', 'R2C9'],
  [15, 'R3C5', 'R3C6', 'R4C6'],
  [10, 'R3C3', 'R4C3'],
  [10, 'R3C7', 'R3C8', 'R4C7'],
  [20, 'R3C9', 'R4C8', 'R4C9'],
  [14, 'R4C1', 'R5C1', 'R6C1'],
  [4, 'R5C3', 'R5C4'],
  [15, 'R5C6', 'R5C7'],
  [7, 'R5C8', 'R5C9'],
  [20, 'R3C2', 'R4C2', 'R5C2', 'R6C2', 'R7C2'],
  [11, 'R6C3', 'R7C3'],
  [16, 'R4C5', 'R5C5', 'R6C5'],
  [13, 'R6C7', 'R7C7', 'R7C8'],
  [14, 'R6C8', 'R6C9', 'R7C9'],
  [23, 'R6C6', 'R7C5', 'R7C6'],
  [25, 'R7C1', 'R8C1', 'R8C2', 'R9C1', 'R9C2'],
  [21, 'R6C4', 'R7C4', 'R8C4', 'R8C5'],
  [33, 'R8C6', 'R8C7', 'R8C8', 'R8C9', 'R9C5', 'R9C6', 'R9C7'],
  [13, 'R8C3', 'R9C3', 'R9C4'],
  [9, 'R9C8', 'R9C9'],
];

return [
  new Shape('9x9'),
  ...cages.map(([total, ...cells]) => new Cage(total, ...cells)),
];
