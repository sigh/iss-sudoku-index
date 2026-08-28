// Title: Unknown
// Author: Unknown
// Video: https://www.youtube.com/watch?v=7NCwxiK3ub8
// Source: https://cracking-the-cryptic.web.app/sudoku/bNTRBN4PRb

// Plain classic sudoku: normal sudoku rules apply, standard nine 3x3 box
// regions (default), and no other clues. Row, column, and box all-different
// come from the default Shape('9x9').
return [
  new Shape('9x9'),
  new Given('R1C2', 8),
  new Given('R1C4', 5),
  new Given('R2C5', 3),
  new Given('R2C7', 2),
  new Given('R3C3', 9),
  new Given('R3C5', 2),
  new Given('R3C7', 7),
  new Given('R4C3', 7),
  new Given('R4C9', 6),
  new Given('R5C2', 4),
  new Given('R5C8', 5),
  new Given('R6C1', 1),
  new Given('R6C4', 2),
  new Given('R6C9', 7),
  new Given('R7C3', 8),
  new Given('R7C5', 6),
  new Given('R7C9', 3),
  new Given('R8C4', 3),
  new Given('R8C6', 1),
  new Given('R8C7', 6),
  new Given('R8C9', 4),
  new Given('R9C3', 1),
  new Given('R9C6', 9),
];
