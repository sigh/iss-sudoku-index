// Title: Classic Sudoku
// Author: Unknown
// Video: https://www.youtube.com/watch?v=kF7w3l2KbQk
// Source: https://sudokupad.app/2ggBH4f486

// Normal sudoku rules apply: rows, columns, and the marked 3x3 boxes each
// contain 1-9 once. No cages, lines, or other clues -- givens only.

return [
  new Shape('9x9'),

  new Given('R1C1', 3),
  new Given('R1C3', 5),
  new Given('R1C5', 7),
  new Given('R1C6', 1),
  new Given('R1C9', 9),
  new Given('R2C4', 3),
  new Given('R2C5', 4),
  new Given('R3C2', 9),
  new Given('R3C4', 2),
  new Given('R4C2', 3),
  new Given('R4C6', 4),
  new Given('R5C2', 6),
  new Given('R5C9', 7),
  new Given('R6C6', 2),
  new Given('R6C7', 8),
  new Given('R6C8', 5),
  new Given('R7C8', 8),
  new Given('R8C2', 5),
  new Given('R8C3', 4),
  new Given('R8C7', 9),
  new Given('R8C9', 1),
  new Given('R9C3', 7),
  new Given('R9C7', 4),
];
