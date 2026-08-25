// Title: Classic Sudoku
// Author: Oku-Yama
// Video: https://www.youtube.com/watch?v=mlLq8qaTLBo
// Source: https://app.crackingthecryptic.com/bFpqm46PhQ

// Normal sudoku rules apply (1-9 in each row, column and 3x3 box). Standard
// 3x3 box regions -- Shape('9x9') supplies rows/columns/boxes, matching the
// 9 whole-box regions in the payload. No other clue types (lines, cages,
// arrows) appear in the payload; the puzzle is fully determined by its 25
// givens below.

// Givens, as drawn on the board (cell ids below are 1-indexed R#C#).
return [
  new Shape('9x9'),

  new Given('R1C1', 7),
  new Given('R1C3', 5),
  new Given('R1C8', 8),
  new Given('R2C2', 8),
  new Given('R2C7', 7),
  new Given('R2C8', 5),
  new Given('R2C9', 2),
  new Given('R3C1', 2),
  new Given('R3C3', 9),
  new Given('R3C8', 1),
  new Given('R4C4', 6),
  new Given('R4C6', 9),
  new Given('R5C5', 7),
  new Given('R6C4', 1),
  new Given('R6C6', 2),
  new Given('R7C2', 5),
  new Given('R7C7', 9),
  new Given('R7C9', 4),
  new Given('R8C1', 3),
  new Given('R8C2', 6),
  new Given('R8C3', 1),
  new Given('R8C8', 7),
  new Given('R9C2', 7),
  new Given('R9C7', 6),
  new Given('R9C9', 1),
];
