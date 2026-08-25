// Title: Classic Sudoku
// Author: Tom Collyer
// Video: https://www.youtube.com/watch?v=nsYLpMZ-rpI
// Source: https://app.crackingthecryptic.com/RL7qR4H6QF

// Normal sudoku rules apply (1-9 in each row, column and 3x3 box). Standard
// 3x3 box regions -- Shape('9x9') supplies rows/columns/boxes, matching the
// 9 whole-box regions in the payload. No other clue types (lines, cages,
// arrows) appear in the payload; the puzzle is fully determined by its 24
// givens below.

// Givens, as drawn on the board (cell ids below are 1-indexed R#C#).
return [
  new Shape('9x9'),

  new Given('R1C6', 3),
  new Given('R1C7', 2),
  new Given('R2C4', 9),
  new Given('R3C3', 3),
  new Given('R3C4', 4),
  new Given('R3C6', 6),
  new Given('R3C8', 8),
  new Given('R4C3', 5),
  new Given('R4C6', 7),
  new Given('R4C8', 9),
  new Given('R4C9', 1),
  new Given('R5C1', 2),
  new Given('R5C9', 5),
  new Given('R6C1', 6),
  new Given('R6C2', 8),
  new Given('R6C4', 3),
  new Given('R6C7', 4),
  new Given('R7C2', 4),
  new Given('R7C4', 2),
  new Given('R7C6', 5),
  new Given('R7C7', 6),
  new Given('R8C6', 8),
  new Given('R9C3', 9),
  new Given('R9C4', 7),
];
