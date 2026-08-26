// Title: October 24, 2021: Slasher
// Author: Philip Newman
// Video: https://www.youtube.com/watch?v=bHhinEJrUxg
// Source: https://tinyurl.com/w5svuvv2

// Normal sudoku rules. 1-9 once each in every row, column and 3x3 box. Killer
// cages - digits in a cage sum to the cage's total and do not repeat.

const givens = [
  ['R1C1', 1],
  ['R2C2', 2],
  ['R3C3', 3],
  ['R4C4', 4],
  ['R5C5', 5],
  ['R6C6', 6],
  ['R7C7', 7],
  ['R8C8', 8],
  ['R9C9', 9],
];

// Cage totals and cells, transcribed from the drawn cages.
const cages = [
  [9, 'R1C2', 'R1C3'],
  [5, 'R1C4', 'R1C5'],
  [13, 'R1C6', 'R1C7'],
  [11, 'R9C7', 'R9C8'],
  [15, 'R9C5', 'R9C6'],
  [7, 'R9C3', 'R9C4'],
  [10, 'R8C2', 'R9C2'],
  [10, 'R1C8', 'R2C8'],
  [13, 'R7C2', 'R7C3'],
  [7, 'R3C7', 'R3C8'],
  [14, 'R6C4', 'R7C4'],
  [6, 'R3C6', 'R4C6'],
  [8, 'R5C3', 'R5C4'],
  [12, 'R5C6', 'R5C7'],
  [12, 'R4C2', 'R4C3'],
  [4, 'R6C7', 'R6C8'],
  [10, 'R5C9', 'R6C9'],
  [10, 'R4C1', 'R5C1'],
];

return [
  new Shape('9x9'),
  ...givens.map(([cell, value]) => new Given(cell, value)),
  ...cages.map(([total, ...cells]) => new Cage(total, ...cells)),
];
