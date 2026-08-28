// Title: Untitled
// Author: Unknown
// Video: https://www.youtube.com/watch?v=JkS6LpsiSkc
// Source: https://cracking-the-cryptic.web.app/sudoku/9B962gMB9g

// Classic 9x9 sudoku: default rows, columns, and 3x3 boxes. No cages, lines,
// or other variant clues -- only givens.
return [
  new Shape('9x9'),
  new Given('R1C3', 2),
  new Given('R2C4', 5),
  new Given('R2C6', 4),
  new Given('R2C7', 7),
  new Given('R3C1', 9),
  new Given('R3C2', 4),
  new Given('R3C6', 7),
  new Given('R3C9', 6),
  new Given('R4C8', 7),
  new Given('R5C1', 8),
  new Given('R5C9', 5),
  new Given('R6C2', 6),
  new Given('R6C4', 1),
  new Given('R6C6', 3),
  new Given('R6C7', 4),
  new Given('R7C3', 3),
  new Given('R7C5', 6),
  new Given('R8C2', 9),
  new Given('R8C7', 1),
  new Given('R9C4', 7),
  new Given('R9C7', 5),
  new Given('R9C8', 8),
  new Given('R9C9', 2),
];
