// Title: July 12, 2023: Mr. Rightside
// Author: Philip Newman
// Video: https://www.youtube.com/watch?v=Wwm1MZqLneE
// Source: https://tinyurl.com/3rccempd

// Rules encoded: normal sudoku; both marked diagonals no-repeat
// (`diagonal+` and `diagonal-` in the payload, matching the rules text's
// plural "diagonals").

// Givens, transcribed from the payload's `grid` cells (row-major, all in
// columns 6-9).
const givens = [
  new Given('R1C6', 9), new Given('R1C7', 6), new Given('R1C8', 1),
  new Given('R2C6', 8), new Given('R2C7', 5), new Given('R2C9', 9),
  new Given('R3C6', 7), new Given('R3C8', 3), new Given('R3C9', 8),
  new Given('R4C7', 3), new Given('R4C8', 5), new Given('R4C9', 7),
  new Given('R5C6', 5), new Given('R5C7', 2), new Given('R5C8', 8), new Given('R5C9', 4),
  new Given('R6C7', 1), new Given('R6C8', 9), new Given('R6C9', 6),
  new Given('R7C6', 3), new Given('R7C8', 4), new Given('R7C9', 1),
  new Given('R8C6', 2), new Given('R8C7', 8), new Given('R8C9', 5),
  new Given('R9C6', 1), new Given('R9C7', 7), new Given('R9C8', 2),
];

return [
  new Shape('9x9'),
  ...givens,
  new Diagonal(1),
  new Diagonal(-1),
];
