// Title: pipeline
// Author: Philip Newman
// Video: https://www.youtube.com/watch?v=-1tykO0Q3zc
// Source: https://app.crackingthecryptic.com/sudoku/rRN9frgJhf

// Normal sudoku rules apply (1-9 in each row, column and 3x3 box). Standard
// 3x3 box regions -- Shape('9x9') supplies rows/columns/boxes, matching the
// 9 whole-box regions in the payload. No other clue types (lines, cages,
// arrows) appear in the payload; the puzzle is fully determined by its 22
// givens below.

// Givens, as drawn on the board (cell ids below are 1-indexed R#C#).
return [
  new Shape('9x9'),

  new Given('R1C4', 3),
  new Given('R1C7', 1),
  new Given('R2C2', 4),
  new Given('R2C4', 1),
  new Given('R2C8', 5),
  new Given('R3C1', 9),
  new Given('R3C3', 2),
  new Given('R4C6', 6),
  new Given('R4C9', 5),
  new Given('R5C1', 3),
  new Given('R5C2', 5),
  new Given('R5C8', 8),
  new Given('R5C9', 9),
  new Given('R6C1', 7),
  new Given('R6C4', 9),
  new Given('R7C7', 3),
  new Given('R7C9', 2),
  new Given('R8C2', 3),
  new Given('R8C6', 8),
  new Given('R8C8', 4),
  new Given('R9C3', 6),
  new Given('R9C6', 2),
];
