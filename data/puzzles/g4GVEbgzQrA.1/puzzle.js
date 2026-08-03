// Title: Born Slippy
// Author: Bill Murphy
// Video: https://www.youtube.com/watch?v=g4GVEbgzQrA
// Source: https://tinyurl.com/me3xn7xn

// Plain classic sudoku: rows, columns, and 3x3 boxes each contain 1-9. No
// cages, lines, arrows, or other overlay geometry are present in the source
// payload.
//
// Givens transcribed from the source's grid data.

return [
  new Shape('9x9'),
  new Given('R2C1', 5), new Given('R2C3', 8), new Given('R2C7', 9), new Given('R2C9', 3),
  new Given('R3C2', 7), new Given('R3C4', 1), new Given('R3C6', 2), new Given('R3C8', 6),
  new Given('R4C3', 5), new Given('R4C5', 8), new Given('R4C7', 4),
  new Given('R5C4', 5), new Given('R5C6', 6),
  new Given('R6C3', 6), new Given('R6C5', 2), new Given('R6C7', 5),
  new Given('R7C2', 1), new Given('R7C4', 2), new Given('R7C6', 3), new Given('R7C8', 7),
  new Given('R8C1', 7), new Given('R8C3', 9), new Given('R8C7', 1), new Given('R8C9', 8),
];
