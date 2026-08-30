// Title: unknown
// Author: Unknown
// Video: https://www.youtube.com/watch?v=Be_dJxde06g
// Source: https://cracking-the-cryptic.web.app/sudoku/DLTd26TLPh

// Killer Sudoku, no givens. Normal sudoku rules apply (default row/column/box
// all-different). The 18 cages below tile the entire grid; digits in a cage
// sum to the printed total and do not repeat within the cage.

// Cages: cells and totals from the payload's cages array (fully tiles the
// grid, no leftover cells).
const cages = [
  new Cage(40, 'R1C1', 'R1C2', 'R1C3', 'R1C4', 'R1C5', 'R2C1', 'R3C1', 'R4C1'),
  new Cage(36, 'R1C6', 'R1C7', 'R1C8', 'R1C9', 'R2C9', 'R3C9', 'R4C9', 'R5C9'),
  new Cage(27, 'R6C6', 'R6C7', 'R6C8', 'R6C9'),
  new Cage(7, 'R7C8', 'R7C9'),
  new Cage(32, 'R8C9', 'R9C5', 'R9C6', 'R9C7', 'R9C8', 'R9C9'),
  new Cage(38, 'R5C1', 'R6C1', 'R7C1', 'R8C1', 'R9C1', 'R9C2', 'R9C3', 'R9C4'),
  new Cage(28, 'R2C2', 'R2C3', 'R2C4', 'R2C5', 'R2C6', 'R2C7'),
  new Cage(22, 'R3C2', 'R4C2', 'R5C2', 'R6C2', 'R7C2', 'R8C2'),
  new Cage(24, 'R3C3', 'R3C4', 'R3C5', 'R3C6'),
  new Cage(24, 'R3C7', 'R4C7', 'R5C7'),
  new Cage(12, 'R2C8', 'R3C8', 'R4C8', 'R5C8'),
  new Cage(22, 'R4C3', 'R5C3', 'R6C3', 'R7C3'),
  new Cage(25, 'R8C3', 'R8C4', 'R8C5', 'R8C6', 'R8C7', 'R8C8'),
  new Cage(30, 'R7C4', 'R7C5', 'R7C6', 'R7C7'),
  new Cage(10, 'R5C4', 'R6C4'),
  new Cage(17, 'R5C5', 'R6C5'),
  new Cage(5, 'R4C4', 'R4C5'),
  new Cage(6, 'R4C6', 'R5C6'),
];

return [
  new Shape('9x9'),

  ...cages,
];
