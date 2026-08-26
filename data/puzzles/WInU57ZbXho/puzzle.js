// Title: Lion's Den
// Author: Tallcat
// Video: https://www.youtube.com/watch?v=WInU57ZbXho
// Source: https://tinyurl.com/tc-lionsden

// Normal sudoku rules. 1-9 once each in every row, column and 3x3 box. Killer
// cages - digits in a cage sum to the cage's total and do not repeat.

const givens = [
];

// Cage totals and cells, transcribed from the drawn cages.
const cages = [
  [10, 'R2C2', 'R2C3', 'R3C2'],
  [10, 'R2C7', 'R2C8', 'R3C8'],
  [10, 'R7C8', 'R8C7', 'R8C8'],
  [10, 'R7C2', 'R8C2', 'R8C3'],
  [21, 'R1C4', 'R1C5', 'R1C6'],
  [15, 'R4C9', 'R5C9', 'R6C9'],
  [20, 'R4C1', 'R5C1', 'R6C1'],
  [12, 'R4C8', 'R5C8'],
  [20, 'R6C6', 'R7C6', 'R7C7'],
  [18, 'R3C6', 'R3C7', 'R4C6'],
  [9, 'R5C3', 'R5C4'],
  [22, 'R6C4', 'R7C3', 'R7C4'],
  [21, 'R3C3', 'R3C4', 'R4C4'],
];

return [
  new Shape('9x9'),
  ...givens.map(([cell, value]) => new Given(cell, value)),
  ...cages.map(([total, ...cells]) => new Cage(total, ...cells)),
];
