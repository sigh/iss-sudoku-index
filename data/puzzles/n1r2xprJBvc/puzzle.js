// Title: Blackjack
// Author: Blashyrkh
// Video: https://www.youtube.com/watch?v=n1r2xprJBvc
// Source: https://app.crackingthecryptic.com/sudoku/ghBJJQ3L4g

// Normal sudoku rules apply (default 9x9 grid, rows/columns/3x3 boxes all
// different). Digits in cages do not repeat and sum to the number indicated
// (Cage: distinct + sum).

return [
  new Shape('9x9'),
  new Given('R9C8', 8),

  new Cage(14, 'R2C1', 'R3C1'),
  new Cage(6, 'R1C2', 'R1C3'),
  new Cage(11, 'R3C3', 'R3C4'),
  new Cage(21, 'R1C6', 'R2C6', 'R3C6'),
  new Cage(21, 'R4C7', 'R4C8', 'R4C9'),
  new Cage(21, 'R7C4', 'R8C4', 'R9C4'),
  new Cage(21, 'R6C1', 'R6C2', 'R6C3'),
  // Plus-shaped pentomino centred on R5C5.
  new Cage(24, 'R4C5', 'R5C4', 'R5C5', 'R5C6', 'R6C5'),
  new Cage(11, 'R1C9', 'R2C9'),
  new Cage(6, 'R1C7', 'R2C7'),
  new Cage(14, 'R3C7', 'R3C8'),
  new Cage(6, 'R7C3', 'R8C3'),
  new Cage(6, 'R8C8', 'R8C9'),
  new Cage(13, 'R6C7', 'R7C7'),
];
