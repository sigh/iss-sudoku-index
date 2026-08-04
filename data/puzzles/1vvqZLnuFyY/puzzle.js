// Title: Collapse
// Author: Hakan Holgorsson
// Video: https://www.youtube.com/watch?v=1vvqZLnuFyY
// Source: https://app.crackingthecryptic.com/sudoku/pB49nQ7qFf

// Normal sudoku rules apply. Digits cannot repeat on a marked diagonal.
// Two diagonals are drawn (both stroked the same colour): main diagonal
// R1C1-R9C9 and anti-diagonal R1C9-R9C1. Diagonal(-1) covers R1C1..R9C9;
// Diagonal(1) covers R1C9..R9C1 (ISS's own direction convention).
return [
  new Shape('9x9'),

  new Given('R1C5', 3), new Given('R1C8', 4),
  new Given('R2C7', 1), new Given('R2C9', 8),
  new Given('R3C2', 7), new Given('R3C6', 5),
  new Given('R4C3', 4), new Given('R4C7', 7),
  new Given('R6C3', 9), new Given('R6C7', 3),
  new Given('R7C4', 2), new Given('R7C8', 9),
  new Given('R8C1', 8), new Given('R8C3', 6),
  new Given('R9C2', 3), new Given('R9C5', 4),

  new Diagonal(-1),
  new Diagonal(1),
];
