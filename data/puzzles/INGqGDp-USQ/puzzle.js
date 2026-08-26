// Title: A Puzzle That Keeps You Young!
// Author: 
// Video: https://www.youtube.com/watch?v=INGqGDp-USQ
// Source: https://cracking-the-cryptic.web.app/sudoku/M4p6f43H2q

// Normal sudoku rules. 1-9 once each in every row, column and 3x3 box. Killer
// cages - digits in a cage sum to the cage's total and do not repeat.

const givens = [
];

// Cage totals and cells, transcribed from the drawn cages.
const cages = [
  [30, 'R1C6', 'R1C7', 'R1C8', 'R1C9'],
  [9, 'R2C6', 'R2C7', 'R2C8'],
  [11, 'R3C8', 'R3C9'],
  [12, 'R3C7', 'R4C7'],
  [10, 'R4C8', 'R4C9'],
  [11, 'R3C6', 'R3C5'],
  [11, 'R3C4', 'R3C3', 'R4C3', 'R4C4'],
  [11, 'R2C1', 'R3C1'],
  [15, 'R6C1', 'R7C1'],
  [12, 'R8C1', 'R9C1'],
  [18, 'R8C3', 'R7C3', 'R7C4'],
  [17, 'R9C3', 'R9C4', 'R8C4'],
  [5, 'R7C5', 'R8C5'],
  [15, 'R6C6', 'R7C6'],
  [13, 'R8C6', 'R9C6'],
  [19, 'R6C7', 'R6C8', 'R6C9'],
  [18, 'R8C7', 'R7C7', 'R9C7'],
  [10, 'R7C8', 'R7C9'],
  [11, 'R9C8', 'R9C9'],
];

return [
  new Shape('9x9'),
  ...givens.map(([cell, value]) => new Given(cell, value)),
  ...cages.map(([total, ...cells]) => new Cage(total, ...cells)),
];
