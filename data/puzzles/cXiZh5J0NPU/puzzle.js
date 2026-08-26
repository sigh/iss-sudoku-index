// Title: Todaily
// Author: Riffclown
// Video: https://www.youtube.com/watch?v=cXiZh5J0NPU
// Source: https://tinyurl.com/Todaily

// Normal sudoku rules. 1-9 once each in every row, column and 3x3 box. Killer
// cages - digits in a cage sum to the cage's total and do not repeat.

const givens = [
  ['R2C2', 2],
  ['R2C5', 4],
  ['R2C8', 3],
  ['R5C2', 5],
  ['R5C8', 8],
  ['R8C2', 6],
  ['R8C8', 1],
  ['R9C4', 7],
  ['R9C6', 3],
];

// Cage totals and cells, transcribed from the drawn cages.
const cages = [
  [39, 'R3C2', 'R4C2', 'R4C3', 'R5C3', 'R5C4', 'R6C4'],
  [39, 'R4C6', 'R5C6', 'R5C7', 'R6C7', 'R6C8', 'R7C8'],
  [39, 'R1C7', 'R1C8', 'R2C6', 'R2C7', 'R3C5', 'R3C6', 'R4C4', 'R4C5'],
  [39, 'R6C5', 'R6C6', 'R7C4', 'R7C5', 'R8C3', 'R8C4', 'R9C2', 'R9C3'],
];

return [
  new Shape('9x9'),
  ...givens.map(([cell, value]) => new Given(cell, value)),
  ...cages.map(([total, ...cells]) => new Cage(total, ...cells)),
];
