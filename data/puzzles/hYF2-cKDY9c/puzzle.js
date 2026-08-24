// Title: Tough Sudoku - Classic
// Author: Unknown
// Video: https://www.youtube.com/watch?v=hYF2-cKDY9c
// Source: https://app.crackingthecryptic.com/sudoku/tmfTJQ66fP

// Normal sudoku rules apply (1-9 in each row, column and 3x3 box). Standard
// 3x3 box regions -- Shape('9x9') supplies rows/columns/boxes, matching the
// 9 whole-box regions in the payload. No other clue types (lines, cages,
// arrows) appear in the payload; the puzzle is fully determined by its 25
// givens below.

// Givens, as drawn on the board (cell ids below are 1-indexed R#C#).
return [
  new Shape('9x9'),

  new Given('R1C1', 6),
  new Given('R1C7', 3),
  new Given('R1C9', 4),
  new Given('R2C3', 3),
  new Given('R2C5', 1),
  new Given('R2C7', 5),
  new Given('R3C2', 7),
  new Given('R3C6', 9),
  new Given('R4C4', 1),
  new Given('R4C8', 7),
  new Given('R4C9', 3),
  new Given('R5C3', 7),
  new Given('R5C5', 5),
  new Given('R5C7', 6),
  new Given('R6C1', 1),
  new Given('R6C2', 3),
  new Given('R6C6', 2),
  new Given('R7C4', 4),
  new Given('R7C8', 2),
  new Given('R8C3', 8),
  new Given('R8C5', 3),
  new Given('R8C7', 9),
  new Given('R9C1', 7),
  new Given('R9C3', 6),
  new Given('R9C9', 8),
];
