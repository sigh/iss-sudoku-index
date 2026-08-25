// Title: Killer Sudoku
// Author: Unknown
// Video: https://www.youtube.com/watch?v=uF0KAvpIEPU
// Source: https://sudokupad.app/gTrgrHjmf3

// Normal sudoku rules apply. Digits in cages may not repeat and must sum to
// the total given. Cell lists and totals below are from the drawn `cages`
// array; all 23 cages partition the 81 cells exactly once.

return [
  new Shape('9x9'),

  new Cage(15, 'R1C1', 'R1C2', 'R2C1'),
  new Cage(24, 'R2C2', 'R3C1', 'R3C2', 'R4C1', 'R4C2'),
  new Cage(6, 'R5C1', 'R6C1', 'R7C1'),
  new Cage(35, 'R6C2', 'R7C2', 'R8C1', 'R8C2', 'R9C1'),
  new Cage(16, 'R1C3', 'R2C3', 'R3C3', 'R3C4'),
  new Cage(10, 'R1C4', 'R1C5'),
  new Cage(24, 'R2C4', 'R2C5', 'R3C5', 'R4C5'),
  new Cage(30, 'R4C3', 'R5C2', 'R5C3', 'R6C3'),
  new Cage(30, 'R4C4', 'R4C6', 'R5C4', 'R5C5', 'R5C6', 'R6C4', 'R6C6'),
  new Cage(10, 'R7C3', 'R7C4'),
  new Cage(10, 'R8C3', 'R8C4'),
  new Cage(16, 'R9C2', 'R9C3', 'R9C4'),
  new Cage(15, 'R6C5', 'R7C5', 'R8C5', 'R8C6'),
  new Cage(6, 'R9C5', 'R9C6'),
  new Cage(26, 'R7C6', 'R7C7', 'R8C7', 'R9C7'),
  new Cage(17, 'R4C7', 'R5C7', 'R5C8', 'R6C7'),
  new Cage(9, 'R1C6', 'R1C7', 'R1C8'),
  new Cage(15, 'R2C6', 'R2C7'),
  new Cage(13, 'R3C6', 'R3C7'),
  new Cage(28, 'R1C9', 'R2C8', 'R2C9', 'R3C8', 'R4C8'),
  new Cage(14, 'R3C9', 'R4C9', 'R5C9'),
  new Cage(25, 'R6C8', 'R6C9', 'R7C8', 'R7C9', 'R8C8'),
  new Cage(11, 'R8C9', 'R9C8', 'R9C9'),
];
