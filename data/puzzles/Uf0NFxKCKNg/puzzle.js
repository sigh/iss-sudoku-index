// Title: Boardwalk by the Sea
// Author: Secret Santa
// Video: https://www.youtube.com/watch?v=Uf0NFxKCKNg
// Source: https://app.crackingthecryptic.com/sudoku/L4nTpntDrF

// Standard sudoku (rows, columns, and the default nine 3x3 boxes). No
// givens. 17 sum cages: digits inside a cage do not repeat and sum to the
// cage's printed total, per the puzzle's own rules text. Cells not covered
// by any cage carry no cage constraint.

return [
  new Shape('9x9'),

  new Cage(12, 'R2C1', 'R3C1', 'R4C1'),
  new Cage(20, 'R3C2', 'R4C2', 'R5C2'),
  new Cage(7, 'R2C3', 'R3C3', 'R4C3'),
  new Cage(13, 'R3C4', 'R4C4', 'R5C4'),
  new Cage(6, 'R2C5', 'R3C5', 'R4C5'),
  new Cage(15, 'R3C6', 'R4C6', 'R5C6'),
  new Cage(6, 'R2C7', 'R3C7', 'R4C7'),
  new Cage(21, 'R3C8', 'R4C8', 'R5C8'),
  new Cage(15, 'R2C9', 'R3C9', 'R4C9'),
  new Cage(11, 'R6C9', 'R7C9'),
  new Cage(15, 'R6C7', 'R7C7'),
  new Cage(16, 'R6C5', 'R7C5'),
  new Cage(14, 'R6C3', 'R7C3'),
  new Cage(9, 'R6C1', 'R7C1'),
  new Cage(18, 'R9C1', 'R9C2', 'R9C3'),
  new Cage(15, 'R9C4', 'R9C5', 'R9C6'),
  new Cage(12, 'R9C7', 'R9C8', 'R9C9'),
];
