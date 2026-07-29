// Title: Unexpected Places
// Author: Nurator
// Video: https://www.youtube.com/watch?v=KT7ybN5YSis
// Source: https://sudokupad.app/4bssym76fv

// Normal Sudoku applies. Digits in each drawn cage are distinct and total its
// printed sum. The unlabelled two-cell cage is distinct; single-cell cages are
// vacuous. Fog only controls clue reveal and adds no final-grid condition.

// Totalled cage cells and sums transcribed from the drawn dashed cages.
const cages = [
  [30, 'R8C8', 'R8C9', 'R9C8', 'R9C9'],
  [3, 'R7C1', 'R7C2'],
  [7, 'R1C7', 'R2C7'],
  [18, 'R6C8', 'R6C9', 'R7C8'],
  [45, 'R4C6', 'R4C7', 'R4C8', 'R4C9', 'R5C6', 'R6C6', 'R6C7', 'R7C5', 'R7C6'],
  [42, 'R3C5', 'R3C6', 'R3C7', 'R4C5', 'R5C4', 'R5C5', 'R6C5'],
  [12, 'R4C3', 'R5C2', 'R5C3', 'R6C2'],
  [40, 'R2C4', 'R2C5', 'R2C6', 'R3C2', 'R3C3', 'R3C4', 'R4C2', 'R4C4'],
  [13, 'R1C4', 'R1C5', 'R1C6'],
  [16, 'R1C8', 'R1C9', 'R2C9'],
  [31, 'R8C1', 'R9C1', 'R9C2', 'R9C3', 'R9C4', 'R9C5'],
];

return [
  new Shape('9x9'),
  ...cages.map(([total, ...cells]) => new Cage(total, ...cells)),
  new AllDifferent('R8C8', 'R9C8'),
];
