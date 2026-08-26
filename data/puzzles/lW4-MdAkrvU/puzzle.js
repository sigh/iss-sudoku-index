// Title: The Greatest Puzzle ARG Ever!
// Author: 
// Video: https://www.youtube.com/watch?v=lW4-MdAkrvU
// Source: https://cracking-the-cryptic.web.app/sudoku/B9h9GNnBTH

// Normal sudoku rules. 1-9 once each in every row, column and 3x3 box. Killer
// cages - digits in a cage sum to the cage's total and do not repeat.

const givens = [
];

// Cage totals and cells, transcribed from the drawn cages.
const cages = [
  [10, 'R1C2', 'R1C1', 'R2C1'],
  [16, 'R1C3', 'R2C3', 'R2C4', 'R1C4'],
  [15, 'R3C2', 'R4C2', 'R4C3'],
  [7, 'R2C5', 'R3C5'],
  [10, 'R3C6', 'R4C6', 'R4C7'],
  [6, 'R4C4', 'R5C4', 'R6C4'],
  [20, 'R6C2', 'R6C1', 'R7C1'],
  [10, 'R8C1', 'R9C1', 'R9C2'],
  [16, 'R8C3', 'R9C3', 'R9C4', 'R8C4'],
  [18, 'R9C5', 'R8C5', 'R7C5', 'R7C6'],
  [10, 'R5C6', 'R5C7', 'R6C7'],
  [12, 'R6C8', 'R7C8', 'R7C7'],
  [13, 'R7C9', 'R8C9', 'R9C9', 'R9C8'],
  [9, 'R1C8', 'R1C9', 'R2C9'],
];

return [
  new Shape('9x9'),
  ...givens.map(([cell, value]) => new Given(cell, value)),
  ...cages.map(([total, ...cells]) => new Cage(total, ...cells)),
];
