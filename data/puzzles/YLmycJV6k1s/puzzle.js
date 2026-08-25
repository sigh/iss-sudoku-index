// Title: Classic Sudoku
// Author: Unknown
// Video: https://www.youtube.com/watch?v=YLmycJV6k1s
// Source: https://sudokupad.app/G9J8rDNJtD

// Normal sudoku rules apply (1-9 in each row, column and 3x3 box). Standard
// 3x3 box regions -- Shape('9x9') supplies rows/columns/boxes, matching the
// 9 whole-box regions in the payload. No other clue types (lines, cages,
// arrows) appear in the payload; the puzzle is fully determined by its 26
// givens below.

// Givens, as drawn on the board (cell ids below are 1-indexed R#C#).
return [
  new Shape('9x9'),

  new Given('R1C2', 9),
  new Given('R1C3', 3),
  new Given('R1C6', 5),
  new Given('R2C3', 4),
  new Given('R2C4', 8),
  new Given('R2C9', 2),
  new Given('R3C1', 5),
  new Given('R3C4', 9),
  new Given('R3C5', 6),
  new Given('R3C9', 1),
  new Given('R4C2', 6),
  new Given('R4C4', 1),
  new Given('R4C7', 8),
  new Given('R6C3', 8),
  new Given('R6C6', 3),
  new Given('R6C8', 1),
  new Given('R7C1', 8),
  new Given('R7C5', 7),
  new Given('R7C6', 2),
  new Given('R7C9', 6),
  new Given('R8C1', 2),
  new Given('R8C6', 1),
  new Given('R8C7', 9),
  new Given('R9C4', 5),
  new Given('R9C7', 2),
  new Given('R9C8', 3),
];
