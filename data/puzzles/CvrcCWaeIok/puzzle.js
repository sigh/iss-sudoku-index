// Title: Classic Sudoku Bonus: NYT Hard April 1st
// Author: Unknown
// Video: https://www.youtube.com/watch?v=CvrcCWaeIok
// Source: https://cracking-the-cryptic.web.app/sudoku/FNhnhGL6DM

// Standard classic sudoku: rows, columns, and the nine 3x3 boxes each contain
// 1-9 once. No other rules. The solver's default row/column/box constraints
// apply, so only the shape and givens are listed below.

return [
  new Shape('9x9'),

  new Given('R1C5', 3),
  new Given('R1C7', 6),
  new Given('R2C1', 6),
  new Given('R2C3', 5),
  new Given('R3C2', 9),
  new Given('R3C4', 8),
  new Given('R3C7', 1),
  new Given('R4C1', 7),
  new Given('R4C2', 6),
  new Given('R4C9', 2),
  new Given('R5C3', 9),
  new Given('R5C4', 7),
  new Given('R6C2', 3),
  new Given('R6C3', 1),
  new Given('R6C6', 2),
  new Given('R6C9', 4),
  new Given('R7C4', 1),
  new Given('R7C7', 7),
  new Given('R8C2', 2),
  new Given('R8C6', 9),
  new Given('R9C2', 7),
  new Given('R9C5', 4),
  new Given('R9C6', 3),
  new Given('R9C9', 5),
];
