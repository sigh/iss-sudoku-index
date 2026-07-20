// Title: The 23 Enigma
// Author: sujoyku
// Video: https://www.youtube.com/watch?v=N6_TVvHh79U
// Source: https://sudokupad.app/qhybrqkov4

// Every drawn killer cage sums to 23 and has no repeated digit.
const cageCells = [
  ['R1C2', 'R1C3', 'R1C4', 'R1C5'],
  ['R2C3', 'R2C4', 'R3C2', 'R3C3'],
  ['R1C1', 'R2C1', 'R2C2', 'R3C1'],
  ['R2C6', 'R3C5', 'R3C6', 'R4C6'],
  ['R6C4', 'R7C4', 'R7C5', 'R8C4'],
  ['R9C5', 'R9C6', 'R9C7', 'R9C8'],
  ['R7C9', 'R8C8', 'R8C9', 'R9C9'],
  ['R7C7', 'R7C8', 'R8C6', 'R8C7'],
  ['R4C4', 'R5C4', 'R5C5', 'R5C6', 'R6C6'],
  ['R8C1', 'R9C1', 'R9C2'],
  ['R4C1', 'R5C1', 'R5C2', 'R5C3', 'R6C2', 'R6C3'],
  ['R4C7', 'R4C8', 'R5C8', 'R5C9', 'R6C8', 'R6C9'],
  ['R6C1', 'R7C1', 'R7C2', 'R7C3', 'R8C3'],
  ['R1C8', 'R2C8', 'R2C9', 'R3C7', 'R3C8'],
];
const cages = cageCells.map(cells => new Cage(23, ...cells));

return [
  new Shape('9x9'),
  ...cages,
];
