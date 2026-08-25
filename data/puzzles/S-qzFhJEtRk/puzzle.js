// Title: Classic Sudoku
// Author: Unknown
// Video: https://www.youtube.com/watch?v=S-qzFhJEtRk
// Source: https://sudokupad.app/qqFdBNRD9r

// Normal sudoku rules apply (1-9 in each row, column and 3x3 box). Standard
// 3x3 box regions -- Shape('9x9') supplies rows/columns/boxes, matching the
// 9 whole-box regions in the payload. No other clue types (lines, cages,
// arrows) appear in the payload; the puzzle is fully determined by its 22
// givens below.

// Givens, as drawn on the board (cell ids below are 1-indexed R#C#).
return [
  new Shape('9x9'),

  new Given('R1C3', 9),
  new Given('R1C9', 3),
  new Given('R2C2', 1),
  new Given('R2C5', 5),
  new Given('R3C1', 2),
  new Given('R3C4', 4),
  new Given('R3C8', 8),
  new Given('R4C3', 6),
  new Given('R4C6', 3),
  new Given('R5C2', 8),
  new Given('R5C7', 7),
  new Given('R6C4', 1),
  new Given('R6C8', 4),
  new Given('R7C1', 4),
  new Given('R7C5', 9),
  new Given('R7C7', 6),
  new Given('R8C3', 3),
  new Given('R8C4', 8),
  new Given('R8C8', 1),
  new Given('R9C2', 7),
  new Given('R9C6', 2),
  new Given('R9C9', 5),
];
