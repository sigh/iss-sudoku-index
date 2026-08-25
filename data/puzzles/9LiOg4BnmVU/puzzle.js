// Title: Classic Sudoku
// Author: Unknown
// Video: https://www.youtube.com/watch?v=9LiOg4BnmVU
// Source: https://sudokupad.app/bJMt8qb947

// Normal sudoku rules apply (1-9 in each row, column and 3x3 box). Standard
// 3x3 box regions -- Shape('9x9') supplies rows/columns/boxes, matching the
// 9 whole-box regions in the payload. No other clue types (lines, cages,
// arrows) appear in the payload; the puzzle is fully determined by its 22
// givens below.

// Givens, as drawn on the board (cell ids below are 1-indexed R#C#).
return [
  new Shape('9x9'),

  new Given('R1C1', 5),
  new Given('R1C2', 6),
  new Given('R1C4', 1),
  new Given('R1C8', 3),
  new Given('R2C1', 9),
  new Given('R2C5', 2),
  new Given('R2C7', 6),
  new Given('R3C2', 1),
  new Given('R4C3', 3),
  new Given('R4C4', 6),
  new Given('R4C7', 7),
  new Given('R4C9', 9),
  new Given('R5C5', 8),
  new Given('R5C9', 4),
  new Given('R6C2', 5),
  new Given('R7C5', 3),
  new Given('R8C5', 4),
  new Given('R9C2', 2),
  new Given('R9C3', 7),
  new Given('R9C5', 6),
  new Given('R9C8', 1),
  new Given('R9C9', 3),
];
