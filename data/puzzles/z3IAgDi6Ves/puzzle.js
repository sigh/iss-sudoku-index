// Title: Kingda Ka
// Author: shye
// Video: https://www.youtube.com/watch?v=z3IAgDi6Ves
// Source: https://app.crackingthecryptic.com/sudoku/tGHMpB9QLJ

// Normal sudoku rules apply (1-9 in each row, column and 3x3 box). Standard
// 3x3 box regions -- Shape('9x9') supplies rows/columns/boxes, matching the
// 9 whole-box regions in the payload. No other clue types (lines, cages,
// arrows) appear in the payload; the puzzle is fully determined by its 22
// givens below.

// Givens, as drawn on the board (cell ids below are 1-indexed R#C#).
return [
  new Shape('9x9'),

  new Given('R1C4', 4),
  new Given('R1C6', 6),
  new Given('R2C2', 1),
  new Given('R2C3', 2),
  new Given('R2C5', 3),
  new Given('R2C7', 5),
  new Given('R3C8', 7),
  new Given('R4C1', 8),
  new Given('R4C6', 4),
  new Given('R4C9', 7),
  new Given('R5C2', 6),
  new Given('R5C4', 7),
  new Given('R5C8', 5),
  new Given('R6C1', 5),
  new Given('R6C5', 8),
  new Given('R6C9', 9),
  new Given('R7C3', 3),
  new Given('R7C8', 2),
  new Given('R8C5', 9),
  new Given('R8C8', 1),
  new Given('R9C4', 3),
  new Given('R9C6', 5),
];
