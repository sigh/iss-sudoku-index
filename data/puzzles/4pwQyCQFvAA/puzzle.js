// Title: From Pillar to Post
// Author: Mr.Menace
// Video: https://www.youtube.com/watch?v=4pwQyCQFvAA
// Source: https://app.crackingthecryptic.com/b8BGpH9Nrj

// Encode normal 9x9 Sudoku, non-repeating killer cages, and both marked
// diagonals. The cage table is transcribed from the outlined cages and totals.
return [
  new Shape('9x9'),
  new Cage(23, 'R5C1', 'R5C2', 'R5C3', 'R5C4', 'R6C4'),
  new Cage(23, 'R4C6', 'R5C6', 'R5C7', 'R5C8', 'R5C9'),
  new Cage(27, 'R1C5', 'R2C5', 'R3C5', 'R4C4', 'R4C5'),
  new Cage(27, 'R6C5', 'R6C6', 'R7C5', 'R8C5', 'R9C5'),
  new Cage(9, 'R7C1', 'R7C2', 'R8C1'),
  new Cage(7, 'R1C7', 'R1C8', 'R2C7'),
  new Cage(20, 'R2C2', 'R2C3', 'R3C3'),
  new Cage(13, 'R4C1', 'R4C2'),
  new Cage(21, 'R7C7', 'R8C7', 'R8C8'),
  new Cage(13, 'R8C6', 'R9C6'),
  new Cage(9, 'R6C8', 'R6C9'),
  new Cage(11, 'R2C4', 'R3C4'),
  new Diagonal(-1),
  new Diagonal(1),
];
