// Title: Another Mismatch
// Author: Cane_Puzzles
// Video: https://www.youtube.com/watch?v=EwD7nGK6Elc
// Source: https://sudokupad.app/jzrbr86s3n

// Standard Sudoku with a three-cell renban line and six killer cages.
const givens = [
  new Given('R1C1', 9),
  new Given('R1C4', 6),
  new Given('R4C1', 3),
  new Given('R4C3', 6),
  new Given('R6C5', 9),
  new Given('R6C9', 3),
  new Given('R7C6', 3),
  new Given('R7C7', 8),
  new Given('R9C6', 6),
];

const killerCages = [
  new Cage(27, 'R5C3', 'R6C3', 'R6C4', 'R7C4', 'R7C5'),
  new Cage(6, 'R5C7', 'R5C8'),
  new Cage(3, 'R1C5', 'R2C5'),
  new Cage(9, 'R2C7', 'R2C8', 'R3C8'),
  new Cage(10, 'R7C8', 'R8C7', 'R8C8'),
  new Cage(9, 'R7C2', 'R8C2', 'R8C3'),
];

return [
  new Shape('9x9'),
  ...givens,
  ...killerCages,
  new Renban('R2C3', 'R2C2', 'R3C2'),
];
