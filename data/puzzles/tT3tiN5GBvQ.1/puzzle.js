// Title: Nov. 29, 2021: Paying Respect
// Author: Philip Newman
// Video: https://www.youtube.com/watch?v=tT3tiN5GBvQ
// Source: https://tinyurl.com/y9x45ycd

// Normal sudoku rules. 1-9 once each in every row, column and 3x3 box. Killer
// cages - digits in a cage sum to the cage's total and do not repeat.

const givens = [
  ['R2C4', 9],
  ['R3C5', 7],
  ['R4C6', 2],
  ['R5C3', 4],
  ['R5C7', 6],
  ['R6C4', 8],
  ['R7C5', 3],
  ['R8C6', 1],
];

// Cage totals and cells, transcribed from the drawn cages.
const cages = [
  [3, 'R1C3', 'R1C4'],
  [7, 'R1C6', 'R1C7'],
  [4, 'R3C9', 'R4C9'],
  [6, 'R6C9', 'R7C9'],
  [17, 'R9C6', 'R9C7'],
  [13, 'R9C3', 'R9C4'],
  [16, 'R6C1', 'R7C1'],
  [14, 'R3C1', 'R4C1'],
  [8, 'R1C5', 'R2C5'],
  [12, 'R8C5', 'R9C5'],
  [9, 'R5C8', 'R5C9'],
  [11, 'R5C1', 'R5C2'],
  [5, 'R7C7', 'R7C8'],
  [15, 'R3C2', 'R3C3'],
  [10, 'R7C3', 'R8C3'],
  [10, 'R2C7', 'R3C7'],
];

return [
  new Shape('9x9'),
  ...givens.map(([cell, value]) => new Given(cell, value)),
  ...cages.map(([total, ...cells]) => new Cage(total, ...cells)),
];
