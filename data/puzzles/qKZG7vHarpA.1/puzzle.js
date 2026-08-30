// Title: Unknown
// Author: Unknown
// Video: https://www.youtube.com/watch?v=qKZG7vHarpA
// Source: https://cracking-the-cryptic.web.app/sudoku/rF2T9RrqRL
//
// Standard 9x9 sudoku. The payload carries no rules text and no clue
// geometry beyond the givens and the standard 3x3 box regions (its
// `regions` array lists exactly the nine ordinary boxes), so this is a
// vanilla sudoku: rows, columns and boxes each contain 1-9 once, plus the
// givens below.

// Givens, transcribed from the source payload's cell grid.
const givens = [
  new Given('R1C1', 6), new Given('R1C2', 9), new Given('R1C3', 8),
  new Given('R2C5', 7), new Given('R2C6', 3), new Given('R2C7', 5),
  new Given('R3C6', 8), new Given('R3C7', 9), new Given('R3C8', 4),
  new Given('R4C4', 5), new Given('R4C7', 6), new Given('R4C8', 2),
  new Given('R5C3', 6), new Given('R5C5', 4), new Given('R5C8', 1),
  new Given('R6C2', 3), new Given('R6C3', 2), new Given('R6C6', 9),
  new Given('R7C4', 3), new Given('R7C5', 1), new Given('R7C9', 5),
  new Given('R8C1', 1), new Given('R8C4', 7), new Given('R8C9', 2),
  new Given('R9C1', 8), new Given('R9C2', 4), new Given('R9C9', 7),
];

return [
  new Shape('9x9'),
  ...givens,
];
