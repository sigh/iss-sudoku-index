// Title: Jan 13, 2022: Killer Sudoku
// Author: Sam Cappleman-Lynes
// Video: https://www.youtube.com/watch?v=0sOQm77GSSA
// Source: https://tinyurl.com/4u7mumyp

// Normal sudoku rules. 1-9 once each in every row, column and 3x3 box. Killer
// cages - digits in a cage sum to the cage's total and do not repeat.

const givens = [
  ['R3C1', 8],
  ['R3C2', 6],
  ['R4C1', 4],
  ['R4C2', 7],
  ['R6C8', 9],
  ['R6C9', 4],
  ['R7C8', 5],
  ['R7C9', 2],
];

// Cage totals and cells, transcribed from the drawn cages.
const cages = [
  [5, 'R1C1', 'R1C2'],
  [6, 'R2C2', 'R2C3'],
  [7, 'R3C3', 'R3C4'],
  [8, 'R4C4', 'R4C5'],
  [6, 'R1C5', 'R1C6'],
  [7, 'R2C6', 'R2C7'],
  [8, 'R3C7', 'R3C8'],
  [9, 'R4C8', 'R4C9'],
  [4, 'R6C1', 'R6C2'],
  [5, 'R7C2', 'R7C3'],
  [6, 'R8C3', 'R8C4'],
  [7, 'R9C4', 'R9C5'],
  [8, 'R6C5', 'R6C6'],
  [9, 'R7C6', 'R7C7'],
  [10, 'R8C7', 'R8C8'],
  [11, 'R9C8', 'R9C9'],
];

return [
  new Shape('9x9'),
  ...givens.map(([cell, value]) => new Given(cell, value)),
  ...cages.map(([total, ...cells]) => new Cage(total, ...cells)),
];
