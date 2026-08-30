// Title: A Sudoku With A Sting In The Start!
// Author: Unknown
// Video: https://www.youtube.com/watch?v=lPpAtnbvVR8
// Source: https://cracking-the-cryptic.web.app/sudoku/BHBjPFJJP4
//
// Standard Sudoku: place 1-9 once each in every row, column, and 3x3 box.
// The source carries no rules text and no clue geometry beyond the givens
// below and the standard box regions, so nothing else is encoded.

return [
  new Shape('9x9'),
  new Given('R1C2', 4),
  new Given('R1C4', 3),
  new Given('R1C7', 6),
  new Given('R2C3', 1),
  new Given('R2C6', 2),
  new Given('R2C8', 9),
  new Given('R5C2', 3),
  new Given('R5C4', 6),
  new Given('R5C7', 9),
  new Given('R6C3', 7),
  new Given('R6C6', 1),
  new Given('R6C8', 2),
  new Given('R7C2', 6),
  new Given('R7C4', 4),
  new Given('R7C7', 3),
  new Given('R8C1', 7),
  new Given('R8C9', 8),
  new Given('R9C3', 2),
  new Given('R9C6', 7),
  new Given('R9C8', 1),
];
