// Title: Sept. 18, 2021: Dead or Alive
// Author: Philip Newman
// Video: https://www.youtube.com/watch?v=v_YvOgNiUks
// Source: https://tinyurl.com/3tf22cae

// Normal sudoku rules. 1-9 once each in every row, column and 3x3 box. Killer
// cages - digits in a cage sum to the cage's total and do not repeat.

const givens = [
];

// Cage totals and cells, transcribed from the drawn cages.
const cages = [
  [6, 'R1C1', 'R1C2', 'R2C1'],
  [15, 'R2C2', 'R2C3', 'R3C2'],
  [7, 'R8C9', 'R9C8', 'R9C9'],
  [14, 'R7C8', 'R8C7', 'R8C8'],
  [8, 'R6C9', 'R7C9'],
  [10, 'R9C6', 'R9C7'],
  [9, 'R8C5', 'R8C6', 'R9C5'],
  [24, 'R6C7', 'R7C6', 'R7C7'],
  [23, 'R3C3', 'R3C4', 'R4C3'],
  [10, 'R5C8', 'R5C9', 'R6C8'],
  [12, 'R3C5', 'R4C4', 'R4C5'],
  [12, 'R3C1', 'R4C1'],
  [9, 'R1C3', 'R1C4'],
  [7, 'R5C3', 'R5C4', 'R6C4'],
  [15, 'R6C5', 'R6C6', 'R7C5'],
  [16, 'R4C6', 'R5C6', 'R5C7'],
  [20, 'R1C5', 'R2C4', 'R2C5'],
  [13, 'R4C2', 'R5C1', 'R5C2'],
];

return [
  new Shape('9x9'),
  ...givens.map(([cell, value]) => new Given(cell, value)),
  ...cages.map(([total, ...cells]) => new Cage(total, ...cells)),
];
