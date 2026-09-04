// Title: Anti-knight Sudoku
// Author: Jonas Gleim
// Video: https://www.youtube.com/watch?v=lVkMWm2I7SE
// Source: https://cracking-the-cryptic.web.app/sudoku/FLFpq4pMH3

// Normal sudoku rules apply (rows, columns, boxes all-different -- the
// solver's default for a 9x9 Shape). In addition, cells a knight's move
// apart must not share a digit: AntiKnight.
return [
  new Shape('9x9'),
  new Given('R1C5', 1),
  new Given('R1C9', 8),
  new Given('R2C5', 2),
  new Given('R3C6', 3),
  new Given('R4C1', 9),
  new Given('R4C7', 4),
  new Given('R5C2', 8),
  new Given('R5C8', 5),
  new Given('R6C3', 7),
  new Given('R6C9', 6),
  new Given('R7C4', 6),
  new Given('R8C5', 5),
  new Given('R9C1', 3),
  new Given('R9C5', 4),
  new AntiKnight(),
];
