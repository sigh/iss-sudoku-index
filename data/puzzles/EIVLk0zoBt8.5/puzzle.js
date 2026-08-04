// Title: Twas the Knight Before Xmas
// Author: Philip Newman
// Video: https://www.youtube.com/watch?v=EIVLk0zoBt8
// Source: https://tinyurl.com/mtpby8j3

// Normal sudoku rules apply. Cells separated by a chess knight's move cannot
// contain the same digit (AntiKnight covers this globally).
// Givens transcribed from the drawn grid.

return [
  new Shape('9x9'),

  new Given('R1C2', 9), new Given('R1C3', 3),
  new Given('R1C7', 2), new Given('R1C8', 8),
  new Given('R2C1', 6), new Given('R2C9', 3),
  new Given('R3C1', 4), new Given('R3C9', 9),
  new Given('R4C4', 8), new Given('R4C5', 3), new Given('R4C6', 4),
  new Given('R5C4', 1), new Given('R5C5', 5), new Given('R5C6', 9),
  new Given('R6C4', 6), new Given('R6C5', 7), new Given('R6C6', 2),
  new Given('R7C1', 1), new Given('R7C9', 6),
  new Given('R8C1', 7), new Given('R8C9', 4),
  new Given('R9C2', 2), new Given('R9C3', 8),
  new Given('R9C7', 7), new Given('R9C8', 1),

  new AntiKnight(),
];
