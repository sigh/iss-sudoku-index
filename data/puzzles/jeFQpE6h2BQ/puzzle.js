// Title: Overflow
// Author: TotallyNormalCat
// Video: https://www.youtube.com/watch?v=jeFQpE6h2BQ
// Source: https://app.crackingthecryptic.com/sudoku/t7dtdNmLDg

// Normal sudoku rules (default rows/cols/boxes, no givens). Twelve killer
// cages: digits sum to the corner clue and cannot repeat within a cage --
// matches Cage's native semantics exactly.

// Cage cells and totals transcribed from the drawn `cages` array.
const cages = [
  [37, 'R1C2', 'R1C3', 'R1C4', 'R2C2', 'R2C3', 'R3C2'],
  [8, 'R2C1', 'R3C1', 'R4C1'],
  [20, 'R1C6', 'R1C7', 'R1C8', 'R2C7'],
  [15, 'R2C8', 'R3C7', 'R3C8'],
  [19, 'R2C9', 'R3C9', 'R4C9'],
  [37, 'R4C5', 'R4C6', 'R4C7', 'R5C4', 'R5C5', 'R5C6'],
  [8, 'R6C4', 'R6C5', 'R7C4'],
  [23, 'R6C1', 'R6C2', 'R7C1', 'R7C2', 'R8C1'],
  [11, 'R7C9', 'R8C8', 'R8C9'],
  [20, 'R7C7', 'R7C8', 'R8C7'],
  [17, 'R8C6', 'R9C6', 'R9C7', 'R9C8'],
  [18, 'R8C3', 'R8C4', 'R9C2', 'R9C3', 'R9C4'],
];

return [
  new Shape('9x9'),
  ...cages.map(([sum, ...cells]) => new Cage(sum, ...cells)),
];
