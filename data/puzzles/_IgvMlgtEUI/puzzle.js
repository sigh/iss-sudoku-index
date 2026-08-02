// Title: Killer Sudoku 117
// Author: Akash Doulani
// Video: https://www.youtube.com/watch?v=_IgvMlgtEUI
// Source: https://app.crackingthecryptic.com/TQjF8PBmDN

// Normal 9x9 Sudoku rules apply. Each outlined cage has its displayed sum and
// contains no repeated digit.
// Cage totals and cells are transcribed from the source's drawn killer cages.
const cages = [
  [12, 'R1C1', 'R1C2', 'R2C3', 'R2C2'],
  [26, 'R2C1', 'R3C1', 'R3C2', 'R4C2'],
  [6, 'R3C3', 'R4C3'],
  [13, 'R5C2', 'R5C3'],
  [28, 'R7C1', 'R8C1', 'R8C2', 'R9C2'],
  [10, 'R7C2', 'R7C3', 'R8C3', 'R8C4'],
  [10, 'R9C3', 'R9C4'],
  [6, 'R8C5', 'R9C5'],
  [8, 'R5C5'],
  [6, 'R1C5', 'R2C5'],
  [13, 'R1C6', 'R1C7'],
  [29, 'R1C8', 'R2C8', 'R2C9', 'R3C9'],
  [15, 'R2C6', 'R2C7', 'R3C7', 'R3C8'],
  [11, 'R5C7', 'R5C8'],
  [13, 'R6C7', 'R7C7'],
  [30, 'R6C8', 'R7C8', 'R7C9', 'R8C9'],
  [11, 'R8C7', 'R8C8', 'R9C8', 'R9C9'],
];

return [
  new Shape('9x9'),
  ...cages.map(([sum, ...cells]) => new Cage(sum, ...cells)),
];
