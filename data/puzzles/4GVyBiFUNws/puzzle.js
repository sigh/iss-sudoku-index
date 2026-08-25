// Title: Classic Sudoku
// Author: Unknown
// Video: https://www.youtube.com/watch?v=4GVyBiFUNws
// Source: https://app.crackingthecryptic.com/9pT63LL6qm

// Normal sudoku rules apply (1-9 in each row, column and 3x3 box). Standard
// 3x3 box regions -- Shape('9x9') supplies rows/columns/boxes, matching the
// 9 whole-box regions in the payload. No other clue types (lines, cages,
// arrows) appear in the payload; the puzzle is fully determined by its 24
// givens below.

// Givens, as drawn on the board (cell ids below are 1-indexed R#C#).
return [
  new Shape('9x9'),

  new Given('R1C2', 8),
  new Given('R1C5', 2),
  new Given('R1C7', 5),
  new Given('R1C8', 6),
  new Given('R2C4', 1),
  new Given('R2C9', 7),
  new Given('R4C2', 5),
  new Given('R4C5', 9),
  new Given('R4C7', 4),
  new Given('R4C9', 8),
  new Given('R5C3', 7),
  new Given('R5C4', 8),
  new Given('R5C9', 3),
  new Given('R6C2', 9),
  new Given('R6C5', 1),
  new Given('R6C8', 5),
  new Given('R7C1', 2),
  new Given('R7C3', 4),
  new Given('R7C7', 8),
  new Given('R8C2', 6),
  new Given('R8C5', 8),
  new Given('R8C6', 5),
  new Given('R9C4', 2),
  new Given('R9C7', 1),
];
