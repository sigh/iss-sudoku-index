// Title: April 20, 2022: Cross Hares
// Author: Philip Newman
// Video: https://www.youtube.com/watch?v=W5F2S7JpTgs
// Source: https://tinyurl.com/2p8rmrpa

// Normal sudoku rules. 1-9 once each in every row, column and 3x3 box. Killer
// cages - digits in a cage sum to the cage's total and do not repeat.

const givens = [
];

// Cage totals and cells, transcribed from the drawn cages.
const cages = [
  [10, 'R3C3', 'R3C4', 'R4C3', 'R4C4'],
  [11, 'R3C6', 'R3C7', 'R4C6', 'R4C7'],
  [29, 'R6C3', 'R6C4', 'R7C3', 'R7C4'],
  [30, 'R6C6', 'R6C7', 'R7C6', 'R7C7'],
  [3, 'R9C3', 'R9C4'],
  [9, 'R9C5', 'R9C6'],
  [9, 'R6C9', 'R7C9'],
  [11, 'R1C6', 'R1C7'],
  [15, 'R1C4', 'R1C5'],
  [17, 'R3C1', 'R4C1'],
  [5, 'R5C1', 'R6C1'],
  [8, 'R4C9', 'R5C9'],
  [4, 'R7C1', 'R7C2'],
  [16, 'R3C8', 'R3C9'],
  [16, 'R1C3', 'R2C3'],
  [4, 'R8C7', 'R9C7'],
  [11, 'R3C2', 'R4C2'],
  [11, 'R5C2', 'R6C2'],
  [9, 'R2C4', 'R2C5'],
  [17, 'R2C6', 'R2C7'],
  [14, 'R4C8', 'R5C8'],
  [5, 'R6C8', 'R7C8'],
  [9, 'R8C5', 'R8C6'],
  [7, 'R8C3', 'R8C4'],
  [7, 'R6C5', 'R7C5'],
  [11, 'R5C3', 'R5C4'],
  [6, 'R5C6', 'R5C7'],
  [12, 'R3C5', 'R4C5'],
];

return [
  new Shape('9x9'),
  ...givens.map(([cell, value]) => new Given(cell, value)),
  ...cages.map(([total, ...cells]) => new Cage(total, ...cells)),
];
