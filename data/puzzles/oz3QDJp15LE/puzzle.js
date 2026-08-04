// Title: Killer Sudoku
// Author: Astral Sky
// Video: https://www.youtube.com/watch?v=oz3QDJp15LE
// Source: https://app.crackingthecryptic.com/sudoku/Qp3bDLgqrj

// Normal sudoku rules (rows, columns, boxes) apply. Each cage's digits must
// not repeat and must sum to the cage's total. Cages transcribed from the
// payload's `cages` array (drawn dashed outlines), row/col 0-indexed there.

return [
  new Shape('9x9'),

  new Cage(27, 'R3C5', 'R4C4', 'R4C5', 'R4C6'),
  new Cage(27, 'R6C4', 'R6C5', 'R6C6', 'R7C5'),
  new Cage(16, 'R4C7', 'R5C6', 'R5C7', 'R5C8', 'R6C7'),
  new Cage(17, 'R4C3', 'R5C2', 'R5C3', 'R5C4', 'R6C3'),
  new Cage(11, 'R1C5', 'R2C5'),
  new Cage(10, 'R1C4', 'R2C2', 'R2C3', 'R2C4'),
  new Cage(15, 'R1C6', 'R2C6', 'R2C7', 'R2C8'),
  new Cage(13, 'R8C1', 'R9C1'),
  new Cage(11, 'R8C9', 'R9C9'),
  new Cage(30, 'R7C4', 'R7C6', 'R8C3', 'R8C4', 'R8C5', 'R8C6', 'R8C7'),
];
