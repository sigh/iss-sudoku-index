// Title: Knight's Move Sudoku
// Author: Ethan Morgan
// Video: https://www.youtube.com/watch?v=rQHV-gIAG_0
// Source: https://app.crackingthecryptic.com/jfM6N4BLFT
//
// Normal sudoku rules apply (standard 3x3 boxes).
// Identical digits cannot appear in cells a chess knight's move apart ->
// AntiKnight.

return [
  new Shape('9x9'),
  new AntiKnight(),
  new Given('R1C6', 6),
  new Given('R2C3', 3),
  new Given('R2C9', 7),
  new Given('R3C1', 2),
  new Given('R3C4', 3),
  new Given('R3C7', 4),
  new Given('R3C8', 9),
  new Given('R4C1', 6),
  new Given('R4C8', 4),
  new Given('R4C9', 5),
  new Given('R5C3', 2),
  new Given('R5C7', 8),
  new Given('R6C4', 1),
  new Given('R7C1', 3),
  new Given('R8C1', 7),
  new Given('R8C6', 1),
  new Given('R8C9', 9),
  new Given('R9C7', 5),
];
