// Title: March 6, 2022: Free Bird
// Author: Philip Newman
// Video: https://www.youtube.com/watch?v=VrmINT5PAyk
// Source: https://tinyurl.com/2p9ctjwy

// Normal sudoku rules. 1-9 once each in every row, column and 3x3 box. Killer
// cages - digits in a cage sum to the cage's total and do not repeat.

const givens = [
];

// Cage totals and cells, transcribed from the drawn cages.
const cages = [
  [7, 'R1C2', 'R2C2'],
  [6, 'R2C1', 'R3C1'],
  [9, 'R2C3', 'R3C3'],
  [13, 'R8C1', 'R8C2'],
  [11, 'R7C2', 'R7C3'],
  [14, 'R9C2', 'R9C3'],
  [6, 'R7C9', 'R8C9'],
  [7, 'R8C8', 'R9C8'],
  [9, 'R7C7', 'R8C7'],
  [13, 'R2C8', 'R2C9'],
  [11, 'R3C7', 'R3C8'],
  [14, 'R1C7', 'R1C8'],
  [5, 'R5C3', 'R5C4'],
  [5, 'R3C5', 'R4C5'],
  [15, 'R5C6', 'R5C7'],
  [15, 'R6C5', 'R7C5'],
  [10, 'R4C3', 'R4C4'],
  [10, 'R6C6', 'R6C7'],
  [7, 'R3C6', 'R4C6'],
  [13, 'R6C4', 'R7C4'],
];

return [
  new Shape('9x9'),
  ...givens.map(([cell, value]) => new Given(cell, value)),
  ...cages.map(([total, ...cells]) => new Cage(total, ...cells)),
];
