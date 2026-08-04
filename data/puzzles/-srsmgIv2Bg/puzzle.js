// Title: Ravine
// Author: Jay Dyer
// Video: https://www.youtube.com/watch?v=-srsmgIv2Bg
// Source: https://app.crackingthecryptic.com/sudoku/9rHL7JpG6B

// Normal sudoku rules apply (default row/column/box all-different, no
// givens). 10 killer cages: digits in a cage sum to its total and cannot
// repeat within the cage (Cage enforces both). Cage cell lists transcribed
// from the drawn cage outlines, 1-indexed R/C.
return [
  new Shape('9x9'),

  new Cage(23, 'R1C1', 'R1C2', 'R2C1'),
  new Cage(7, 'R8C9', 'R9C8', 'R9C9'),
  new Cage(9, 'R2C3', 'R3C2', 'R3C3'),
  new Cage(24, 'R7C7', 'R7C8', 'R8C7'),
  new Cage(42, 'R1C4', 'R2C4', 'R3C4', 'R4C1', 'R4C2', 'R4C3', 'R4C4'),
  new Cage(28, 'R6C6', 'R6C7', 'R6C8', 'R6C9', 'R7C6', 'R8C6', 'R9C6'),
  new Cage(9, 'R4C9', 'R5C8', 'R5C9'),
  new Cage(21, 'R5C1', 'R5C2', 'R6C1'),
  new Cage(15, 'R1C5', 'R1C6', 'R2C5'),
  new Cage(13, 'R8C5', 'R9C4', 'R9C5'),
];
