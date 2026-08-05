// Title: Infancy
// Author: Myxo
// Video: https://www.youtube.com/watch?v=eGx_TdUVo3k
// Source: https://app.crackingthecryptic.com/sudoku/g6jHNM4rnT

// Normal sudoku rules apply. Each listed cage has the shown total and no
// repeated digit. The blue marked diagonal is R1C9 through R9C1.

// Killer cages transcribed from the drawn cage cells and top-left totals.
const cages = [
  [9, 'R1C3', 'R2C3'],
  [8, 'R3C2', 'R3C1'],
  [15, 'R1C4', 'R2C4'],
  [20, 'R1C7', 'R2C7', 'R2C6'],
  [13, 'R3C7', 'R4C7', 'R4C8', 'R3C8'],
  [5, 'R5C7', 'R5C8'],
  [5, 'R4C2', 'R4C1'],
  [15, 'R6C2', 'R7C2', 'R7C1'],
  [27, 'R7C3', 'R8C3', 'R8C4', 'R7C4'],
  [15, 'R7C5', 'R8C5'],
  [14, 'R9C7', 'R9C8'],
  [9, 'R7C9', 'R8C9'],
  [19, 'R4C5', 'R4C4', 'R5C4'],
  [15, 'R5C6', 'R6C6', 'R6C5'],
];

return [
  new Shape('9x9'),
  ...cages.map(([sum, ...cells]) => new Cage(sum, ...cells)),
  new Diagonal(1),
];
