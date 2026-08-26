// Title: 3/30/22: Chamber of Secrets
// Author: Philip Newman
// Video: https://www.youtube.com/watch?v=Lh_j9DLhIY4
// Source: https://tinyurl.com/2p93mftm

// Normal sudoku rules. 1-9 once each in every row, column and 3x3 box. Killer
// cages - digits in a cage sum to the cage's total and do not repeat.

const givens = [
];

// Cage totals and cells, transcribed from the drawn cages.
const cages = [
  [23, 'R2C3', 'R3C2', 'R3C3'],
  [7, 'R7C7', 'R7C8', 'R8C7'],
  [8, 'R7C2', 'R7C3', 'R8C3'],
  [22, 'R2C7', 'R3C7', 'R3C8'],
  [3, 'R4C4', 'R5C4'],
  [17, 'R5C6', 'R6C6'],
  [7, 'R4C5', 'R4C6'],
  [13, 'R6C4', 'R6C5'],
  [4, 'R5C1', 'R6C1'],
  [10, 'R6C2', 'R6C3'],
  [10, 'R4C7', 'R4C8'],
  [16, 'R4C9', 'R5C9'],
  [13, 'R4C3', 'R5C3'],
  [7, 'R5C7', 'R6C7'],
  [6, 'R6C8', 'R6C9'],
  [14, 'R4C1', 'R4C2'],
  [7, 'R9C5', 'R9C6'],
  [13, 'R1C4', 'R1C5'],
  [7, 'R8C4', 'R9C4'],
  [13, 'R1C6', 'R2C6'],
  [13, 'R2C4', 'R3C4'],
  [7, 'R7C6', 'R8C6'],
  [16, 'R7C4', 'R7C5'],
  [4, 'R3C5', 'R3C6'],
  [5, 'R1C2', 'R1C3'],
  [16, 'R1C1', 'R2C1', 'R3C1'],
  [15, 'R9C7', 'R9C8'],
  [14, 'R7C9', 'R8C9', 'R9C9'],
  [14, 'R1C7', 'R1C8', 'R1C9'],
  [6, 'R2C9', 'R3C9'],
  [16, 'R9C1', 'R9C2', 'R9C3'],
  [14, 'R7C1', 'R8C1'],
];

return [
  new Shape('9x9'),
  ...givens.map(([cell, value]) => new Given(cell, value)),
  ...cages.map(([total, ...cells]) => new Cage(total, ...cells)),
];
