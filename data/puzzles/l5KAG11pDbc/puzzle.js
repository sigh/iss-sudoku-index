// Title: Four Diagonals Sudoku
// Author: Aad van de Wetering
// Video: https://www.youtube.com/watch?v=l5KAG11pDbc
// Source: https://cracking-the-cryptic.web.app/sudoku/dN6dFnnLGq

// Normal sudoku rules apply (default row/column/box all-different from
// Shape('9x9')). In addition, each of the four marked 8-cell diagonals
// (payload lines #0-#3) must, combined with the central cell R5C5 (the
// payload's one circle underlay), contain the digits 1 to 9. None of the
// four drawn diagonals passes through R5C5 itself, which is why it is
// appended to each set below. AllDifferent over exactly 9 cells on a 1-9
// grid is equivalent to "contains every digit 1-9 once", so it is the
// faithful encoding of this rule.

const diagonals = [
  // Line #0: R1C2-R2C3-R3C4-R4C5-R5C6-R6C7-R7C8-R8C9
  ['R1C2', 'R2C3', 'R3C4', 'R4C5', 'R5C6', 'R6C7', 'R7C8', 'R8C9'],
  // Line #1: R2C1-R3C2-R4C3-R5C4-R6C5-R7C6-R8C7-R9C8
  ['R2C1', 'R3C2', 'R4C3', 'R5C4', 'R6C5', 'R7C6', 'R8C7', 'R9C8'],
  // Line #2: R8C1-R7C2-R6C3-R5C4-R4C5-R3C6-R2C7-R1C8
  ['R8C1', 'R7C2', 'R6C3', 'R5C4', 'R4C5', 'R3C6', 'R2C7', 'R1C8'],
  // Line #3: R2C9-R3C8-R4C7-R5C6-R6C5-R7C4-R8C3-R9C2
  ['R2C9', 'R3C8', 'R4C7', 'R5C6', 'R6C5', 'R7C4', 'R8C3', 'R9C2'],
];

return [
  new Shape('9x9'),

  new Given('R1C4', 3),
  new Given('R2C7', 3),
  new Given('R2C8', 1),
  new Given('R4C3', 7),
  new Given('R4C4', 5),
  new Given('R6C3', 2),
  new Given('R6C6', 9),
  new Given('R6C9', 4),
  new Given('R7C2', 4),
  new Given('R7C8', 3),
  new Given('R8C7', 6),

  ...diagonals.map(cells => new AllDifferent(...cells, 'R5C5')),
];
