// Title: Jun 13, 2021: Classic Sudoku
// Author: Sam Cappleman-Lynes
// Video: https://www.youtube.com/watch?v=luvtr28cGB8
// Source: https://tinyurl.com/3j57es4f

// Rules: "Normal sudoku rules apply. And that's it!" -- standard row, column,
// and 3x3 box all-different constraints, no additional clues. Givens below
// are transcribed from the payload grid.

return [
  new Shape('9x9'),

  new Given('R2C2', 1),
  new Given('R2C3', 2),
  new Given('R2C4', 3),
  new Given('R2C6', 4),
  new Given('R2C7', 5),
  new Given('R2C8', 6),

  new Given('R3C2', 3),
  new Given('R3C6', 1),
  new Given('R3C8', 7),

  new Given('R4C2', 8),
  new Given('R4C4', 9),
  new Given('R4C6', 5),
  new Given('R4C7', 3),
  new Given('R4C8', 1),

  new Given('R5C2', 9),
  new Given('R5C3', 4),
  new Given('R5C4', 6),
  new Given('R5C6', 3),
  new Given('R5C8', 2),

  new Given('R7C5', 3),
  new Given('R7C6', 8),
  new Given('R7C7', 1),

  new Given('R8C5', 7),

  new Given('R9C3', 6),
  new Given('R9C4', 5),
  new Given('R9C5', 9),
];
