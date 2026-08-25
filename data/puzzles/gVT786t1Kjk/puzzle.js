// Title: Unknown
// Author: Sam Cappleman-Lynes
// Video: https://www.youtube.com/watch?v=gVT786t1Kjk
// Source: https://app.crackingthecryptic.com/webapp/PpQF74L7g3

// Normal sudoku rules apply (1-9 in each row, column and 3x3 box). Standard
// 3x3 box regions -- Shape('9x9') supplies rows/columns/boxes, matching the
// 9 whole-box regions in the payload. No other clue types (lines, cages,
// arrows) appear in the payload; the puzzle is fully determined by its 24
// givens below.

// Givens, as drawn on the board (cell ids below are 1-indexed R#C#).
return [
  new Shape('9x9'),

  new Given('R1C1', 1),
  new Given('R1C4', 2),
  new Given('R1C7', 3),
  new Given('R2C1', 3),
  new Given('R2C4', 4),
  new Given('R2C7', 5),
  new Given('R3C3', 6),
  new Given('R3C6', 7),
  new Given('R3C9', 2),
  new Given('R4C3', 7),
  new Given('R4C6', 2),
  new Given('R4C9', 5),
  new Given('R6C1', 5),
  new Given('R6C4', 3),
  new Given('R6C7', 1),
  new Given('R7C1', 8),
  new Given('R7C4', 1),
  new Given('R7C7', 2),
  new Given('R8C3', 2),
  new Given('R8C6', 3),
  new Given('R8C9', 1),
  new Given('R9C3', 5),
  new Given('R9C6', 8),
  new Given('R9C9', 6),
];
