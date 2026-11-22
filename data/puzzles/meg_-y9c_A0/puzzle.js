// Title: Scattered
// Author: Tallcat
// Video: https://www.youtube.com/watch?v=meg_-y9c_A0
// Source: https://sudokupad.app/7v57yvn5vf

// Normal sudoku rules (default rows/cols/boxes). Killer cages: digits in a
// cage do not repeat and sum to the clue in its top left corner. No givens.

// Cage totals and cells transcribed from the drawn `cages` array.
const cages = [
  [6, 'R1C1', 'R1C2', 'R2C1'],
  [9, 'R5C1', 'R6C1'],
  [9, 'R8C1', 'R9C1', 'R9C2'],
  [9, 'R1C8', 'R1C9', 'R2C9'],
  [16, 'R7C9', 'R8C9', 'R9C7', 'R9C8', 'R9C9'],
  [10, 'R4C8', 'R4C9'],
  [8, 'R5C7', 'R5C8'],
  [14, 'R6C7', 'R7C6', 'R7C7'],
  [33, 'R4C4', 'R4C5', 'R4C6', 'R5C4', 'R6C4'],
  [10, 'R1C5', 'R1C6'],
  [10, 'R6C3', 'R7C3'],
  [12, 'R8C4', 'R9C4'],
  [9, 'R7C5', 'R8C5'],
  [13, 'R3C6', 'R3C7'],
];

return [
  new Shape('9x9'),
  ...cages.map(([sum, ...cells]) => new Cage(sum, ...cells)),
];
