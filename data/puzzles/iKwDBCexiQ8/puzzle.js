// Title: Classic Sudoku
// Author: Unknown
// Video: https://www.youtube.com/watch?v=iKwDBCexiQ8
// Source: https://sudokupad.app/qjP9MpgGjm

// Normal sudoku rules apply (1-9 in each row, column and 3x3 box). Standard
// 3x3 box regions -- Shape('9x9') supplies rows/columns/boxes, matching the
// 9 whole-box regions in the payload. No other clue types (lines, cages,
// arrows) appear in the payload; the puzzle is fully determined by its 26
// givens below.

// Givens, as drawn on the board (cell ids below are 1-indexed R#C#).
return [
  new Shape('9x9'),

  new Given('R1C4', 2),
  new Given('R1C6', 8),
  new Given('R2C1', 6),
  new Given('R2C9', 1),
  new Given('R3C3', 5),
  new Given('R3C5', 3),
  new Given('R3C7', 2),
  new Given('R4C2', 6),
  new Given('R4C8', 9),
  new Given('R5C4', 4),
  new Given('R5C5', 5),
  new Given('R5C6', 3),
  new Given('R6C1', 5),
  new Given('R6C3', 1),
  new Given('R6C7', 4),
  new Given('R6C9', 3),
  new Given('R7C1', 7),
  new Given('R7C9', 8),
  new Given('R8C1', 8),
  new Given('R8C2', 3),
  new Given('R8C4', 1),
  new Given('R8C6', 9),
  new Given('R8C8', 5),
  new Given('R8C9', 4),
  new Given('R9C4', 5),
  new Given('R9C6', 6),
];
