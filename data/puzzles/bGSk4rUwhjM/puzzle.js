// Title: Classic Sudoku
// Author: Unknown
// Video: https://www.youtube.com/watch?v=bGSk4rUwhjM
// Source: https://sudokupad.app/3F2gfbhbnh

// Normal sudoku rules apply (1-9 in each row, column and 3x3 box). Standard
// 3x3 box regions -- Shape('9x9') supplies rows/columns/boxes, matching the
// 9 whole-box regions in the payload. No other clue types (lines, cages,
// arrows) appear in the payload; the puzzle is fully determined by its 27
// givens below.

// Givens, as drawn on the board (cell ids below are 1-indexed R#C#).
return [
  new Shape('9x9'),

  new Given('R1C3', 2),
  new Given('R1C4', 3),
  new Given('R1C9', 4),
  new Given('R2C2', 7),
  new Given('R2C5', 1),
  new Given('R2C8', 9),
  new Given('R3C1', 1),
  new Given('R3C6', 6),
  new Given('R3C7', 5),
  new Given('R4C1', 6),
  new Given('R4C6', 9),
  new Given('R4C7', 8),
  new Given('R5C2', 2),
  new Given('R5C5', 5),
  new Given('R5C8', 7),
  new Given('R6C3', 5),
  new Given('R6C4', 6),
  new Given('R6C9', 9),
  new Given('R7C3', 8),
  new Given('R7C4', 5),
  new Given('R7C9', 2),
  new Given('R8C2', 5),
  new Given('R8C5', 6),
  new Given('R8C8', 3),
  new Given('R9C1', 7),
  new Given('R9C6', 3),
  new Given('R9C7', 1),
];
