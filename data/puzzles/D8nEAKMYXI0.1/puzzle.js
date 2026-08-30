// Title: Unknown
// Author: Unknown
// Video: https://www.youtube.com/watch?v=D8nEAKMYXI0
// Source: https://cracking-the-cryptic.web.app/sudoku/Tdmr6HFm8h

// Classic 9x9 sudoku: standard row/column/box all-different rules, no
// additional rules. The payload's regions are the canonical 3x3 boxes, which
// Shape('9x9') already provides by default.

return [
  new Shape('9x9'),

  // Givens, as drawn on the board.
  new Given('R1C5', 9),
  new Given('R2C2', 2), new Given('R2C6', 8), new Given('R2C8', 6),
  new Given('R3C3', 8), new Given('R3C5', 3), new Given('R3C7', 9), new Given('R3C9', 1),
  new Given('R4C4', 4), new Given('R4C6', 7), new Given('R4C7', 8),
  new Given('R5C2', 7), new Given('R5C5', 2), new Given('R5C8', 5),
  new Given('R6C3', 1), new Given('R6C4', 9), new Given('R6C6', 3),
  new Given('R7C1', 9), new Given('R7C3', 2), new Given('R7C5', 1), new Given('R7C7', 3),
  new Given('R8C2', 4), new Given('R8C4', 3), new Given('R8C8', 8),
  new Given('R9C5', 7),
];
