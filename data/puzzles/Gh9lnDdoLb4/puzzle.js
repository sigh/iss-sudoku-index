// Title: Killer Hippo
// Author: 
// Video: https://www.youtube.com/watch?v=Gh9lnDdoLb4
// Source: https://cracking-the-cryptic.web.app/sudoku/F7pHprq69M

// Normal sudoku rules. 1-9 once each in every row, column and 3x3 box. Killer
// cages - digits in a cage sum to the cage's total and do not repeat.

const givens = [
];

// Cage totals and cells, transcribed from the drawn cages.
const cages = [
  [28, 'R1C1', 'R1C2', 'R1C3', 'R1C4'],
  [14, 'R1C7', 'R1C8', 'R1C9', 'R2C9'],
  [12, 'R2C7', 'R2C6', 'R3C6'],
  [3, 'R2C5', 'R2C4'],
  [16, 'R2C1', 'R3C1', 'R3C2'],
  [26, 'R4C2', 'R5C2', 'R6C2', 'R4C3'],
  [19, 'R6C1', 'R7C1', 'R8C1'],
  [16, 'R9C1', 'R9C2', 'R9C3', 'R8C3'],
  [8, 'R7C4', 'R8C4', 'R8C5'],
  [14, 'R8C6', 'R9C6', 'R9C7', 'R9C8'],
  [20, 'R7C9', 'R8C9', 'R9C9'],
  [24, 'R7C8', 'R6C8', 'R5C8', 'R6C7'],
  [20, 'R4C8', 'R4C9', 'R3C9'],
  [10, 'R4C5', 'R4C6'],
  [9, 'R6C4', 'R6C5'],
];

return [
  new Shape('9x9'),
  ...givens.map(([cell, value]) => new Given(cell, value)),
  ...cages.map(([total, ...cells]) => new Cage(total, ...cells)),
];
