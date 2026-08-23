// Title: 129 Columns
// Author: Philip Newman
// Video: https://www.youtube.com/watch?v=c35lhg7wyRc
// Source: https://app.crackingthecryptic.com/sudoku/fq3F2mrp4R

// Normal sudoku rules apply (1-9 in each row, column and 3x3 box). Standard
// 3x3 box regions -- Shape('9x9') supplies rows/columns/boxes, matching the
// 9 whole-box regions in the payload. No other clue types (lines, cages,
// arrows) appear in the payload; the puzzle is fully determined by its 27
// givens below.

// Givens, as drawn on the board (cell ids below are 1-indexed R#C#).
return [
  new Shape('9x9'),

  new Given('R2C2', 1),
  new Given('R2C3', 2),
  new Given('R2C4', 3),
  new Given('R2C5', 4),
  new Given('R2C7', 5),
  new Given('R2C8', 6),
  new Given('R3C2', 7),
  new Given('R3C4', 8),
  new Given('R3C9', 9),
  new Given('R4C3', 1),
  new Given('R4C5', 2),
  new Given('R4C7', 3),
  new Given('R5C3', 4),
  new Given('R5C5', 5),
  new Given('R5C7', 6),
  new Given('R6C3', 7),
  new Given('R6C5', 8),
  new Given('R6C7', 9),
  new Given('R7C1', 1),
  new Given('R7C6', 2),
  new Given('R7C8', 3),
  new Given('R8C2', 4),
  new Given('R8C3', 5),
  new Given('R8C5', 6),
  new Given('R8C6', 7),
  new Given('R8C7', 8),
  new Given('R8C8', 9),
];
