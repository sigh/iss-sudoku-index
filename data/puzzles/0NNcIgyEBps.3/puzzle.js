// Title: Unknown
// Author: Unknown
// Video: https://www.youtube.com/watch?v=0NNcIgyEBps
// Source: https://cracking-the-cryptic.web.app/sudoku/jjPp4LNbBH

// Normal sudoku rules apply (1-9 in each row, column and 3x3 box). Standard
// 3x3 box regions -- Shape('9x9') supplies rows/columns/boxes, matching the
// 9 whole-box regions in the payload. No other clue types (cages, lines,
// arrows) appear in the payload; the puzzle is fully determined by its 23
// givens below.

// Givens, as drawn on the board (cell ids below are 1-indexed R#C#).
return [
  new Shape('9x9'),

  new Given('R1C6', 5),
  new Given('R1C7', 3),
  new Given('R1C9', 2),
  new Given('R2C3', 6),
  new Given('R2C5', 3),
  new Given('R2C7', 9),
  new Given('R3C2', 8),
  new Given('R3C6', 9),
  new Given('R3C8', 7),
  new Given('R4C4', 1),
  new Given('R4C7', 8),
  new Given('R5C2', 7),
  new Given('R5C8', 9),
  new Given('R5C9', 5),
  new Given('R6C3', 1),
  new Given('R6C5', 6),
  new Given('R6C7', 2),
  new Given('R7C2', 5),
  new Given('R7C3', 4),
  new Given('R8C3', 2),
  new Given('R9C1', 8),
  new Given('R9C2', 1),
  new Given('R9C9', 6),
];
