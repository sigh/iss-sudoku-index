// Title: Untitled
// Author: Sam Cappleman-Lynes
// Video: https://www.youtube.com/watch?v=uvTV_Wivxmo
// Source: https://app.crackingthecryptic.com/webapp/dqTM27jm3P

// Normal sudoku rules apply (1-9 in each row, column and 3x3 box). Standard
// 3x3 box regions -- Shape('9x9') supplies rows/columns/boxes, matching the
// 9 whole-box regions in the payload. No other clue types (lines, cages,
// arrows) appear in the payload; the puzzle is fully determined by its 25
// givens below.

// Givens, as drawn on the board (cell ids below are 1-indexed R#C#).
return [
  new Shape('9x9'),

  new Given('R1C1', 7),
  new Given('R1C3', 1),
  new Given('R1C5', 3),
  new Given('R2C2', 8),
  new Given('R2C4', 7),
  new Given('R2C6', 6),
  new Given('R3C3', 3),
  new Given('R3C5', 5),
  new Given('R3C7', 9),
  new Given('R4C4', 4),
  new Given('R4C6', 2),
  new Given('R4C8', 9),
  new Given('R5C5', 7),
  new Given('R5C7', 1),
  new Given('R5C9', 5),
  new Given('R6C6', 5),
  new Given('R6C8', 8),
  new Given('R7C1', 1),
  new Given('R7C7', 3),
  new Given('R7C9', 9),
  new Given('R8C2', 3),
  new Given('R8C8', 6),
  new Given('R9C1', 9),
  new Given('R9C3', 5),
  new Given('R9C9', 1),
];
