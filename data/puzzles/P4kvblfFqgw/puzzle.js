// Title: Classic Sudoku
// Author: Unknown
// Video: https://www.youtube.com/watch?v=P4kvblfFqgw
// Source: https://app.crackingthecryptic.com/webapp/t4BT9Qp97g

// Normal sudoku rules apply (1-9 in each row, column and 3x3 box). Standard
// 3x3 box regions -- Shape('9x9') supplies rows/columns/boxes, matching the
// 9 whole-box regions in the payload. No other clue types (lines, cages,
// arrows, overlays) appear in the payload; the puzzle is fully determined by
// its 25 givens below.

// Givens, as drawn on the board (cell ids below are 1-indexed R#C#).
return [
  new Shape('9x9'),

  new Given('R1C1', 5),
  new Given('R1C4', 6),
  new Given('R1C7', 9),
  new Given('R1C9', 7),
  new Given('R2C5', 2),
  new Given('R2C9', 5),
  new Given('R3C3', 3),
  new Given('R3C7', 4),
  new Given('R3C9', 6),
  new Given('R4C3', 8),
  new Given('R4C7', 5),
  new Given('R5C3', 5),
  new Given('R5C6', 9),
  new Given('R5C9', 4),
  new Given('R6C1', 1),
  new Given('R6C2', 2),
  new Given('R6C3', 6),
  new Given('R6C5', 4),
  new Given('R7C1', 8),
  new Given('R7C2', 6),
  new Given('R7C6', 7),
  new Given('R8C3', 9),
  new Given('R9C4', 1),
  new Given('R9C6', 8),
  new Given('R9C7', 7),
];
