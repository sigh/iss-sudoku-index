// Title: Classic Sudoku
// Author: Unknown
// Video: https://www.youtube.com/watch?v=o3PQrNecoag
// Source: https://app.crackingthecryptic.com/HRhGbt9qh9

// Rules: normal sudoku rules apply -- each row, column and 3x3 box contains
// 1-9 once each. There are no variant clues; the givens below are the whole
// puzzle. Row/column/box all-different come from the default 9x9 grid type.

return [
  new Shape('9x9'),

  // Givens, transcribed from the drawn grid (row-major).
  new Given('R1C1', 9),
  new Given('R1C7', 7),
  new Given('R2C3', 8),
  new Given('R2C4', 4),
  new Given('R2C6', 5),
  new Given('R3C2', 5),
  new Given('R3C6', 2),
  new Given('R3C9', 3),
  new Given('R4C1', 8),
  new Given('R4C5', 9),
  new Given('R5C3', 4),
  new Given('R5C7', 6),
  new Given('R6C5', 1),
  new Given('R6C9', 2),
  new Given('R7C1', 5),
  new Given('R7C4', 8),
  new Given('R7C8', 4),
  new Given('R8C4', 7),
  new Given('R8C6', 9),
  new Given('R8C7', 8),
  new Given('R9C3', 2),
  new Given('R9C9', 7),
];

