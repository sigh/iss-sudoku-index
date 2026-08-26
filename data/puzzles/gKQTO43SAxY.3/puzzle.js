// Title: 5/25: Your Brain On Sudoku
// Author: Philip Newman
// Video: https://www.youtube.com/watch?v=gKQTO43SAxY
// Source: https://tinyurl.com/ykbdhh6e

// Normal sudoku rules. 1-9 once each in every row, column and 3x3 box. Killer
// cages - digits in a cage sum to the cage's total and do not repeat.

const givens = [
  ['R1C4', 9],
  ['R2C8', 6],
  ['R3C2', 8],
  ['R5C1', 7],
  ['R5C9', 3],
  ['R7C8', 2],
  ['R8C2', 4],
  ['R9C6', 1],
];

// Cage totals and cells, transcribed from the drawn cages.
const cages = [
  [24, 'R7C9', 'R8C8', 'R8C9'],
  [7, 'R2C3', 'R2C4', 'R3C4'],
  [8, 'R4C4', 'R5C3', 'R5C4'],
  [23, 'R7C6', 'R8C6', 'R8C7'],
  [22, 'R5C6', 'R5C7', 'R6C6'],
  [9, 'R5C2', 'R6C1', 'R6C2'],
  [21, 'R4C8', 'R4C9', 'R5C8'],
  [20, 'R2C8', 'R2C9', 'R3C9'],
  [10, 'R7C1', 'R8C1', 'R8C2'],
  [11, 'R7C3', 'R7C4', 'R8C3'],
  [19, 'R2C7', 'R3C6', 'R3C7'],
  [6, 'R2C1', 'R2C2', 'R3C1'],
  [18, 'R2C5', 'R2C6', 'R3C5'],
  [12, 'R7C5', 'R8C4', 'R8C5'],
];

return [
  new Shape('9x9'),
  ...givens.map(([cell, value]) => new Given(cell, value)),
  ...cages.map(([total, ...cells]) => new Cage(total, ...cells)),
];
