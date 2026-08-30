// Title: Killer Sudoku: New Logic And Patterns
// Author: Seungjae Kwak
// Video: https://www.youtube.com/watch?v=f6_ODCwSLCg
// Source: https://cracking-the-cryptic.web.app/sudoku/HRNPBHjG6h

// Normal sudoku rules (default rows/cols/boxes). Killer cages: digits in a
// cage sum to its total and cannot repeat within it. No rules text is
// embedded in the payload; these are the standard killer-cage semantics.
// Nineteen cages cover 78 of 81 cells -- the three uncaged cells (R3C7,
// R5C5, R7C3) still carry ordinary row/column/box sudoku constraints.

// Cage totals and cells, transcribed from the drawn `cages` array.
const cages = [
  [12, 'R1C1', 'R1C2', 'R2C1'],
  [31, 'R1C3', 'R1C4', 'R2C2', 'R2C3', 'R3C1', 'R3C2', 'R4C1'],
  [45, 'R1C5', 'R2C4', 'R2C5', 'R3C3', 'R3C4', 'R4C2', 'R4C3', 'R5C1', 'R5C2'],
  [10, 'R1C6', 'R1C7'],
  [21, 'R1C8', 'R1C9', 'R2C9'],
  [9, 'R2C7', 'R2C8', 'R3C8'],
  [11, 'R3C9', 'R4C9'],
  [20, 'R2C6', 'R3C5', 'R3C6', 'R4C6'],
  [13, 'R4C4', 'R4C5', 'R5C4'],
  [28, 'R5C3', 'R6C2', 'R6C3', 'R6C4'],
  [11, 'R6C1', 'R7C1'],
  [22, 'R8C1', 'R9C1', 'R9C2'],
  [9, 'R7C2', 'R8C2', 'R8C3'],
  [10, 'R9C3', 'R9C4'],
  [21, 'R7C4', 'R7C5', 'R8C4'],
  [45, 'R5C8', 'R5C9', 'R6C7', 'R6C8', 'R7C6', 'R7C7', 'R8C5', 'R8C6', 'R9C5'],
  [33, 'R6C9', 'R7C8', 'R7C9', 'R8C7', 'R8C8', 'R9C6', 'R9C7'],
  [10, 'R8C9', 'R9C8', 'R9C9'],
  [21, 'R4C7', 'R4C8', 'R5C7'],
  [20, 'R5C6', 'R6C5', 'R6C6'],
];

return [
  new Shape('9x9'),
  ...cages.map(([sum, ...cells]) => new Cage(sum, ...cells)),
];
