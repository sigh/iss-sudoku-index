// Title: Tough Test for a PhD
// Author: Unknown
// Video: https://www.youtube.com/watch?v=-O-GuYM7ZKY
// Source: https://cracking-the-cryptic.web.app/sudoku/3799RJ8H3L

// Killer Sudoku: normal sudoku rules (default row/column/box all-different,
// no givens), plus 24 non-overlapping cages covering the full grid, each
// with a sum total and a within-cage all-different requirement ("show the
// sum of their (non-repeating) digits"). Cage cells transcribed from the
// payload's `cages` array (0-indexed [row, col] pairs, converted to R#C#).

return [
  new Shape('9x9'),

  new Cage(20, 'R1C1', 'R1C2', 'R2C1', 'R3C1'),
  new Cage(8, 'R2C2', 'R3C2'),
  new Cage(9, 'R1C3', 'R1C4'),
  new Cage(30, 'R2C3', 'R2C4', 'R3C3', 'R3C4', 'R4C4'),
  new Cage(13, 'R1C5', 'R1C6'),
  new Cage(11, 'R2C5', 'R2C6'),
  new Cage(38, 'R1C7', 'R1C8', 'R1C9', 'R2C7', 'R2C8', 'R2C9', 'R3C8', 'R3C9'),
  new Cage(20, 'R3C5', 'R4C5', 'R4C6', 'R5C6', 'R5C7'),
  new Cage(11, 'R3C6', 'R3C7', 'R4C7'),
  new Cage(25, 'R4C1', 'R4C2', 'R4C3', 'R5C1'),
  new Cage(14, 'R4C8', 'R5C8'),
  new Cage(11, 'R4C9', 'R5C9'),
  new Cage(10, 'R5C2', 'R6C2'),
  new Cage(24, 'R5C3', 'R5C4', 'R5C5', 'R6C5', 'R7C5'),
  new Cage(6, 'R6C1', 'R7C1'),
  new Cage(14, 'R6C3', 'R6C4', 'R7C3', 'R7C4'),
  new Cage(33, 'R7C2', 'R8C1', 'R8C2', 'R8C3', 'R9C1', 'R9C2'),
  new Cage(17, 'R9C3', 'R9C4'),
  new Cage(9, 'R8C4', 'R8C5'),
  new Cage(15, 'R7C6', 'R8C6', 'R9C5', 'R9C6'),
  new Cage(32, 'R6C6', 'R6C7', 'R6C8', 'R7C7', 'R7C8'),
  new Cage(10, 'R6C9', 'R7C9'),
  new Cage(12, 'R8C7', 'R8C8'),
  new Cage(13, 'R8C9', 'R9C7', 'R9C8', 'R9C9'),
];
