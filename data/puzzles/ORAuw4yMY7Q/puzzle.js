// Title: Classic Sudoku
// Author: Unknown
// Video: https://www.youtube.com/watch?v=ORAuw4yMY7Q
// Source: https://sudokupad.app/Dt3rqrQPGR

// Normal sudoku rules apply (1-9 in each row, column and 3x3 box). Standard
// 3x3 box regions -- Shape('9x9') supplies rows/columns/boxes, matching the
// 9 whole-box regions in the payload. No other clue types (lines, cages,
// arrows) appear in the payload; the puzzle is fully determined by its 28
// givens below.

// Givens, as drawn on the board (cell ids below are 1-indexed R#C#).
return [
  new Shape('9x9'),

  new Given('R1C3', 2),
  new Given('R1C4', 4),
  new Given('R1C9', 8),
  new Given('R2C2', 6),
  new Given('R2C4', 3),
  new Given('R2C7', 7),
  new Given('R3C1', 9),
  new Given('R3C2', 3),
  new Given('R3C5', 2),
  new Given('R3C8', 4),
  new Given('R4C4', 6),
  new Given('R4C5', 5),
  new Given('R5C3', 5),
  new Given('R5C4', 2),
  new Given('R5C6', 1),
  new Given('R5C7', 9),
  new Given('R6C5', 3),
  new Given('R6C6', 4),
  new Given('R7C2', 1),
  new Given('R7C5', 9),
  new Given('R7C8', 5),
  new Given('R7C9', 7),
  new Given('R8C3', 7),
  new Given('R8C6', 2),
  new Given('R8C8', 9),
  new Given('R9C1', 8),
  new Given('R9C6', 7),
  new Given('R9C7', 4),
];
