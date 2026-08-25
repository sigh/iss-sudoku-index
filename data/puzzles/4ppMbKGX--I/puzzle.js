// Title: Classic Sudoku
// Author: Unknown
// Video: https://www.youtube.com/watch?v=4ppMbKGX--I
// Source: https://sudokupad.app/2dMhBpq46M

// Normal sudoku rules apply (1-9 in each row, column and 3x3 box). Standard
// 3x3 box regions -- Shape('9x9') supplies rows/columns/boxes, matching the
// 9 whole-box regions in the payload. No other clue types (lines, cages,
// arrows) appear in the payload; the puzzle is fully determined by its 24
// givens below.

// Givens, as drawn on the board (cell ids below are 1-indexed R#C#).
return [
  new Shape('9x9'),

  new Given('R1C1', 1),
  new Given('R1C4', 9),
  new Given('R1C6', 7),
  new Given('R2C1', 7),
  new Given('R2C6', 6),
  new Given('R2C7', 9),
  new Given('R2C9', 4),
  new Given('R3C6', 4),
  new Given('R3C8', 1),
  new Given('R4C6', 8),
  new Given('R4C7', 2),
  new Given('R4C8', 7),
  new Given('R5C3', 8),
  new Given('R5C4', 5),
  new Given('R6C1', 6),
  new Given('R6C5', 7),
  new Given('R6C9', 5),
  new Given('R7C1', 2),
  new Given('R7C2', 6),
  new Given('R7C6', 9),
  new Given('R8C3', 7),
  new Given('R9C5', 3),
  new Given('R9C7', 4),
  new Given('R9C8', 9),
];
