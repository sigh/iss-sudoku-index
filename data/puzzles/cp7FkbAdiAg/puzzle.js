// Title: Classic Sudoku
// Author: Unknown
// Video: https://www.youtube.com/watch?v=cp7FkbAdiAg
// Source: https://sudokupad.app/9qmN2tJQFp

// Normal sudoku rules apply (1-9 in each row, column and 3x3 box). Standard
// 3x3 box regions -- Shape('9x9') supplies rows/columns/boxes, matching the
// 9 whole-box regions in the payload. No other clue types (lines, cages,
// arrows) appear in the payload; the puzzle is fully determined by its 26
// givens below.

// Givens, as drawn on the board (cell ids below are 1-indexed R#C#).
return [
  new Shape('9x9'),

  new Given('R1C1', 4),
  new Given('R1C5', 2),
  new Given('R1C6', 7),
  new Given('R3C1', 8),
  new Given('R3C2', 6),
  new Given('R3C4', 9),
  new Given('R3C6', 4),
  new Given('R3C7', 1),
  new Given('R4C3', 9),
  new Given('R4C4', 7),
  new Given('R4C5', 8),
  new Given('R5C1', 6),
  new Given('R5C2', 2),
  new Given('R5C8', 8),
  new Given('R5C9', 7),
  new Given('R6C5', 1),
  new Given('R6C6', 2),
  new Given('R6C7', 3),
  new Given('R7C3', 5),
  new Given('R7C4', 3),
  new Given('R7C6', 8),
  new Given('R7C8', 1),
  new Given('R7C9', 2),
  new Given('R9C4', 5),
  new Given('R9C5', 6),
  new Given('R9C9', 3),
];
