// Title: Killer Sudoku
// Author: William Andrew
// Video: https://www.youtube.com/watch?v=jTA6nPhxfPI
// Source: https://cracking-the-cryptic.web.app/sudoku/nnJpBtm9QP

// Normal sudoku rules apply. No givens. 23 killer cages tile the grid
// exactly: digits within a cage do not repeat and sum to the printed total.

// Cages: cells and totals from the payload's cages array.
const cages = [
  new Cage(36, 'R1C1', 'R2C1', 'R3C1', 'R4C1', 'R3C2', 'R2C2', 'R1C2'),
  new Cage(11, 'R1C3', 'R2C3'),
  new Cage(15, 'R1C4', 'R2C4'),
  new Cage(15, 'R2C5', 'R1C5', 'R1C6', 'R1C7'),
  new Cage(17, 'R1C8', 'R2C8'),
  new Cage(19, 'R1C9', 'R2C9', 'R3C9', 'R3C8'),
  new Cage(10, 'R2C7', 'R3C7', 'R2C6'),
  new Cage(6, 'R3C6', 'R3C5'),
  new Cage(9, 'R3C4', 'R3C3'),
  new Cage(24, 'R4C2', 'R4C3', 'R4C4', 'R4C5'),
  new Cage(23, 'R4C6', 'R4C7', 'R4C8', 'R4C9', 'R5C9'),
  new Cage(18, 'R6C1', 'R5C1', 'R5C2', 'R5C3'),
  new Cage(29, 'R5C4', 'R5C5', 'R5C6', 'R5C7', 'R5C8'),
  new Cage(15, 'R6C2', 'R6C3', 'R6C4'),
  new Cage(13, 'R6C5', 'R6C6', 'R6C7'),
  new Cage(19, 'R6C8', 'R6C9', 'R7C9'),
  new Cage(8, 'R7C1', 'R8C1'),
  new Cage(28, 'R9C2', 'R8C2', 'R7C2', 'R9C1', 'R7C3', 'R7C4'),
  new Cage(22, 'R8C3', 'R9C3', 'R8C4', 'R9C4'),
  new Cage(24, 'R7C5', 'R8C5', 'R9C5', 'R8C6', 'R7C6'),
  new Cage(12, 'R9C6', 'R9C7'),
  new Cage(18, 'R8C7', 'R7C7', 'R7C8'),
  new Cage(14, 'R8C8', 'R9C8', 'R9C9', 'R8C9'),
];

return [
  new Shape('9x9'),

  ...cages,
];
