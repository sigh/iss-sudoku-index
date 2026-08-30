// Title: Classic Sudoku
// Author: Sam Cappleman-Lynes
// Video: https://www.youtube.com/watch?v=PKINPnYah1c
// Source: https://cracking-the-cryptic.web.app/sudoku/Dp2J38NHg7

// Standard sudoku: 9x9 grid, rows/columns/3x3 boxes all-different (default
// Sudoku shape). Only givens; the payload carries no other clues, cages,
// lines, or rules text.

return [
  new Shape('9x9'),

  // Givens transcribed from the drawn grid.
  new Given('R1C4', 1), new Given('R1C6', 2),
  new Given('R2C2', 3), new Given('R2C5', 4), new Given('R2C8', 1),
  new Given('R3C1', 5), new Given('R3C4', 6), new Given('R3C6', 7), new Given('R3C9', 8),
  new Given('R4C2', 7), new Given('R4C5', 1), new Given('R4C8', 2),
  new Given('R5C4', 4), new Given('R5C6', 9),
  new Given('R6C2', 5), new Given('R6C5', 2), new Given('R6C8', 3),
  new Given('R7C1', 8), new Given('R7C4', 9), new Given('R7C6', 1), new Given('R7C9', 6),
  new Given('R8C2', 1), new Given('R8C5', 7), new Given('R8C8', 5),
  new Given('R9C4', 3), new Given('R9C6', 4),
];
