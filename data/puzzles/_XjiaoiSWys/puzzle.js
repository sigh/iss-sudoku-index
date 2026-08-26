// Title: A Brilliant Killer Sudoku - Themed for 1/11
// Author: 
// Video: https://www.youtube.com/watch?v=_XjiaoiSWys
// Source: https://cracking-the-cryptic.web.app/sudoku/NtJtjqdgT8

// Normal sudoku rules. 1-9 once each in every row, column and 3x3 box. Killer
// cages - digits in a cage sum to the cage's total and do not repeat.

const givens = [
  ['R2C4', 1],
  ['R4C8', 1],
  ['R6C2', 1],
  ['R8C6', 1],
];

// Cage totals and cells, transcribed from the drawn cages.
const cages = [
  [11, 'R1C3', 'R1C4'],
  [11, 'R1C5', 'R2C5', 'R2C4'],
  [11, 'R1C6', 'R1C7'],
  [11, 'R1C9', 'R2C9', 'R3C9'],
  [11, 'R2C8', 'R3C8'],
  [11, 'R3C2', 'R3C3', 'R3C4', 'R3C5'],
  [11, 'R2C3', 'R2C2', 'R2C1'],
  [11, 'R3C1', 'R4C1', 'R4C2'],
  [11, 'R4C6', 'R4C7'],
  [11, 'R4C5', 'R5C5', 'R6C5'],
  [11, 'R6C2', 'R7C2', 'R7C3', 'R8C3'],
  [11, 'R9C1', 'R9C2'],
  [11, 'R9C3', 'R9C4'],
  [11, 'R9C6', 'R9C7', 'R8C7'],
  [11, 'R7C7', 'R7C6', 'R8C6'],
  [11, 'R7C8', 'R8C8'],
  [11, 'R7C9', 'R8C9'],
  [11, 'R9C8', 'R9C9'],
  [11, 'R4C8', 'R4C9', 'R5C9'],
  [11, 'R5C6', 'R5C7', 'R5C8'],
];

return [
  new Shape('9x9'),
  ...givens.map(([cell, value]) => new Given(cell, value)),
  ...cages.map(([total, ...cells]) => new Cage(total, ...cells)),
];
