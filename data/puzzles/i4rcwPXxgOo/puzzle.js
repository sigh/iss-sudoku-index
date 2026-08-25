// Title: Classic Sudoku
// Author: Unknown
// Video: https://www.youtube.com/watch?v=i4rcwPXxgOo
// Source: https://sudokupad.app/bf2Qft4DDm

// Normal sudoku rules apply (1-9 in each row, column and 3x3 box). Standard
// 3x3 box regions -- Shape('9x9') supplies rows/columns/boxes, matching the
// 9 whole-box regions in the payload. No other clue types (lines, cages,
// arrows) appear in the payload; the puzzle is fully determined by its 25
// givens below.

// Givens, as drawn on the board (cell ids below are 1-indexed R#C#).
return [
  new Shape('9x9'),

  new Given('R1C3', 4),
  new Given('R1C5', 7),
  new Given('R2C1', 9),
  new Given('R2C2', 5),
  new Given('R2C4', 2),
  new Given('R2C6', 4),
  new Given('R2C9', 7),
  new Given('R3C6', 6),
  new Given('R4C7', 8),
  new Given('R4C8', 7),
  new Given('R4C9', 4),
  new Given('R5C3', 1),
  new Given('R5C7', 2),
  new Given('R6C1', 7),
  new Given('R6C2', 4),
  new Given('R6C3', 9),
  new Given('R6C9', 6),
  new Given('R7C4', 3),
  new Given('R8C1', 2),
  new Given('R8C4', 4),
  new Given('R8C6', 7),
  new Given('R8C8', 3),
  new Given('R9C3', 8),
  new Given('R9C5', 2),
  new Given('R9C7', 5),
];
