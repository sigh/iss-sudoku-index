// Title: Classic Sudoku
// Author: Unknown
// Video: https://www.youtube.com/watch?v=WKnCiFKAE8M
// Source: https://app.crackingthecryptic.com/3mrP3JnT8B

// Normal sudoku rules apply (1-9 in each row, column and 3x3 box). Standard
// 3x3 box regions -- Shape('9x9') supplies rows/columns/boxes, matching the
// 9 whole-box regions in the payload. No other clue types (lines, cages,
// arrows) appear in the payload; the puzzle is fully determined by its 22
// givens below.

// Givens, as drawn on the board (cell ids below are 1-indexed R#C#).
return [
  new Shape('9x9'),

  new Given('R1C8', 8),
  new Given('R2C1', 9),
  new Given('R2C2', 4),
  new Given('R2C6', 7),
  new Given('R3C3', 5),
  new Given('R3C8', 1),
  new Given('R4C2', 1),
  new Given('R4C4', 2),
  new Given('R4C6', 8),
  new Given('R4C8', 4),
  new Given('R5C4', 6),
  new Given('R5C7', 7),
  new Given('R6C1', 7),
  new Given('R6C9', 9),
  new Given('R7C1', 1),
  new Given('R7C2', 2),
  new Given('R7C4', 9),
  new Given('R8C6', 5),
  new Given('R9C2', 7),
  new Given('R9C3', 4),
  new Given('R9C4', 1),
  new Given('R9C9', 6),
];
