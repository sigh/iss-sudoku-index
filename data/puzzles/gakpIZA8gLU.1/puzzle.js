// Title: Classic Sudoku
// Author: Chris Cassidy
// Video: https://www.youtube.com/watch?v=gakpIZA8gLU
// Source: https://app.crackingthecryptic.com/webapp/7p8pGGj98L

// Normal sudoku rules apply (1-9 in each row, column and 3x3 box). Standard
// 3x3 box regions -- Shape('9x9') supplies rows/columns/boxes, matching the
// 9 whole-box regions in the payload. No other clue types (cages, lines,
// arrows) appear in the payload; the puzzle is fully determined by its 28
// givens below.

// Givens, as drawn on the board (cell ids below are 1-indexed R#C#).
return [
  new Shape('9x9'),

  new Given('R1C5', 4),
  new Given('R1C8', 7),
  new Given('R2C1', 2),
  new Given('R2C6', 6),
  new Given('R2C9', 4),
  new Given('R3C1', 3),
  new Given('R3C2', 7),
  new Given('R3C4', 1),
  new Given('R3C8', 5),
  new Given('R3C9', 8),
  new Given('R4C1', 8),
  new Given('R4C5', 2),
  new Given('R4C9', 6),
  new Given('R5C3', 1),
  new Given('R5C7', 3),
  new Given('R6C1', 9),
  new Given('R6C5', 7),
  new Given('R6C9', 1),
  new Given('R7C1', 4),
  new Given('R7C2', 8),
  new Given('R7C6', 9),
  new Given('R7C8', 6),
  new Given('R7C9', 7),
  new Given('R8C1', 5),
  new Given('R8C4', 3),
  new Given('R8C9', 2),
  new Given('R9C2', 9),
  new Given('R9C5', 1),
];
