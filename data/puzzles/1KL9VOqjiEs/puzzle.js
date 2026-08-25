// Title: Classic Sudoku
// Author: Unknown
// Video: https://www.youtube.com/watch?v=1KL9VOqjiEs
// Source: https://app.crackingthecryptic.com/8pgpmHQ2qF

// Normal sudoku rules apply (1-9 in each row, column and 3x3 box). Standard
// 3x3 box regions -- Shape('9x9') supplies rows/columns/boxes, matching the
// 9 whole-box regions in the payload. No other clue types (lines, cages,
// arrows) appear in the payload; the puzzle is fully determined by its 25
// givens below.

// Givens, as drawn on the board (cell ids below are 1-indexed R#C#).
return [
  new Shape('9x9'),

  new Given('R1C2', 4),
  new Given('R1C7', 2),
  new Given('R2C6', 7),
  new Given('R2C8', 9),
  new Given('R3C6', 6),
  new Given('R3C8', 1),
  new Given('R4C1', 8),
  new Given('R4C2', 7),
  new Given('R4C5', 2),
  new Given('R4C9', 4),
  new Given('R5C1', 9),
  new Given('R5C3', 1),
  new Given('R5C8', 2),
  new Given('R5C9', 8),
  new Given('R6C2', 6),
  new Given('R6C5', 3),
  new Given('R6C7', 1),
  new Given('R7C3', 6),
  new Given('R7C4', 8),
  new Given('R7C8', 4),
  new Given('R7C9', 1),
  new Given('R8C5', 7),
  new Given('R8C8', 5),
  new Given('R9C3', 5),
  new Given('R9C4', 9),
];
