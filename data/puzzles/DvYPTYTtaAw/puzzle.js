// Title: Classic Sudoku
// Author: Unknown
// Video: https://www.youtube.com/watch?v=DvYPTYTtaAw
// Source: https://app.crackingthecryptic.com/RD7TLLgtHD

// Normal sudoku rules apply (1-9 in each row, column and 3x3 box). Standard
// 3x3 box regions -- Shape('9x9') supplies rows/columns/boxes, matching the
// 9 whole-box regions in the payload. No other clue types (lines, cages,
// arrows) appear in the payload; the puzzle is fully determined by its 23
// givens below.

// Givens, as drawn on the board (cell ids below are 1-indexed R#C#).
return [
  new Shape('9x9'),

  new Given('R1C2', 3),
  new Given('R1C4', 4),
  new Given('R1C7', 1),
  new Given('R2C5', 1),
  new Given('R2C6', 8),
  new Given('R3C1', 6),
  new Given('R3C6', 3),
  new Given('R4C6', 9),
  new Given('R5C2', 8),
  new Given('R5C4', 5),
  new Given('R5C5', 3),
  new Given('R5C8', 7),
  new Given('R5C9', 2),
  new Given('R6C8', 4),
  new Given('R7C3', 3),
  new Given('R7C4', 9),
  new Given('R7C7', 4),
  new Given('R8C2', 2),
  new Given('R8C3', 4),
  new Given('R8C8', 6),
  new Given('R9C3', 5),
  new Given('R9C5', 7),
  new Given('R9C7', 9),
];
