// Title: Master The Basics Of Advanced Sudoku Solving
// Author: Unknown
// Video: https://www.youtube.com/watch?v=-24S4mHY73w
// Source: https://cracking-the-cryptic.web.app/sudoku/r8qHDTpBDf
//
// Standard 9x9 sudoku. The payload carries no rules text and no clue
// geometry beyond the givens and the standard 3x3 box regions (its
// `regions` array lists exactly the nine ordinary boxes), so this is a
// vanilla sudoku: rows, columns and boxes each contain 1-9 once, plus the
// givens below.

// Givens, transcribed from the source payload's cell grid.
const givens = [
  new Given('R1C2', 7), new Given('R1C3', 2), new Given('R1C6', 9),
  new Given('R2C2', 3), new Given('R2C4', 6), new Given('R2C7', 4),
  new Given('R3C3', 1), new Given('R3C8', 8), new Given('R3C9', 7),
  new Given('R4C1', 1), new Given('R4C7', 7),
  new Given('R5C1', 9), new Given('R5C4', 2), new Given('R5C6', 3),
  new Given('R6C9', 6),
  new Given('R7C4', 3), new Given('R7C7', 5), new Given('R7C8', 6),
  new Given('R8C6', 4), new Given('R8C7', 9),
  new Given('R9C5', 1), new Given('R9C6', 8), new Given('R9C9', 2),
];

return [
  new Shape('9x9'),
  ...givens,
];
