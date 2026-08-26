// Title: Unlucky
// Author: Lisztes
// Video: https://www.youtube.com/watch?v=Rt-cu8vYN9c
// Source: https://cracking-the-cryptic.web.app/sudoku/BR6MLPg472

// Normal sudoku rules. 1-9 once each in every row, column and 3x3 box. Killer
// cages - digits in a cage sum to the cage's total and do not repeat.

const givens = [
  ['R1C1', 1],
  ['R1C3', 3],
];

// Cage totals and cells, transcribed from the drawn cages.
const cages = [
  [13, 'R1C2', 'R2C2', 'R3C2'],
  [13, 'R2C3', 'R3C3'],
  [13, 'R3C1', 'R4C1'],
  [13, 'R4C3', 'R5C3'],
  [13, 'R5C2', 'R6C2', 'R6C1'],
  [13, 'R6C3', 'R7C3'],
  [13, 'R8C2', 'R8C1'],
  [13, 'R9C1', 'R9C2'],
  [13, 'R7C4', 'R8C4', 'R8C5', 'R7C5'],
  [13, 'R9C4', 'R9C5'],
  [13, 'R7C6', 'R7C7'],
  [13, 'R8C6', 'R8C7'],
  [13, 'R8C8', 'R9C8', 'R9C7'],
  [13, 'R7C8', 'R7C9'],
  [13, 'R6C8', 'R5C8', 'R5C9'],
  [13, 'R6C5', 'R6C6'],
  [13, 'R6C4', 'R5C4', 'R4C4', 'R4C5'],
  [13, 'R3C4', 'R3C5'],
  [13, 'R1C4', 'R1C5'],
  [13, 'R1C6', 'R1C7'],
  [13, 'R2C7', 'R2C8', 'R3C8'],
  [13, 'R2C9', 'R3C9'],
  [13, 'R4C7', 'R4C6', 'R3C6'],
  [13, 'R5C6', 'R5C7'],
];

return [
  new Shape('9x9'),
  ...givens.map(([cell, value]) => new Given(cell, value)),
  ...cages.map(([total, ...cells]) => new Cage(total, ...cells)),
];
