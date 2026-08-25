// Title: No-Touch Sudoku
// Author: Henning Kalsgaard Poulsen
// Video: https://www.youtube.com/watch?v=L4tWOtwLhP4
// Source: https://sudokupad.app/DPQ9GBg94B

// Normal sudoku on the standard 3x3 boxes, plus one global rule: digits in
// cells that meet diagonally at a point (a king's move apart, diagonally)
// must differ. AntiKing enforces exactly the diagonal king-move pairs.
return [
  new Shape('9x9'),
  new Given('R1C1', 4), new Given('R1C5', 5), new Given('R1C9', 6),
  new Given('R2C2', 5), new Given('R2C4', 3), new Given('R2C6', 1), new Given('R2C8', 2),
  new Given('R3C3', 2), new Given('R3C7', 9),
  new Given('R4C2', 9), new Given('R4C4', 8), new Given('R4C6', 3), new Given('R4C8', 6),
  new Given('R5C1', 3), new Given('R5C9', 9),
  new Given('R6C2', 6), new Given('R6C4', 9), new Given('R6C6', 5), new Given('R6C8', 7),
  new Given('R7C3', 4), new Given('R7C7', 8),
  new Given('R8C2', 2), new Given('R8C4', 1), new Given('R8C6', 9), new Given('R8C8', 4),
  new Given('R9C1', 9), new Given('R9C5', 3), new Given('R9C9', 2),
  new AntiKing(),
];
