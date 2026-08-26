// Title: Happy Birthday  (Keystone)
// Author: Wyrm & Rangsk
// Video: https://www.youtube.com/watch?v=g0IlYmsN1es
// Source: https://tinyurl.com/3u9fm4zt

// Normal sudoku rules. 1-9 once each in every row, column and 3x3 box. Killer
// cages - digits in a cage sum to the cage's total and do not repeat.

const givens = [
];

// Cage totals and cells, transcribed from the drawn cages.
const cages = [
  [30, 'R7C4', 'R8C4', 'R9C3', 'R9C4'],
  [13, 'R6C1', 'R7C1', 'R8C1'],
  [8, 'R6C6', 'R7C6'],
  [14, 'R7C5', 'R8C5', 'R8C6', 'R9C6'],
  [22, 'R5C3', 'R6C2', 'R6C3', 'R7C2', 'R7C3'],
  [10, 'R4C5', 'R4C6'],
  [16, 'R6C7', 'R7C7', 'R8C7', 'R9C7'],
  [13, 'R7C9', 'R8C9', 'R9C9'],
  [20, 'R5C9', 'R6C8', 'R6C9'],
  [13, 'R3C7', 'R3C8', 'R4C7'],
  [41, 'R3C1', 'R3C2', 'R3C3', 'R4C1', 'R4C2', 'R5C1', 'R5C2'],
  [29, 'R2C7', 'R2C8', 'R2C9', 'R3C9'],
  [12, 'R1C3', 'R1C4'],
  [39, 'R2C1', 'R2C2', 'R2C3', 'R2C4', 'R3C4', 'R3C5', 'R3C6'],
];

return [
  new Shape('9x9'),
  ...givens.map(([cell, value]) => new Given(cell, value)),
  ...cages.map(([total, ...cells]) => new Cage(total, ...cells)),
];
