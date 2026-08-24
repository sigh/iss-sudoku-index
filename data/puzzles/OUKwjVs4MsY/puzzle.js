// Title: Classic Sudoku
// Author: Sam Cappleman-Lynes
// Video: https://www.youtube.com/watch?v=OUKwjVs4MsY
// Source: https://app.crackingthecryptic.com/sudoku/RL3rDQjLHg

// Normal sudoku rules apply. Standard 9x9 grid with default row, column, and
// 3x3 box all-different constraints (Shape('9x9')); no other clues are drawn.

return [
  new Shape('9x9'),
  new Given('R2C3', 8), new Given('R2C5', 4), new Given('R2C7', 1),
  new Given('R3C2', 1), new Given('R3C4', 2), new Given('R3C6', 3), new Given('R3C8', 9),
  new Given('R4C3', 4), new Given('R4C7', 6),
  new Given('R5C2', 7), new Given('R5C8', 2),
  new Given('R6C3', 1), new Given('R6C7', 5),
  new Given('R7C2', 2), new Given('R7C4', 3), new Given('R7C6', 7), new Given('R7C8', 1),
  new Given('R8C3', 5), new Given('R8C5', 6), new Given('R8C7', 4),
];
