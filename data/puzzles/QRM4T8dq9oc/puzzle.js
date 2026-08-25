// Title: Killer Sudoku
// Author: Guarav K. Jain
// Video: https://www.youtube.com/watch?v=QRM4T8dq9oc
// Source: https://app.crackingthecryptic.com/DGJbq8gmpF

// Normal sudoku rules apply. Cages (dashed outlines) forbid repeats and
// must sum to their printed total. Cell lists and totals below are
// transcribed from the drawn `cages` array; givens are separate `Given`s
// below and are not part of any cage.

return [
  new Shape('9x9'),

  new Given('R1C5', 5),
  new Given('R5C1', 8),
  new Given('R5C9', 9),
  new Given('R9C5', 6),

  new Cage(20, 'R1C2', 'R1C1', 'R2C1', 'R3C1', 'R4C1'),
  new Cage(14, 'R1C3', 'R1C4'),
  new Cage(10, 'R1C6', 'R1C7'),
  new Cage(20, 'R1C8', 'R1C9', 'R2C9', 'R3C9', 'R4C9'),
  new Cage(11, 'R2C2', 'R3C2'),
  new Cage(21, 'R2C3', 'R2C4', 'R2C5', 'R2C6', 'R2C7'),
  new Cage(13, 'R2C8', 'R3C8'),
  new Cage(20, 'R3C3', 'R3C4', 'R4C4'),
  new Cage(12, 'R3C5', 'R4C5'),
  new Cage(12, 'R3C7', 'R3C6', 'R4C6'),
  new Cage(27, 'R4C3', 'R4C2', 'R5C2', 'R6C2', 'R6C3'),
  new Cage(20, 'R6C1', 'R7C1', 'R8C1', 'R9C1', 'R9C2'),
  new Cage(11, 'R7C2', 'R8C2'),
  new Cage(9, 'R5C3', 'R5C4'),
  new Cage(27, 'R4C7', 'R4C8', 'R5C8', 'R6C8', 'R6C7'),
  new Cage(19, 'R6C9', 'R7C9', 'R8C9', 'R9C9', 'R9C8'),
  new Cage(13, 'R7C8', 'R8C8'),
  new Cage(10, 'R5C6', 'R5C7'),
  new Cage(14, 'R6C6', 'R7C6', 'R7C7'),
  new Cage(16, 'R6C5', 'R7C5'),
  new Cage(8, 'R6C4', 'R7C4', 'R7C3'),
  new Cage(23, 'R8C3', 'R8C4', 'R8C5', 'R8C6', 'R8C7'),
  new Cage(13, 'R9C3', 'R9C4'),
  new Cage(13, 'R9C6', 'R9C7'),
];
