// Title: Killer Sudoku
// Author: Clover
// Video: https://www.youtube.com/watch?v=c_NjEbFEeW0
// Source: https://app.crackingthecryptic.com/sudoku/HqTBn3Pr6R

// Normal sudoku rules apply (standard 3x3 boxes, no givens). Digits cannot
// repeat in cages, which show their sum. Four cages carry no printed total
// (per the payload); the rules still make them real cages, so only the
// distinctness half of the rule applies to those -- AllDifferent, no Sum.
// Cage cell lists are transcribed from the puzzle's drawn cage geometry.

const totalledCages = [
  [3, 'R1C1', 'R2C1'],
  [7, 'R3C1', 'R4C1'],
  [11, 'R5C1', 'R6C1'],
  [15, 'R7C1', 'R7C2'],
  [8, 'R1C2', 'R1C3'],
  [12, 'R1C4', 'R1C5'],
  [9, 'R1C6', 'R1C7'],
  [15, 'R2C7', 'R3C7'],
  [8, 'R3C8', 'R3C9'],
  [13, 'R3C3', 'R4C3'],
  [11, 'R5C3', 'R6C3'],
  [9, 'R7C3', 'R8C3'],
  [24, 'R4C4', 'R4C5', 'R5C4'],
  [10, 'R5C5', 'R5C6', 'R6C5', 'R6C6'],
  [13, 'R4C7', 'R5C7'],
  [4, 'R6C7', 'R7C7'],
  [6, 'R9C5', 'R9C6'],
  [13, 'R9C7', 'R9C8'],
  [5, 'R4C9', 'R5C9'],
  [11, 'R6C9', 'R7C9'],
];

const noTotalCages = [
  ['R3C4', 'R3C5', 'R3C6'],
  ['R9C3', 'R9C4'],
  ['R7C4', 'R7C5', 'R7C6'],
  ['R8C9', 'R9C9'],
];

return [
  new Shape('9x9'),
  ...totalledCages.map(([sum, ...cells]) => new Cage(sum, ...cells)),
  ...noTotalCages.map((cells) => new AllDifferent(...cells)),
];
