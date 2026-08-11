// Title: 7/26/22: A Third-Full Grid
// Author: Philip Newman
// Video: https://www.youtube.com/watch?v=S38_J6HNu58
// Source: https://tinyurl.com/bddskc42

// Rules: "Normal sudoku rules apply. And that's it!" -- standard row, column,
// and 3x3 box all-different constraints, no additional clues. Givens below
// are transcribed from the payload grid.

return [
  new Shape('9x9'),

  new Given('R1C1', 1),
  new Given('R1C3', 9),

  new Given('R2C2', 2),
  new Given('R2C4', 8),

  new Given('R3C3', 3),
  new Given('R3C5', 7),
  new Given('R3C7', 6),

  new Given('R4C2', 1),
  new Given('R4C4', 4),
  new Given('R4C6', 9),
  new Given('R4C8', 5),

  new Given('R5C1', 6),
  new Given('R5C3', 2),
  new Given('R5C5', 5),
  new Given('R5C7', 8),
  new Given('R5C9', 4),

  new Given('R6C2', 5),
  new Given('R6C4', 3),
  new Given('R6C6', 6),
  new Given('R6C8', 7),

  new Given('R7C3', 4),
  new Given('R7C5', 3),
  new Given('R7C7', 7),

  new Given('R8C6', 2),
  new Given('R8C8', 8),

  new Given('R9C7', 1),
  new Given('R9C9', 9),
];
