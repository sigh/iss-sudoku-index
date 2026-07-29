// Title: Killer Sudoku Storm
// Author: Jeremy Butler (quarterthru)
// Video: https://www.youtube.com/watch?v=2addt8v7IuA
// Source: https://app.crackingthecryptic.com/rghovwpref

// Normal Sudoku rules apply. Each listed killer cage has the displayed sum
// and contains no repeated digit.
const cages = [
  // Cage totals and cells transcribed from the drawn killer cages.
  new Cage(7, 'R3C8', 'R3C9'),
  new Cage(21, 'R1C5', 'R1C6', 'R2C6'),
  new Cage(9, 'R8C4', 'R9C4', 'R9C5'),
  new Cage(13, 'R7C1', 'R7C2'),
  new Cage(19, 'R7C7', 'R7C8', 'R7C9'),
  new Cage(11, 'R3C1', 'R3C2', 'R3C3'),
  new Cage(17, 'R1C8', 'R2C7', 'R2C8', 'R3C7'),
  new Cage(14, 'R4C2', 'R5C2'),
  new Cage(6, 'R5C8', 'R6C8'),
  new Cage(23, 'R7C3', 'R8C2', 'R8C3', 'R9C2'),
  new Cage(24, 'R4C5', 'R5C4', 'R5C5', 'R5C6', 'R6C5'),
  new Cage(10, 'R5C1', 'R6C1', 'R6C2'),
  new Cage(20, 'R4C8', 'R4C9', 'R5C9'),
];

return [
  new Shape('9x9'),
  ...cages,
];
