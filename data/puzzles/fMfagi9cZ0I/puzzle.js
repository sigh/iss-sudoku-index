// Title: Eiger
// Author: Qodec
// Video: https://www.youtube.com/watch?v=fMfagi9cZ0I
// Source: https://sudokupad.app/fffPBhPDtG

// Normal Sudoku rules apply. Each outlined cage has its drawn total and distinct digits.
// Cage cells and totals are transcribed from the source's outlined cages.
return [
  new Shape('9x9'),
  new Cage(45, 'R6C1', 'R6C2', 'R7C1', 'R8C1', 'R8C4', 'R9C1', 'R9C2', 'R9C3', 'R9C4'),
  new Cage(45, 'R1C6', 'R1C7', 'R1C8', 'R1C9', 'R2C6', 'R2C9', 'R3C9', 'R4C8', 'R4C9'),
  new Cage(15, 'R1C1', 'R1C2', 'R2C1'),
  new Cage(5, 'R1C3', 'R1C4'),
  new Cage(5, 'R3C1', 'R4C1'),
  new Cage(13, 'R7C2', 'R7C3'),
  new Cage(13, 'R8C2', 'R8C3'),
  new Cage(8, 'R7C8', 'R8C8'),
  new Cage(13, 'R7C7', 'R8C7'),
  new Cage(13, 'R2C7', 'R2C8'),
  new Cage(13, 'R3C7', 'R3C8'),
  new Cage(27, 'R1C5', 'R2C5', 'R3C5', 'R4C5', 'R4C6'),
  new Cage(27, 'R6C4', 'R6C5', 'R7C5', 'R8C5', 'R9C5'),
  new Cage(23, 'R5C6', 'R5C7', 'R5C8', 'R5C9', 'R6C6'),
  new Cage(23, 'R4C4', 'R5C1', 'R5C2', 'R5C3', 'R5C4'),
];
