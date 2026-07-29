// Title: Square Dance
// Author: Jay Dyer
// Video: https://www.youtube.com/watch?v=AwzDRqTx0tU
// Source: https://sudokupad.app/x48q45yg2r

// Normal sudoku rules apply (default row/column/box all-different, no givens).
// Killer-cage digits do not repeat and sum to the indicated total.

return [
  new Shape('9x9'),

  // Killer cages -- cells and totals as drawn.
  new Cage(21, 'R1C3', 'R1C4', 'R2C4'),
  new Cage(21, 'R3C4', 'R4C3', 'R4C4'),
  new Cage(21, 'R3C1', 'R4C1', 'R4C2'),
  new Cage(21, 'R8C2', 'R8C3', 'R8C4'),
  new Cage(21, 'R2C8', 'R3C8', 'R4C8'),
  new Cage(9, 'R5C6', 'R5C7', 'R6C7'),
  new Cage(18, 'R9C3', 'R9C4', 'R9C5'),
  new Cage(10, 'R8C1', 'R9C1'),
  new Cage(10, 'R8C7', 'R9C7'),
  new Cage(11, 'R8C9', 'R9C9'),
  new Cage(12, 'R6C5', 'R7C5', 'R7C6'),
  new Cage(11, 'R5C3', 'R6C3'),
  new Cage(12, 'R1C1', 'R1C2', 'R2C1'),
  new Cage(5, 'R3C5', 'R3C6'),
];
