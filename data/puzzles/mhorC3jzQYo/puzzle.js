// Title: Classic Sudoku
// Author: Unknown
// Video: https://www.youtube.com/watch?v=mhorC3jzQYo
// Source: https://app.crackingthecryptic.com/2GHMmBFn2g

// Normal sudoku rules apply (1-9 in each row, column and 3x3 box). Standard
// 3x3 box regions -- Shape('9x9') supplies rows/columns/boxes, matching the
// 9 whole-box regions in the payload. No other clue types (lines, cages,
// arrows) appear in the payload; the puzzle is fully determined by its 25
// givens below.

// Givens, as drawn on the board (cell ids below are 1-indexed R#C#).
return [
  new Shape('9x9'),

  new Given('R1C5', 9),
  new Given('R2C2', 1),
  new Given('R2C3', 4),
  new Given('R2C6', 5),
  new Given('R2C9', 8),
  new Given('R3C7', 3),
  new Given('R3C9', 4),
  new Given('R4C2', 2),
  new Given('R4C4', 3),
  new Given('R4C7', 7),
  new Given('R4C8', 4),
  new Given('R5C3', 6),
  new Given('R6C2', 8),
  new Given('R6C3', 1),
  new Given('R6C5', 2),
  new Given('R6C6', 4),
  new Given('R7C2', 6),
  new Given('R7C4', 9),
  new Given('R8C6', 6),
  new Given('R8C7', 9),
  new Given('R8C9', 2),
  new Given('R9C1', 8),
  new Given('R9C3', 9),
  new Given('R9C6', 1),
  new Given('R9C9', 3),
];
