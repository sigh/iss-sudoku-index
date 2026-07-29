// Title: Ring Cycle
// Author: Austin C
// Video: https://www.youtube.com/watch?v=cTa6U_17emc
// Source: https://app.crackingthecryptic.com/fpr5yllxfe

// Normal Sudoku applies. Each listed killer cage has its drawn total and no repeated digit.
const givens = [
  ['R1C4', 7], ['R1C9', 3], ['R5C5', 5], ['R7C5', 2], ['R8C1', 1],
];

// Drawn killer-cage totals and cell paths from the source payload.
const cages = [
  [11, 'R1C1', 'R1C2', 'R2C2', 'R2C1'],
  [17, 'R1C4', 'R1C5', 'R1C6'],
  [28, 'R2C3', 'R2C4', 'R2C5', 'R2C6'],
  [16, 'R1C7', 'R2C7'],
  [10, 'R1C8', 'R1C9', 'R2C8', 'R2C9'],
  [35, 'R3C9', 'R4C9', 'R5C9', 'R6C9', 'R7C9'],
  [26, 'R3C8', 'R4C8', 'R5C8', 'R6C8'],
  [12, 'R8C8', 'R8C9', 'R9C9', 'R9C8'],
  [17, 'R8C7', 'R8C6', 'R8C5'],
  [18, 'R9C4', 'R9C5', 'R9C6'],
  [10, 'R8C1', 'R8C2', 'R9C2', 'R9C1'],
  [14, 'R7C1', 'R7C2'],
  [15, 'R6C1', 'R6C2'],
  [14, 'R4C1', 'R5C1'],
  [22, 'R3C1', 'R3C2', 'R4C2'],
  [12, 'R6C3', 'R7C3', 'R7C4'],
  [8, 'R7C6', 'R7C7', 'R6C7'],
  [10, 'R3C6', 'R3C7', 'R4C7'],
  [7, 'R4C3', 'R3C3', 'R3C4'],
  [35, 'R4C5', 'R5C4', 'R6C5', 'R5C6', 'R5C5'],
];

return [
  new Shape('9x9'),
  ...givens.map(([cell, value]) => new Given(cell, value)),
  ...cages.map(([sum, ...cells]) => new Cage(sum, ...cells)),
];
