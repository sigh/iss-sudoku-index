// Title: Classic Sudoku
// Author: Unknown
// Video: https://www.youtube.com/watch?v=zecvWo4ZQmg
// Source: https://sudokupad.app/BbJhQR4qrf

// Normal sudoku rules apply (1-9 in each row, column and 3x3 box). Standard
// 3x3 box regions -- Shape('9x9') supplies rows/columns/boxes, matching the
// 9 whole-box regions in the payload. No other clue types (lines, cages,
// arrows) appear in the payload; the puzzle is fully determined by its 25
// givens below.

// Givens, as drawn on the board (cell ids below are 1-indexed R#C#).
return [
  new Shape('9x9'),

  new Given('R1C4', 8),
  new Given('R1C6', 2),
  new Given('R1C9', 1),
  new Given('R2C5', 6),
  new Given('R2C8', 8),
  new Given('R3C1', 2),
  new Given('R3C6', 4),
  new Given('R3C8', 3),
  new Given('R4C1', 4),
  new Given('R4C8', 6),
  new Given('R5C1', 6),
  new Given('R5C2', 2),
  new Given('R5C5', 3),
  new Given('R5C8', 4),
  new Given('R5C9', 5),
  new Given('R6C2', 1),
  new Given('R6C9', 9),
  new Given('R7C2', 8),
  new Given('R7C4', 1),
  new Given('R8C2', 5),
  new Given('R8C5', 7),
  new Given('R9C1', 9),
  new Given('R9C4', 6),
  new Given('R9C6', 5),
  new Given('R9C9', 7),
];
