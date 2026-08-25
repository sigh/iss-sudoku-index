// Title: Classic Sudoku
// Author: Unknown
// Video: https://www.youtube.com/watch?v=axF75I0w0uU
// Source: https://sudokupad.app/8gnd66jm9P

// Normal sudoku rules apply (1-9 in each row, column and 3x3 box). Standard
// 3x3 box regions -- Shape('9x9') supplies rows/columns/boxes, matching the
// 9 whole-box regions in the payload. No other clue types (lines, cages,
// arrows) appear in the payload; the puzzle is fully determined by its 27
// givens below.

// Givens, as drawn on the board (cell ids below are 1-indexed R#C#).
return [
  new Shape('9x9'),

  new Given('R1C5', 6),
  new Given('R1C6', 3),
  new Given('R1C7', 8),
  new Given('R1C9', 7),
  new Given('R2C1', 7),
  new Given('R2C6', 5),
  new Given('R2C9', 3),
  new Given('R3C5', 4),
  new Given('R4C1', 8),
  new Given('R4C5', 5),
  new Given('R4C6', 2),
  new Given('R4C8', 1),
  new Given('R5C1', 4),
  new Given('R5C2', 5),
  new Given('R5C8', 9),
  new Given('R5C9', 2),
  new Given('R6C2', 7),
  new Given('R6C4', 6),
  new Given('R6C5', 3),
  new Given('R6C9', 5),
  new Given('R7C5', 8),
  new Given('R8C1', 6),
  new Given('R8C4', 2),
  new Given('R8C9', 8),
  new Given('R9C1', 2),
  new Given('R9C3', 9),
  new Given('R9C5', 1),
];
