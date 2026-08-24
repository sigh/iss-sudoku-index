// Title: unknown
// Author: Sam Cappleman-Lynes
// Video: https://www.youtube.com/watch?v=OOao2q1QVVU
// Source: https://app.crackingthecryptic.com/sudoku/t4NRrQ6rFb

// Normal sudoku rules apply (1-9 in each row, column and 3x3 box). Standard
// 3x3 box regions -- Shape('9x9') supplies rows/columns/boxes, matching the
// 9 whole-box regions in the payload. No other clue types (lines, cages,
// arrows) appear in the payload; the puzzle is fully determined by its 23
// givens below.

// Givens, as drawn on the board (cell ids below are 1-indexed R#C#).
return [
  new Shape('9x9'),

  new Given('R1C3', 2),
  new Given('R1C5', 1),
  new Given('R1C7', 3),
  new Given('R2C2', 4),
  new Given('R2C4', 7),
  new Given('R3C1', 5),
  new Given('R3C7', 9),
  new Given('R3C9', 4),
  new Given('R4C2', 9),
  new Given('R4C6', 1),
  new Given('R5C1', 6),
  new Given('R5C5', 9),
  new Given('R5C9', 5),
  new Given('R6C4', 3),
  new Given('R6C8', 9),
  new Given('R7C1', 8),
  new Given('R7C3', 4),
  new Given('R7C9', 6),
  new Given('R8C6', 8),
  new Given('R8C8', 1),
  new Given('R9C3', 3),
  new Given('R9C5', 7),
  new Given('R9C7', 2),
];
