// Title: Daily Killer Sudoku 18575
// Author: dailykillersudoku.com
// Video: https://www.youtube.com/watch?v=EzSvc32paNQ
// Source: https://www.dailykillersudoku.com/puzzle/18575

// Killer Sudoku. Rules: "Normal killer sudoku rules apply: digits may not
// repeat in a cage, and a cage with a printed total sums to it."
// Standard 9x9 rows, columns and 3x3 boxes are the engine baseline. No givens.
// 25 cages partition the grid; every one carries a printed total (they sum
// to 405 = 9 x 45), so each is one Cage: sum plus no-repeat. Nothing is omitted.
//
// Cage table: the source's cage map, in its own cage-id order, using its
// printed 1-9 row/column numbering.

return [
  new Shape('9x9'),

  new Cage(18, 'R1C1', 'R1C2', 'R2C1', 'R3C1'),
  new Cage(13, 'R1C3', 'R1C4'),
  new Cage(5, 'R1C5', 'R1C6'),
  new Cage(6, 'R1C7', 'R1C8'),
  new Cage(9, 'R2C3', 'R2C4'),
  new Cage(20, 'R2C5', 'R2C6', 'R2C7'),
  new Cage(17, 'R1C9', 'R2C9', 'R3C9'),
  new Cage(19, 'R2C2', 'R3C2', 'R3C3', 'R3C4'),
  new Cage(27, 'R3C5', 'R3C6', 'R3C7', 'R4C6', 'R4C7'),
  new Cage(39, 'R2C8', 'R3C8', 'R4C8', 'R5C8', 'R6C8', 'R7C8', 'R8C8'),
  new Cage(17, 'R4C2', 'R4C3', 'R4C4', 'R4C5'),
  new Cage(23, 'R4C1', 'R5C1', 'R6C1'),
  new Cage(11, 'R5C2', 'R5C3'),
  new Cage(18, 'R5C4', 'R5C5', 'R5C6', 'R5C7'),
  new Cage(10, 'R4C9', 'R5C9', 'R6C9'),
  new Cage(14, 'R6C2', 'R6C3', 'R6C4', 'R6C5'),
  new Cage(20, 'R7C2', 'R7C3', 'R7C4', 'R8C2'),
  new Cage(27, 'R6C6', 'R6C7', 'R7C5', 'R7C6', 'R7C7'),
  new Cage(7, 'R8C3', 'R8C4'),
  new Cage(23, 'R8C5', 'R8C6', 'R8C7'),
  new Cage(18, 'R7C9', 'R8C9', 'R9C9'),
  new Cage(21, 'R7C1', 'R8C1', 'R9C1', 'R9C2'),
  new Cage(7, 'R9C3', 'R9C4'),
  new Cage(13, 'R9C5', 'R9C6'),
  new Cage(3, 'R9C7', 'R9C8'),
];
