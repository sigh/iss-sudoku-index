// Title: On the Ropes
// Author: Philip Newman
// Video: https://www.youtube.com/watch?v=GDV0E4mfnpI
// Source: https://tinyurl.com/mrucsdc6

// Normal sudoku rules apply. No Touch: cells which are diagonally adjacent
// cannot contain the same digit -> AntiKing (king's-move non-repeat).
const givens = [
  new Given('R1C4', 1), new Given('R1C5', 2), new Given('R1C6', 3),
  new Given('R2C7', 4), new Given('R2C8', 5), new Given('R2C9', 6),
  new Given('R3C1', 7), new Given('R3C2', 8), new Given('R3C3', 9),
  new Given('R4C1', 9), new Given('R4C2', 3), new Given('R4C3', 5),
  new Given('R5C4', 2), new Given('R5C5', 4), new Given('R5C6', 8),
  new Given('R6C7', 6), new Given('R6C8', 7), new Given('R6C9', 1),
  new Given('R7C7', 1), new Given('R7C8', 2), new Given('R7C9', 3),
  new Given('R8C1', 4), new Given('R8C2', 5), new Given('R8C3', 6),
  new Given('R9C4', 7), new Given('R9C5', 8), new Given('R9C6', 9),
];

return [
  new Shape('9x9'),
  ...givens,
  new AntiKing(),
];
