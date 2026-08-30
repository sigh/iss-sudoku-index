// Title: Anti-Knight Sudoku
// Author: Ethan Morgan
// Video: https://www.youtube.com/watch?v=mTdhTfAhOI8
// Source: https://cracking-the-cryptic.web.app/sudoku/RPBnQFRLR8

// Standard sudoku (rows, columns, 3x3 boxes) plus AntiKnight: no two cells a
// knight's move apart may share a digit.

const givens = [
  new Given('R1C2', 3),
  new Given('R1C5', 4),
  new Given('R1C6', 1),
  new Given('R1C9', 7),
  new Given('R2C4', 5),
  new Given('R3C4', 8),
  new Given('R3C6', 9),
  new Given('R4C1', 6),
  new Given('R4C8', 7),
  new Given('R5C9', 4),
  new Given('R6C2', 4),
  new Given('R7C1', 3),
  new Given('R8C5', 6),
  new Given('R8C8', 5),
  new Given('R9C2', 6),
  new Given('R9C3', 4),
  new Given('R9C4', 3),
];

return [
  new Shape('9x9'),
  ...givens,
  new AntiKnight(),
];
