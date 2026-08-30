// Title: 'Ridiculous' Killer Sudoku
// Author: Unknown
// Video: https://www.youtube.com/watch?v=DWfCaAPt5CE
// Source: https://cracking-the-cryptic.web.app/sudoku/gPbDBMNM7T

// Normal sudoku rules (default rows/cols/boxes). Twenty-three killer cages
// (Cage enforces both distinct digits and the sum). The payload carries no
// metadata.rules text and no givens -- a pure killer sudoku over the drawn
// cages, which cover all 81 cells with no overlaps.

// Cage cells and totals transcribed from the drawn `cages` array.
const cages = [
  [8, 'R1C1', 'R1C2'],
  [6, 'R1C3', 'R1C4'],
  [30, 'R1C5', 'R1C6', 'R2C6', 'R2C5', 'R2C4', 'R3C4'],
  [18, 'R3C5', 'R3C7', 'R3C6'],
  [33, 'R1C7', 'R2C7', 'R1C8', 'R2C8', 'R1C9', 'R2C9', 'R3C8'],
  [13, 'R3C9', 'R4C9', 'R4C8'],
  [21, 'R2C1', 'R3C1', 'R3C2'],
  [10, 'R2C2', 'R2C3'],
  [17, 'R3C3', 'R4C3', 'R5C3', 'R4C2', 'R4C4'],
  [14, 'R4C1', 'R5C1', 'R5C2'],
  [17, 'R4C5', 'R4C6', 'R4C7'],
  [18, 'R5C4', 'R5C5', 'R5C6'],
  [24, 'R5C7', 'R6C7', 'R7C7', 'R6C6', 'R6C8'],
  [21, 'R5C8', 'R5C9', 'R6C9'],
  [14, 'R7C8', 'R7C9', 'R8C9'],
  [10, 'R9C8', 'R9C9'],
  [8, 'R8C8', 'R8C7'],
  [15, 'R9C7', 'R9C6'],
  [30, 'R7C6', 'R8C6', 'R8C5', 'R9C5', 'R8C4', 'R9C4'],
  [9, 'R6C5', 'R6C4', 'R6C3'],
  [18, 'R6C1', 'R7C1', 'R6C2'],
  [17, 'R7C3', 'R7C4', 'R7C5'],
  [34, 'R7C2', 'R8C2', 'R8C1', 'R9C1', 'R9C2', 'R9C3', 'R8C3'],
];

return [
  new Shape('9x9'),
  ...cages.map(([sum, ...cells]) => new Cage(sum, ...cells)),
];
