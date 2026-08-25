// Title: Killer Sudoku
// Author: Unknown
// Video: https://www.youtube.com/watch?v=TddbR3rcpZQ
// Source: https://sudokupad.app/TBDDRMq9Qh

// Normal sudoku rules apply (default row/column/box all-different, no
// givens). 24 killer cages: digits in a cage sum to its total and cannot
// repeat within the cage (Cage enforces both). Cage cell lists transcribed
// from the drawn cage outlines, 1-indexed R/C.
return [
  new Shape('9x9'),

  new Cage(17, 'R1C1', 'R2C1', 'R1C2', 'R1C3'),
  new Cage(12, 'R3C1', 'R4C1'),
  new Cage(14, 'R5C1', 'R6C1', 'R7C1'),
  new Cage(29, 'R9C1', 'R8C1', 'R8C2', 'R7C2'),
  new Cage(21, 'R2C2', 'R3C2', 'R3C3', 'R3C4'),
  new Cage(12, 'R2C3', 'R2C4'),
  new Cage(27, 'R1C4', 'R1C5', 'R2C5', 'R2C6', 'R3C6', 'R3C5'),
  new Cage(28, 'R1C6', 'R1C7', 'R1C8', 'R1C9', 'R2C7', 'R3C7'),
  new Cage(26, 'R2C8', 'R2C9', 'R3C9', 'R3C8'),
  new Cage(19, 'R4C2', 'R5C2', 'R5C3', 'R4C3'),
  new Cage(10, 'R6C2', 'R6C3'),
  new Cage(15, 'R6C4', 'R7C4', 'R7C3', 'R8C3'),
  new Cage(7, 'R9C2', 'R9C3'),
  new Cage(10, 'R9C4', 'R9C5'),
  new Cage(19, 'R8C4', 'R8C5', 'R8C6', 'R9C6'),
  new Cage(26, 'R5C4', 'R5C5', 'R6C5', 'R7C5'),
  new Cage(13, 'R4C4', 'R4C5'),
  new Cage(13, 'R4C6', 'R4C7', 'R4C8', 'R4C9'),
  new Cage(20, 'R5C6', 'R5C7', 'R5C8', 'R5C9'),
  new Cage(22, 'R6C6', 'R6C7', 'R7C7', 'R7C6'),
  new Cage(8, 'R6C8', 'R6C9'),
  new Cage(22, 'R7C9', 'R7C8', 'R8C8', 'R8C7'),
  new Cage(6, 'R9C7', 'R9C8'),
  new Cage(9, 'R8C9', 'R9C9'),
];
