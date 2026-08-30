// Title: Killer X Sudoku
// Author: Phistomefel
// Video: https://www.youtube.com/watch?v=AcsMMQaqRYc
// Source: https://cracking-the-cryptic.web.app/sudoku/GBTtJ6BnqP

// Normal sudoku rules apply (standard 3x3 boxes, no givens). Killer cages:
// distinct digits, sum to the printed total. Both main diagonals also
// contain each digit 1-9 once (the "X" of Killer X Sudoku).

// Cages: cells and totals from the payload's cages array.
const cages = [
  new Cage(15, 'R1C1', 'R1C2', 'R2C2', 'R3C2', 'R3C3'),
  new Cage(14, 'R1C4', 'R1C5', 'R1C6'),
  new Cage(14, 'R2C5', 'R2C6'),
  new Cage(12, 'R1C7', 'R2C7', 'R1C8'),
  new Cage(12, 'R2C9', 'R3C9', 'R3C8'),
  new Cage(12, 'R4C1', 'R4C2', 'R5C2'),
  new Cage(13, 'R5C3', 'R6C3'),
  new Cage(30, 'R5C4', 'R6C4', 'R6C5', 'R5C5', 'R4C5', 'R4C6', 'R5C6'),
  new Cage(14, 'R5C7', 'R5C8', 'R5C9'),
  new Cage(26, 'R7C1', 'R8C1', 'R9C1', 'R8C2'),
  new Cage(11, 'R7C2', 'R7C3', 'R7C4'),
  new Cage(16, 'R7C7', 'R7C8', 'R8C8', 'R8C9', 'R9C9'),
];

return [
  new Shape('9x9'),

  ...cages,

  // '\'-oriented diagonal R1C1-R2C2-...-R9C9.
  new Diagonal(-1),
  // '/'-oriented diagonal R1C9-R2C8-...-R9C1.
  new Diagonal(1),
];
