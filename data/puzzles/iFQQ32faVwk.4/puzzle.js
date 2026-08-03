// Title: Aug. 2, 2023: Second Guessing
// Author: Philip Newman
// Video: https://www.youtube.com/watch?v=iFQQ32faVwk
// Source: https://tinyurl.com/5e733x6d

// Normal sudoku rules apply. Killer: digits in a cage cannot repeat and
// must sum to the cage's total. 24 cages cover 54 of the 81 cells; the
// remaining cells carry only the default row/column/box constraints.
// Cage cells and totals transcribed from the drawn killer cages.
const cages = [
  [6, 'R1C1', 'R1C2', 'R2C1'],
  [5, 'R1C3', 'R1C4'],
  [22, 'R1C5', 'R1C6', 'R1C7'],
  [8, 'R2C7', 'R3C7', 'R4C7'],
  [7, 'R3C1', 'R4C1'],
  [8, 'R3C3', 'R3C4'],
  [10, 'R3C5', 'R3C6'],
  [13, 'R3C8', 'R3C9'],
  [4, 'R4C3', 'R5C3'],
  [17, 'R4C4', 'R4C5'],
  [7, 'R4C6', 'R5C6'],
  [3, 'R4C9', 'R5C9'],
  [17, 'R5C1', 'R6C1'],
  [13, 'R5C4', 'R6C4'],
  [16, 'R5C7', 'R6C7'],
  [22, 'R6C3', 'R7C3', 'R8C3'],
  [3, 'R6C5', 'R6C6'],
  [13, 'R6C9', 'R7C9'],
  [7, 'R7C1', 'R7C2'],
  [10, 'R7C4', 'R7C5'],
  [12, 'R7C6', 'R7C7'],
  [24, 'R8C9', 'R9C8', 'R9C9'],
  [8, 'R9C3', 'R9C4', 'R9C5'],
  [15, 'R9C6', 'R9C7'],
];

return [
  new Shape('9x9'),
  ...cages.map(([sum, ...cells]) => new Cage(sum, ...cells)),
];
