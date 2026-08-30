// Title: Untitled
// Author: Unknown
// Video: https://www.youtube.com/watch?v=ZuZsi4u_t44
// Source: https://cracking-the-cryptic.web.app/sudoku/mnpfMNHFpB

// Irregular (jigsaw) Sudoku with killer cages. Standard sudoku rules: every
// row, column, and each of the 9 irregular 9-cell regions below contains
// 1-9 once each (the regions replace the default 3x3 boxes, hence
// NoBoxes). Five killer cages additionally require their cells to be
// distinct and sum to the printed total. No givens. The payload carries no
// rules text and its 81 coloured underlays cut across both the regions and
// the cages -- they are decoration, not a rule, and are not encoded.

// Region cell lists transcribed from the source payload's `regions` array
// (0-indexed [row, col] pairs, converted to R#C# here).
const regions = [
  ['R1C1', 'R1C2', 'R1C3', 'R1C4', 'R1C5', 'R1C6', 'R1C7', 'R1C8', 'R1C9'],
  ['R2C2', 'R2C1', 'R3C1', 'R4C1', 'R5C1', 'R6C1', 'R7C1', 'R8C1', 'R9C1'],
  ['R7C2', 'R8C2', 'R9C2', 'R6C2', 'R5C2', 'R4C2', 'R3C2', 'R3C3', 'R2C3'],
  ['R2C4', 'R3C4', 'R4C4', 'R4C3', 'R5C3', 'R6C3', 'R7C3', 'R8C3', 'R9C3'],
  ['R2C5', 'R3C5', 'R4C5', 'R5C5', 'R5C4', 'R6C4', 'R7C4', 'R8C4', 'R9C4'],
  ['R2C9', 'R3C9', 'R4C9', 'R5C9', 'R6C9', 'R8C9', 'R7C9', 'R9C9', 'R9C8'],
  ['R2C6', 'R3C6', 'R4C6', 'R5C6', 'R6C6', 'R6C5', 'R7C5', 'R8C5', 'R9C5'],
  ['R9C6', 'R8C6', 'R7C6', 'R7C7', 'R6C7', 'R5C7', 'R3C7', 'R4C7', 'R2C7'],
  ['R8C7', 'R9C7', 'R8C8', 'R7C8', 'R6C8', 'R5C8', 'R4C8', 'R3C8', 'R2C8'],
];

// Cages: cells and totals transcribed from the payload's `cages` array.
const cages = [
  new Cage(24, 'R1C2', 'R1C3', 'R1C4', 'R1C5', 'R1C6', 'R1C7'),
  new Cage(18, 'R1C8', 'R2C8', 'R3C8', 'R4C8'),
  new Cage(26, 'R5C1', 'R5C2', 'R5C3', 'R5C4'),
  new Cage(10, 'R4C6', 'R5C6', 'R6C6'),
  new Cage(28, 'R8C5', 'R8C6', 'R8C7', 'R8C8', 'R8C9'),
];

return [
  new Shape('9x9'),
  new NoBoxes(),
  ...regions.map(cells => new Jigsaw('9x9', ...cells)),
  ...cages,
];
