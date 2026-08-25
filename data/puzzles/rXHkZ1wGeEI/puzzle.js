// Title: Classic Sudoku
// Author: Unknown
// Video: https://www.youtube.com/watch?v=rXHkZ1wGeEI
// Source: https://sudokupad.app/3JmR9Rrrq6

// Normal sudoku rules apply (1-9 in each row, column and 3x3 box). Standard
// 3x3 box regions -- Shape('9x9') supplies rows/columns/boxes, matching the
// 9 whole-box regions in the payload. No other clue types (lines, cages,
// arrows) appear in the payload; the puzzle is fully determined by its 30
// givens below.

// Givens, as drawn on the board (cell ids below are 1-indexed R#C#).
return [
  new Shape('9x9'),

  new Given('R1C1', 2),
  new Given('R1C2', 4),
  new Given('R1C4', 6),
  new Given('R1C9', 1),
  new Given('R2C3', 3),
  new Given('R2C9', 7),
  new Given('R3C6', 9),
  new Given('R3C8', 2),
  new Given('R4C3', 4),
  new Given('R4C4', 7),
  new Given('R4C5', 3),
  new Given('R4C6', 5),
  new Given('R4C9', 9),
  new Given('R5C4', 9),
  new Given('R5C5', 6),
  new Given('R5C6', 2),
  new Given('R5C9', 5),
  new Given('R6C1', 5),
  new Given('R6C4', 8),
  new Given('R6C5', 4),
  new Given('R6C6', 1),
  new Given('R6C7', 6),
  new Given('R7C2', 8),
  new Given('R7C4', 1),
  new Given('R8C1', 9),
  new Given('R8C7', 1),
  new Given('R9C1', 1),
  new Given('R9C6', 6),
  new Given('R9C8', 5),
  new Given('R9C9', 4),
];
