// Title: unknown
// Author: Unknown
// Video: https://www.youtube.com/watch?v=TomEiPJyQiU
// Source: https://app.crackingthecryptic.com/sudoku/R9tJG7mpFh

// Normal sudoku rules apply (1-9 in each row, column and 3x3 box). Standard
// 3x3 box regions -- Shape('9x9') supplies rows/columns/boxes, matching the
// 9 whole-box regions in the payload. The payload carries no rules text,
// cages, lines, or arrows; the puzzle is fully determined by its 25 givens
// below.

// Givens, as drawn on the board (cell ids below are 1-indexed R#C#).
return [
  new Shape('9x9'),

  new Given('R1C7', 5),
  new Given('R2C1', 9),
  new Given('R2C5', 2),
  new Given('R3C4', 3),
  new Given('R3C6', 4),
  new Given('R3C7', 6),
  new Given('R3C9', 1),
  new Given('R4C3', 7),
  new Given('R4C4', 5),
  new Given('R4C5', 1),
  new Given('R4C7', 8),
  new Given('R5C3', 1),
  new Given('R5C6', 6),
  new Given('R5C8', 7),
  new Given('R6C2', 3),
  new Given('R6C6', 8),
  new Given('R6C7', 9),
  new Given('R7C1', 7),
  new Given('R7C5', 3),
  new Given('R7C6', 9),
  new Given('R8C1', 3),
  new Given('R8C4', 1),
  new Given('R9C2', 1),
  new Given('R9C3', 6),
  new Given('R9C8', 4),
];
