// Title: Daytime Sudoku (Non-Canon)
// Author: Bill Murphy
// Video: https://www.youtube.com/watch?v=oh_RAQFadik
// Source: https://tinyurl.com/bdh3rdjc

// Normal Sudoku rules apply. Cells a chess knight's move apart must not
// contain the same digit (AntiKnight, global).

return [
  new Shape('9x9'),

  new Given('R1C1', 1),
  new Given('R1C8', 6),
  new Given('R1C9', 2),
  new Given('R2C1', 5),
  new Given('R2C7', 4),
  new Given('R3C2', 3),
  new Given('R3C6', 1),
  new Given('R4C3', 4),
  new Given('R4C5', 5),
  new Given('R5C4', 8),
  new Given('R5C6', 6),
  new Given('R6C5', 7),
  new Given('R6C7', 2),
  new Given('R7C4', 3),
  new Given('R7C8', 1),
  new Given('R8C3', 2),
  new Given('R8C9', 7),
  new Given('R9C1', 4),
  new Given('R9C2', 8),
  new Given('R9C9', 3),

  new AntiKnight(),
];
