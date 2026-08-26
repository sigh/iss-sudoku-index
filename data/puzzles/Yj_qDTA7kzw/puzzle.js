// Title: This Is What A World-Class Sudoku Looks Like!
// Author: 
// Video: https://www.youtube.com/watch?v=Yj_qDTA7kzw
// Source: https://cracking-the-cryptic.web.app/sudoku/b44fr3NGf6

// Normal sudoku rules. 1-9 once each in every row, column and 3x3 box. Killer
// cages - digits in a cage sum to the cage's total and do not repeat.

const givens = [
];

// Cage totals and cells, transcribed from the drawn cages.
const cages = [
  [6, 'R1C2', 'R2C2', 'R2C1'],
  [18, 'R2C4', 'R2C3', 'R3C3', 'R3C2', 'R4C2'],
  [19, 'R3C4', 'R4C4', 'R4C3'],
  [27, 'R4C5', 'R5C5', 'R5C4', 'R6C5', 'R5C6'],
  [13, 'R3C6', 'R4C6', 'R4C7'],
  [27, 'R2C6', 'R2C7', 'R3C7', 'R3C8', 'R4C8'],
  [17, 'R1C8', 'R2C8', 'R2C9'],
  [16, 'R6C3', 'R6C4', 'R7C4'],
  [18, 'R6C6', 'R7C6', 'R6C7'],
  [23, 'R6C8', 'R7C8', 'R7C7', 'R8C7', 'R8C6'],
  [9, 'R8C8', 'R9C8', 'R8C9'],
  [23, 'R6C2', 'R7C2', 'R7C3', 'R8C3', 'R8C4'],
  [11, 'R8C1', 'R8C2', 'R9C2'],
];

return [
  new Shape('9x9'),
  ...givens.map(([cell, value]) => new Given(cell, value)),
  ...cages.map(([total, ...cells]) => new Cage(total, ...cells)),
];
