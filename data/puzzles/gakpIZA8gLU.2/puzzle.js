// Title: Classic Sudoku
// Author: Unknown
// Video: https://www.youtube.com/watch?v=gakpIZA8gLU
// Source: https://app.crackingthecryptic.com/webapp/644gnfML43

// Normal sudoku rules apply (1-9 in each row, column and 3x3 box). Standard
// 3x3 box regions -- Shape('9x9') supplies rows/columns/boxes, matching the
// 9 whole-box regions in the payload. No other clue types (cages, lines,
// arrows) appear in the payload; the puzzle is fully determined by its 28
// givens below.

// Givens, as drawn on the board (cell ids below are 1-indexed R#C#).
return [
  new Shape('9x9'),

  new Given('R1C3', 6),
  new Given('R1C6', 1),
  new Given('R1C8', 2),
  new Given('R1C9', 8),
  new Given('R2C2', 9),
  new Given('R2C3', 8),
  new Given('R2C4', 3),
  new Given('R2C9', 5),
  new Given('R3C4', 5),
  new Given('R4C5', 7),
  new Given('R4C6', 5),
  new Given('R4C8', 1),
  new Given('R4C9', 2),
  new Given('R5C2', 5),
  new Given('R5C8', 7),
  new Given('R6C1', 8),
  new Given('R6C2', 7),
  new Given('R6C4', 4),
  new Given('R6C5', 3),
  new Given('R7C6', 4),
  new Given('R8C1', 7),
  new Given('R8C6', 9),
  new Given('R8C7', 5),
  new Given('R8C8', 8),
  new Given('R9C1', 6),
  new Given('R9C2', 8),
  new Given('R9C4', 2),
  new Given('R9C7', 1),
];
