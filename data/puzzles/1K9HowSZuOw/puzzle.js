// Title: Can You Escape This Knot?
// Author: 
// Video: https://www.youtube.com/watch?v=1K9HowSZuOw
// Source: https://cracking-the-cryptic.web.app/sudoku/nnQ482qjHq

// Normal sudoku rules. 1-9 once each in every row, column and 3x3 box. Killer
// cages - digits in a cage sum to the cage's total and do not repeat.

const givens = [
];

// Cage totals and cells, transcribed from the drawn cages.
const cages = [
  [6, 'R3C1', 'R4C1'],
  [9, 'R6C1', 'R7C1'],
  [12, 'R8C1', 'R8C2', 'R9C2'],
  [15, 'R9C3', 'R9C4'],
  [12, 'R9C6', 'R9C7'],
  [9, 'R7C5', 'R6C5'],
  [11, 'R6C3', 'R7C3', 'R7C4'],
  [13, 'R5C3', 'R5C4'],
  [13, 'R5C6', 'R5C7'],
  [5, 'R4C5', 'R3C5'],
  [20, 'R3C6', 'R3C7', 'R4C7'],
  [15, 'R1C3', 'R1C4'],
  [12, 'R1C7', 'R1C6'],
  [18, 'R1C8', 'R2C8', 'R2C9'],
  [6, 'R3C9', 'R4C9'],
  [9, 'R6C9', 'R7C9'],
];

return [
  new Shape('9x9'),
  ...givens.map(([cell, value]) => new Given(cell, value)),
  ...cages.map(([total, ...cells]) => new Cage(total, ...cells)),
];
