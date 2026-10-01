// Title: Beetle, Beetle
// Author: Walter Gronholm
// Video: https://www.youtube.com/watch?v=WtF_PfobSVs
// Source: https://sudokupad.app/rnvc88bijs

// Rules: normal sudoku. Digits in a cage must not repeat, and sum to the
// total in the upper left corner of the cage, if given.

// Cages as drawn (total, cells); a total of 0 marks the one cage drawn with
// no total, which Cage encodes as all-different only.
const cages = [
  [21, 'R1C1', 'R1C2', 'R2C1'],
  [21, 'R1C8', 'R1C9', 'R2C9'],
  [21, 'R8C9', 'R9C8', 'R9C9'],
  [21, 'R8C1', 'R9C1', 'R9C2'],
  [10, 'R2C4', 'R2C5', 'R3C5'],
  [10, 'R4C2', 'R5C2', 'R5C3'],
  [10, 'R4C4', 'R4C5', 'R5C4'],
  [10, 'R5C7', 'R5C8', 'R5C9'],
  [10, 'R7C5', 'R8C5', 'R9C5'],
  [11, 'R6C7', 'R7C6', 'R7C7'],
  [13, 'R6C3', 'R6C4', 'R7C3'],
  [0, 'R3C6', 'R3C7', 'R4C6'],
];

return [
  new Shape('9x9'),
  new Given('R3C3', 2),
  ...cages.map(([sum, ...cells]) => new Cage(sum, ...cells)),
];
