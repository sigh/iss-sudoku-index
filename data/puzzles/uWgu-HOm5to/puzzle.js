// Title: Classic Sudoku
// Author: Topi Linkala
// Video: https://www.youtube.com/watch?v=uWgu-HOm5to
// Source: https://app.crackingthecryptic.com/sudoku/FmjLRJrr7d

// Normal sudoku rules apply: 1-9 once each in every row, column and box.
// No other rules are stated. Givens transcribed from the payload's cell grid.
const givens = [
  new Given('R1C7', 9),
  new Given('R2C1', 5),
  new Given('R2C8', 1),
  new Given('R2C9', 8),
  new Given('R3C2', 2),
  new Given('R3C3', 8),
  new Given('R3C6', 7),
  new Given('R3C8', 4),
  new Given('R4C4', 1),
  new Given('R4C6', 5),
  new Given('R4C9', 9),
  new Given('R5C2', 9),
  new Given('R5C5', 3),
  new Given('R5C8', 6),
  new Given('R6C1', 4),
  new Given('R6C4', 9),
  new Given('R6C6', 2),
  new Given('R7C2', 3),
  new Given('R7C4', 5),
  new Given('R7C7', 6),
  new Given('R7C8', 2),
  new Given('R8C1', 2),
  new Given('R8C2', 8),
  new Given('R8C9', 1),
  new Given('R9C3', 6),
];

return [
  new Shape('9x9'),
  ...givens,
];
