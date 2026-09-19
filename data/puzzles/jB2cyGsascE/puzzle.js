// Title: Daily Killer Sudoku 18731
// Author: dailykillersudoku.com
// Video: https://www.youtube.com/watch?v=jB2cyGsascE
// Source: https://www.dailykillersudoku.com/puzzle/18731

// Normal sudoku (default row/col/box AllDifferent). Killer cages: digits may
// not repeat in a cage, and every cage here has a printed total to sum to.
// No givens, no other clues.

// Cages: cells and totals as printed on the source's killer grid (25 cages,
// a full partition of the 81 cells).
const cages = [
  new Cage(23, 'R1C3', 'R1C4', 'R1C5', 'R2C5'),  // cage 1
  new Cage(13, 'R1C8', 'R1C9'),  // cage 2
  new Cage(16, 'R1C1', 'R1C2', 'R2C1'),  // cage 3
  new Cage(12, 'R1C6', 'R2C6'),  // cage 4
  new Cage(11, 'R1C7', 'R2C7'),  // cage 5
  new Cage(21, 'R2C2', 'R2C3', 'R2C4', 'R3C2', 'R4C2'),  // cage 6
  new Cage(24, 'R3C5', 'R3C6', 'R3C7', 'R4C7', 'R4C8'),  // cage 7
  new Cage(11, 'R2C8', 'R3C8'),  // cage 8
  new Cage(9, 'R2C9', 'R3C9', 'R4C9'),  // cage 9
  new Cage(15, 'R3C1', 'R4C1', 'R5C1', 'R5C2'),  // cage 10
  new Cage(12, 'R3C3', 'R3C4', 'R4C3'),  // cage 11
  new Cage(43, 'R4C4', 'R4C5', 'R4C6', 'R5C4', 'R5C5', 'R5C6', 'R6C4', 'R6C5'),  // cage 12
  new Cage(16, 'R5C7', 'R5C8'),  // cage 13
  new Cage(11, 'R6C1', 'R6C2'),  // cage 14
  new Cage(29, 'R5C3', 'R6C3', 'R7C3', 'R7C4', 'R8C4'),  // cage 15
  new Cage(11, 'R5C9', 'R6C9'),  // cage 16
  new Cage(14, 'R7C1', 'R7C2'),  // cage 17
  new Cage(12, 'R6C6', 'R6C7', 'R7C6', 'R7C7'),  // cage 18
  new Cage(20, 'R6C8', 'R7C8', 'R8C6', 'R8C7', 'R8C8'),  // cage 19
  new Cage(8, 'R8C2', 'R8C3'),  // cage 20
  new Cage(16, 'R7C5', 'R8C5'),  // cage 21
  new Cage(9, 'R8C1', 'R9C1'),  // cage 22
  new Cage(11, 'R9C2', 'R9C3', 'R9C4'),  // cage 23
  new Cage(5, 'R9C5', 'R9C6'),  // cage 24
  new Cage(33, 'R7C9', 'R8C9', 'R9C7', 'R9C8', 'R9C9'),  // cage 25
];

return [
  new Shape('9x9'),
  ...cages,
];
