// Title: A Real Killer of a Puzzle
// Author: Unknown
// Video: https://www.youtube.com/watch?v=_I9vyHB8--8
// Source: https://cracking-the-cryptic.web.app/sudoku/PGqb3j93bh

// Normal sudoku rules apply. Killer rules (from the video description): each
// cage sums to the printed total using distinct digits. Cages cover 49 of the
// 81 cells; the other 32 cells carry no cage and no rule beyond row/col/box.

return [
  new Shape('9x9'),

  // Cages: cell lists and totals transcribed from the drawn `cages` array.
  new Cage(23, 'R2C2', 'R2C3', 'R3C2'),
  new Cage(12, 'R2C4', 'R2C5', 'R2C6', 'R3C5'),
  new Cage(18, 'R2C7', 'R2C8', 'R3C8'),
  new Cage(26, 'R4C8', 'R5C7', 'R5C8', 'R6C8'),
  new Cage(17, 'R3C6', 'R3C7', 'R4C6', 'R4C7'),
  new Cage(16, 'R4C5', 'R5C4', 'R5C5', 'R5C6', 'R6C5'),
  new Cage(11, 'R3C3', 'R3C4', 'R4C3', 'R4C4'),
  new Cage(15, 'R4C2', 'R5C2', 'R5C3', 'R6C2'),
  new Cage(23, 'R6C3', 'R6C4', 'R7C3', 'R7C4'),
  new Cage(29, 'R6C6', 'R6C7', 'R7C6', 'R7C7'),
  new Cage(8, 'R7C8', 'R8C7', 'R8C8'),
  new Cage(22, 'R7C5', 'R8C4', 'R8C5', 'R8C6'),
  new Cage(13, 'R7C2', 'R8C2', 'R8C3'),
];
