// Title: unknown
// Author: Unknown
// Video: https://www.youtube.com/watch?v=qQ-B8R3wnEM
// Source: https://cracking-the-cryptic.web.app/sudoku/6Q27G2Lt3H

// Rules encoded:
//  - Normal sudoku: 1-9 once per row, column and 3x3 box. The drawn regions
//    are the nine ordinary boxes, so the default 9x9 Shape covers this.
//  - Killer cages: the digits in a cage sum to its printed total and do not
//    repeat within the cage.
// The source publishes no rules text, so the cage semantics above are the
// standard killer-cage convention; the board draws nothing else. There are no
// givens, and no clause is omitted.

// The 13 drawn cages, in the order the board lists them: printed total first,
// then the cage's cells in drawn order.
const cages = [
  [44, 'R1C3', 'R1C4', 'R1C5', 'R1C6', 'R1C7', 'R1C8', 'R1C9', 'R2C9'],
  [36, 'R2C2', 'R2C1', 'R3C1', 'R4C1', 'R5C1', 'R6C1', 'R7C1', 'R8C1'],
  [21, 'R3C3', 'R3C4', 'R4C4'],
  [21, 'R4C3', 'R4C2', 'R5C2'],
  [16, 'R6C2', 'R6C3', 'R5C3', 'R7C3'],
  [18, 'R7C2', 'R8C2', 'R9C2', 'R9C1'],
  [36, 'R8C3', 'R9C3', 'R8C4', 'R9C4', 'R9C5', 'R9C6', 'R9C7', 'R9C8'],
  [7, 'R8C5', 'R8C6'],
  [44, 'R8C7', 'R8C8', 'R8C9', 'R7C9', 'R6C9', 'R5C9', 'R4C9', 'R3C9'],
  [41, 'R2C8', 'R3C8', 'R4C8', 'R5C8', 'R6C8', 'R7C8', 'R4C7', 'R4C6'],
  [11, 'R2C6', 'R3C6'],
  [14, 'R5C5', 'R6C5', 'R5C6'],
  [14, 'R6C7', 'R7C7', 'R7C6', 'R7C5'],
];

return [
  new Shape('9x9'),
  ...cages.map(([total, ...cells]) => new Cage(total, ...cells)),
];
