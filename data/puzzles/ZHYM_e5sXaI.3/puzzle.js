// Title: Dec. 31, 2022: Classic Sudoku
// Author: clover!
// Video: https://www.youtube.com/watch?v=ZHYM_e5sXaI
// Source: https://tinyurl.com/3sedndtp

// Normal sudoku rules apply, and that's it. Row/column/box all-different are
// the engine's automatic baseline, so this script is only the shape and the
// given digits.
return [
  new Shape('9x9'),
  new Given('R1C2', 1),
  new Given('R1C3', 2),
  new Given('R2C2', 6),
  new Given('R2C3', 4),
  new Given('R2C8', 8),
  new Given('R2C9', 3),
  new Given('R3C6', 5),
  new Given('R3C8', 6),
  new Given('R3C9', 4),
  new Given('R4C3', 3),
  new Given('R4C5', 8),
  new Given('R5C4', 2),
  new Given('R5C6', 9),
  new Given('R6C5', 1),
  new Given('R6C7', 7),
  new Given('R7C1', 8),
  new Given('R7C2', 2),
  new Given('R7C4', 1),
  new Given('R8C1', 7),
  new Given('R8C2', 4),
  new Given('R8C7', 9),
  new Given('R8C8', 2),
  new Given('R9C7', 6),
  new Given('R9C8', 5),
];
