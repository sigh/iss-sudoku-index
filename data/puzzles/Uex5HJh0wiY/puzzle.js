// Title: Standing On The Shoulders Of Puzzle Giants
// Author: 
// Video: https://www.youtube.com/watch?v=Uex5HJh0wiY
// Source: https://cracking-the-cryptic.web.app/sudoku/phpn2FJHRb

// Normal sudoku rules. 1-9 once each in every row, column and 3x3 box. Killer
// cages - digits in a cage sum to the cage's total and do not repeat.

const givens = [
];

// Cage totals and cells, transcribed from the drawn cages.
const cages = [
  [22, 'R1C3', 'R1C2', 'R2C2'],
  [10, 'R2C1', 'R3C1'],
  [13, 'R4C1', 'R4C2'],
  [6, 'R4C3', 'R4C4'],
  [45, 'R7C1', 'R6C1', 'R6C2', 'R6C3', 'R6C4', 'R7C4', 'R8C4', 'R9C4', 'R9C3'],
  [20, 'R8C1', 'R8C2', 'R9C2'],
  [14, 'R8C6', 'R9C6'],
  [21, 'R7C6', 'R6C6', 'R6C7'],
  [15, 'R6C8', 'R6C9'],
  [13, 'R7C9', 'R8C9', 'R8C8'],
  [5, 'R9C7', 'R9C8'],
  [11, 'R1C4', 'R2C4', 'R3C4'],
  [45, 'R1C7', 'R1C6', 'R2C6', 'R3C6', 'R4C6', 'R4C7', 'R3C9', 'R4C9', 'R4C8'],
  [19, 'R1C8', 'R2C8', 'R2C9'],
];

return [
  new Shape('9x9'),
  ...givens.map(([cell, value]) => new Given(cell, value)),
  ...cages.map(([total, ...cells]) => new Cage(total, ...cells)),
];
