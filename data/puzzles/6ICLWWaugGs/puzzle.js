// Title: Hanabi
// Author: shye
// Video: https://www.youtube.com/watch?v=6ICLWWaugGs
// Source: https://app.crackingthecryptic.com/sudoku/dgj3Gj84Qh

// Normal sudoku rules apply (1-9 in each row, column and 3x3 box). Standard
// 3x3 box regions -- Shape('9x9') supplies rows/columns/boxes, matching the
// 9 whole-box regions in the payload. No other clue types (lines, cages,
// arrows) appear in the payload; the puzzle is fully determined by its 33
// givens below.

// Givens, as drawn on the board (cell ids below are 1-indexed R#C#).
return [
  new Shape('9x9'),

  new Given('R1C2', 1),
  new Given('R1C3', 2),
  new Given('R1C5', 7),
  new Given('R1C7', 3),
  new Given('R1C8', 5),
  new Given('R2C1', 3),
  new Given('R2C4', 2),
  new Given('R2C6', 1),
  new Given('R2C7', 4),
  new Given('R2C9', 7),
  new Given('R3C1', 4),
  new Given('R3C4', 5),
  new Given('R3C8', 1),
  new Given('R3C9', 6),
  new Given('R4C1', 2),
  new Given('R4C8', 7),
  new Given('R5C1', 1),
  new Given('R5C2', 6),
  new Given('R5C5', 8),
  new Given('R5C9', 2),
  new Given('R6C2', 4),
  new Given('R6C3', 8),
  new Given('R6C7', 6),
  new Given('R6C8', 3),
  new Given('R7C4', 8),
  new Given('R7C9', 4),
  new Given('R8C4', 1),
  new Given('R8C5', 5),
  new Given('R8C9', 3),
  new Given('R9C5', 4),
  new Given('R9C6', 3),
  new Given('R9C7', 1),
  new Given('R9C8', 2),
];
