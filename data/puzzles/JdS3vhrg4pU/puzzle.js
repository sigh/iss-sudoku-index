// Title: Classic Sudoku
// Author: Sam Cappleman-Lynes
// Video: https://www.youtube.com/watch?v=JdS3vhrg4pU
// Source: https://cracking-the-cryptic.web.app/sudoku/327nnPHRFJ

// Classic Sudoku: default row, column, and 3x3 box all-different rules.
// The source payload has no rules text and no additional clues or geometry.
return [
  new Shape('9x9'),
  new Given('R1C2', 2), new Given('R1C8', 3),
  new Given('R2C1', 4), new Given('R2C9', 7),
  new Given('R3C3', 1), new Given('R3C4', 2), new Given('R3C5', 3), new Given('R3C7', 4),
  new Given('R4C3', 4), new Given('R4C4', 1), new Given('R4C5', 5), new Given('R4C7', 3),
  new Given('R5C3', 5), new Given('R5C4', 6), new Given('R5C5', 4), new Given('R5C7', 1),
  new Given('R7C3', 2), new Given('R7C4', 5), new Given('R7C5', 1), new Given('R7C7', 6),
  new Given('R8C1', 5), new Given('R8C8', 9),
  new Given('R9C2', 8), new Given('R9C9', 5),
];
