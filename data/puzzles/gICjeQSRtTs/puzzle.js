// Title: unknown
// Author: Unknown
// Video: https://www.youtube.com/watch?v=gICjeQSRtTs
// Source: https://cracking-the-cryptic.web.app/sudoku/2F73fd4hpd

// Classic sudoku: standard row/column/box all-different rules only, no
// additional clues. The source payload carries no rules text, no cages, and
// no lines; its region geometry matches the standard 3x3 boxes, so the
// default Sudoku grid already covers them.

return [
  new Shape('9x9'),

  // Givens transcribed from the source payload's cells.
  new Given('R1C7', 6), new Given('R1C8', 3),
  new Given('R2C4', 2), new Given('R2C8', 4), new Given('R2C9', 1),
  new Given('R3C3', 9), new Given('R3C4', 4), new Given('R3C5', 3),
  new Given('R4C5', 2), new Given('R4C6', 7), new Given('R4C7', 5),
  new Given('R5C1', 7), new Given('R5C2', 8), new Given('R5C6', 5),
  new Given('R6C2', 9), new Given('R6C3', 1),
  new Given('R7C2', 2), new Given('R7C3', 3),
  new Given('R8C1', 4), new Given('R8C2', 5), new Given('R8C8', 1), new Given('R8C9', 6),
  new Given('R9C7', 7), new Given('R9C8', 5),
];
