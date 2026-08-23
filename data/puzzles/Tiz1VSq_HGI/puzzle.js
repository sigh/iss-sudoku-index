// Title: Classic Sudoku
// Author: Lars Muller
// Video: https://www.youtube.com/watch?v=Tiz1VSq_HGI
// Source: https://app.crackingthecryptic.com/sudoku/TMtFqgHnPp

// Normal sudoku rules apply (1-9 in each row, column and 3x3 box). Standard
// 3x3 box regions -- Shape('9x9') supplies rows/columns/boxes, matching the
// 9 whole-box regions in the payload. No other clue types (lines, cages,
// arrows) appear in the payload; the puzzle is fully determined by its 28
// givens below.

// Givens, as drawn on the board (cell ids below are 1-indexed R#C#).
return [
  new Shape('9x9'),

  new Given('R1C1', 1),
  new Given('R1C5', 6),
  new Given('R1C9', 4),
  new Given('R2C2', 2),
  new Given('R2C4', 5),
  new Given('R2C6', 3),
  new Given('R2C8', 6),
  new Given('R3C3', 3),
  new Given('R3C7', 8),
  new Given('R4C2', 1),
  new Given('R4C4', 4),
  new Given('R4C6', 2),
  new Given('R4C8', 5),
  new Given('R5C1', 4),
  new Given('R5C9', 2),
  new Given('R6C2', 5),
  new Given('R6C4', 1),
  new Given('R6C6', 6),
  new Given('R6C8', 7),
  new Given('R7C3', 9),
  new Given('R7C7', 7),
  new Given('R8C2', 7),
  new Given('R8C4', 9),
  new Given('R8C6', 5),
  new Given('R8C8', 8),
  new Given('R9C1', 3),
  new Given('R9C5', 8),
  new Given('R9C9', 9),
];
