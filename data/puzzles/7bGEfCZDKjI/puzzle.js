// Title: Classic Sudoku
// Author: Unknown
// Video: https://www.youtube.com/watch?v=7bGEfCZDKjI
// Source: https://sudokupad.app/JgBL6728hF

// Normal sudoku rules apply (1-9 in each row, column and 3x3 box). Standard
// 3x3 box regions -- Shape('9x9') supplies rows/columns/boxes, matching the
// 9 whole-box regions in the payload. No other clue types (lines, cages,
// arrows) appear in the payload; the puzzle is fully determined by its 23
// givens below.

// Givens, as drawn on the board (cell ids below are 1-indexed R#C#).
return [
  new Shape('9x9'),

  new Given('R1C3', 5),
  new Given('R1C7', 8),
  new Given('R1C8', 7),
  new Given('R2C3', 6),
  new Given('R2C4', 1),
  new Given('R3C6', 4),
  new Given('R3C7', 2),
  new Given('R4C8', 1),
  new Given('R5C1', 9),
  new Given('R5C3', 3),
  new Given('R5C4', 8),
  new Given('R5C6', 5),
  new Given('R6C7', 6),
  new Given('R6C8', 8),
  new Given('R7C4', 5),
  new Given('R8C1', 1),
  new Given('R8C4', 4),
  new Given('R8C6', 7),
  new Given('R8C8', 9),
  new Given('R9C2', 3),
  new Given('R9C5', 1),
  new Given('R9C6', 2),
  new Given('R9C9', 4),
];
