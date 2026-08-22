// Title: Fancy Vase
// Author: Qinlux
// Video: https://www.youtube.com/watch?v=fjWOgJqRWZI
// Source: https://app.crackingthecryptic.com/sudoku/GFhGQN4fB3

// Normal sudoku rules apply: standard row/column/box all-different, no
// additional clues, lines, cages, or overlays present in the payload.

return [
  new Shape('9x9'),

  new Given('R2C2', 2), new Given('R2C4', 9), new Given('R2C7', 3), new Given('R2C8', 8),
  new Given('R3C2', 3), new Given('R3C4', 1), new Given('R3C7', 7), new Given('R3C8', 5),
  new Given('R4C2', 4), new Given('R4C3', 8), new Given('R4C5', 2),
  new Given('R5C2', 5), new Given('R5C6', 6),
  new Given('R6C1', 7), new Given('R6C2', 6), new Given('R6C4', 5), new Given('R6C7', 4), new Given('R6C8', 1),
  new Given('R7C1', 4), new Given('R7C6', 3),
  new Given('R8C1', 2), new Given('R8C4', 8), new Given('R8C5', 4), new Given('R8C6', 5), new Given('R8C7', 6), new Given('R8C8', 7),
  new Given('R9C2', 7), new Given('R9C3', 5), new Given('R9C4', 2),
];
