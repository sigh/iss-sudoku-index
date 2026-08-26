// Title: Scientific Method
// Author: Tallcat
// Video: https://www.youtube.com/watch?v=ShHzi6izpGQ
// Source: https://tinyurl.com/sczzz8en

// Normal sudoku rules. 1-9 once each in every row, column and 3x3 box. Killer
// cages - digits in a cage sum to the cage's total and do not repeat.

const givens = [
];

// Cage totals and cells, transcribed from the drawn cages.
const cages = [
  [13, 'R2C5', 'R2C6', 'R2C7'],
  [18, 'R1C4', 'R1C5', 'R1C6', 'R2C3', 'R2C4'],
  [17, 'R4C9', 'R5C9', 'R6C8', 'R6C9', 'R7C8'],
  [14, 'R3C8', 'R4C8', 'R5C8'],
  [10, 'R1C8', 'R1C9', 'R2C9'],
  [12, 'R3C6', 'R3C7', 'R4C7'],
  [15, 'R5C3', 'R6C3', 'R7C3', 'R7C4', 'R7C5'],
  [15, 'R6C6', 'R6C7', 'R7C6'],
  [16, 'R3C4', 'R4C3', 'R4C4'],
  [21, 'R4C5', 'R4C6', 'R5C5', 'R5C6'],
  [17, 'R9C5', 'R9C6', 'R9C7'],
  [16, 'R6C1', 'R7C1', 'R8C1'],
  [11, 'R3C1', 'R4C1'],
];

return [
  new Shape('9x9'),
  ...givens.map(([cell, value]) => new Given(cell, value)),
  ...cages.map(([total, ...cells]) => new Cage(total, ...cells)),
];
