// Title: Classic Sudoku
// Author: Unknown
// Video: https://www.youtube.com/watch?v=EIuBQ3vXv2Y
// Source: https://app.crackingthecryptic.com/webapp/RRTmPhL2r6

// Classic Sudoku: default row, column, and 3x3 box all-different rules.
// The source payload's regions are exactly the nine standard 3x3 boxes, and
// there is no additional clue geometry (no cages, lines, arrows, overlays).

// Givens, transcribed from the source grid in row-major order.
return [
  new Shape('9x9'),

  new Given('R1C3', 4),
  new Given('R2C5', 6),
  new Given('R2C7', 9),
  new Given('R2C8', 7),
  new Given('R3C2', 6),
  new Given('R3C3', 1),
  new Given('R3C6', 7),
  new Given('R4C1', 9),
  new Given('R4C5', 2),
  new Given('R4C9', 4),
  new Given('R5C1', 4),
  new Given('R5C2', 2),
  new Given('R5C4', 3),
  new Given('R5C6', 9),
  new Given('R5C8', 1),
  new Given('R5C9', 7),
  new Given('R6C1', 6),
  new Given('R6C5', 7),
  new Given('R6C9', 5),
  new Given('R7C4', 2),
  new Given('R7C7', 8),
  new Given('R7C8', 3),
  new Given('R8C2', 8),
  new Given('R8C3', 6),
  new Given('R8C5', 3),
  new Given('R9C7', 7),
];
