// Title: 9/21/22: "wrong answers only"
// Author: Philip Newman
// Video: https://www.youtube.com/watch?v=vZ-qiES6VVY
// Source: https://tinyurl.com/yc86bz8z

// Rules: "Normal sudoku rules apply. And that's it!" -- standard row, column,
// and 3x3 box all-different constraints, no additional clues. Givens below
// are transcribed from the payload grid.

return [
  new Shape('9x9'),

  new Given('R1C1', 1),
  new Given('R1C4', 5),
  new Given('R1C6', 9),
  new Given('R1C9', 2),

  new Given('R2C2', 2),
  new Given('R2C8', 4),

  new Given('R3C3', 3),
  new Given('R3C5', 2),
  new Given('R3C7', 6),

  new Given('R4C1', 7),
  new Given('R4C4', 4),
  new Given('R4C6', 8),
  new Given('R4C9', 5),

  new Given('R5C3', 4),
  new Given('R5C5', 5),
  new Given('R5C7', 1),

  new Given('R6C1', 5),
  new Given('R6C4', 7),
  new Given('R6C6', 6),
  new Given('R6C9', 3),

  new Given('R7C3', 9),
  new Given('R7C5', 8),
  new Given('R7C7', 7),

  new Given('R8C2', 1),
  new Given('R8C8', 8),

  new Given('R9C1', 3),
  new Given('R9C4', 6),
  new Given('R9C6', 5),
  new Given('R9C9', 9),
];
