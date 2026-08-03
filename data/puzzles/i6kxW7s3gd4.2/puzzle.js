// Title: May 21, 2023: 129 Wingman
// Author: Philip Newman
// Video: https://www.youtube.com/watch?v=i6kxW7s3gd4
// Source: https://tinyurl.com/ysdyce2y

// Rules: "Normal sudoku rules apply. And that's it!" -- standard row, column,
// and 3x3 box all-different, enforced by default Shape('9x9'). No other
// constraints. Givens transcribed from the source's given-cell grid.

return [
  new Shape('9x9'),
  new Given('R1C3', 1), new Given('R1C5', 2), new Given('R1C9', 3),
  new Given('R2C4', 4), new Given('R2C6', 5), new Given('R2C8', 6),
  new Given('R3C5', 7), new Given('R3C7', 8), new Given('R3C9', 9),
  new Given('R4C4', 1), new Given('R4C6', 2), new Given('R4C8', 3),
  new Given('R5C1', 4), new Given('R5C5', 5), new Given('R5C9', 6),
  new Given('R6C2', 7), new Given('R6C4', 8), new Given('R6C6', 9),
  new Given('R7C1', 1), new Given('R7C3', 2), new Given('R7C5', 3),
  new Given('R8C2', 4), new Given('R8C4', 5), new Given('R8C6', 6),
  new Given('R9C1', 7), new Given('R9C5', 8), new Given('R9C7', 9),
];
