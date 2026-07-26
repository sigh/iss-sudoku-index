// Title: Fifteens Coming Out Yo' Ears
// Author: Team B
// Video: https://www.youtube.com/watch?v=HXv2NFLO18s
// Source: https://sudokupad.app/60ow3k645m

// Normal Sudoku rules apply. Each killer cage sums to 15 with no repeated
// digit. Each quadruple's listed digits occur somewhere in its surrounding
// 2x2 cells.
const cages = [
  ['R1C2', 'R1C3', 'R1C4'],
  ['R1C6', 'R1C7', 'R1C8'],
  ['R2C9', 'R3C9', 'R4C9'],
  ['R6C9', 'R7C9', 'R8C9'],
  ['R9C6', 'R9C7', 'R9C8'],
  ['R9C2', 'R9C3', 'R9C4'],
  ['R6C1', 'R7C1', 'R8C1'],
  ['R2C1', 'R3C1', 'R4C1'],
  ['R2C5', 'R3C5', 'R4C5'],
  ['R6C5', 'R7C5', 'R8C5'],
  ['R5C2', 'R5C3', 'R5C4'],
  ['R5C6', 'R5C7', 'R5C8'],
];

return [
  new Shape('9x9'),
  ...cages.map(cells => new Cage(15, ...cells)),
  new Quad('R1C1', 1, 2, 3),
  new Quad('R1C8', 1, 2, 3),
  new Quad('R8C8', 1, 2, 3),
  new Quad('R8C1', 1, 2, 3),
  new Quad('R1C5', 7, 8, 9),
  new Quad('R8C4', 7, 8, 9),
  new Quad('R4C8', 6, 7, 8),
  new Quad('R5C1', 6, 7, 8),
  new Quad('R7C2', 2),
  new Quad('R7C6', 7),
  new Quad('R2C7', 5),
  new Quad('R2C3', 8),
  new Quad('R4C4', 2, 8),
  new Quad('R4C5', 1, 5),
  new Quad('R5C4', 4, 7),
  new Quad('R5C5', 3, 6),
];
