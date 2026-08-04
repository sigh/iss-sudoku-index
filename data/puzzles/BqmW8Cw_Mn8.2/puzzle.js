// Title: Mar. 12, 2023: #Disambiguation
// Author: Philip Newman
// Video: https://www.youtube.com/watch?v=BqmW8Cw_Mn8
// Source: https://tinyurl.com/3b73z42x

// Normal sudoku rules apply. Anti-King: cells a chess king's move apart
// (including diagonally adjacent) cannot repeat a digit -- AntiKing() below.
// No cages, lines, or other overlay geometry are present in the source.

return [
  new Shape('9x9'),

  // Givens, transcribed from the source's grid (row-major).
  new Given('R1C3', 3), new Given('R1C5', 7), new Given('R1C7', 6),
  new Given('R2C4', 2), new Given('R2C5', 8), new Given('R2C6', 5),
  new Given('R3C1', 7), new Given('R3C5', 1), new Given('R3C9', 4),
  new Given('R4C2', 8), new Given('R4C8', 3),
  new Given('R5C1', 5), new Given('R5C2', 6), new Given('R5C3', 4),
  new Given('R5C7', 2), new Given('R5C8', 8), new Given('R5C9', 7),
  new Given('R6C2', 1), new Given('R6C8', 6),
  new Given('R7C1', 2), new Given('R7C5', 3), new Given('R7C9', 5),
  new Given('R8C4', 7), new Given('R8C5', 6), new Given('R8C6', 4),
  new Given('R9C3', 8), new Given('R9C5', 5), new Given('R9C7', 1),

  new AntiKing(),
];
