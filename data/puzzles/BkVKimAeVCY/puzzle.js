// Title: Classic Sudoku
// Author: Unknown
// Video: https://www.youtube.com/watch?v=BkVKimAeVCY
// Source: https://sudokupad.app/dqmRMJ3j8N

// Normal sudoku rules apply (1-9 in each row, column and 3x3 box). Standard
// 3x3 box regions -- Shape('9x9') supplies rows/columns/boxes, matching the
// 9 whole-box regions in the payload. No other clue types (lines, cages,
// arrows) appear in the payload; the puzzle is fully determined by its 26
// givens below.

// Givens, as drawn on the board (cell ids below are 1-indexed R#C#).
return [
  new Shape('9x9'),

  new Given('R1C3', 8),
  new Given('R1C4', 5),
  new Given('R1C5', 9),
  new Given('R1C8', 2),
  new Given('R1C9', 7),
  new Given('R2C2', 2),
  new Given('R3C3', 4),
  new Given('R3C4', 3),
  new Given('R3C6', 8),
  new Given('R4C1', 7),
  new Given('R4C5', 5),
  new Given('R4C7', 9),
  new Given('R5C2', 5),
  new Given('R5C8', 3),
  new Given('R6C3', 2),
  new Given('R6C5', 6),
  new Given('R6C9', 5),
  new Given('R7C4', 9),
  new Given('R7C6', 5),
  new Given('R7C7', 7),
  new Given('R8C8', 6),
  new Given('R9C1', 9),
  new Given('R9C2', 8),
  new Given('R9C5', 3),
  new Given('R9C6', 2),
  new Given('R9C7', 1),
];
