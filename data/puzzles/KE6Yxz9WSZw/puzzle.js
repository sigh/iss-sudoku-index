// Title: Classic Sudoku
// Author: Unknown
// Video: https://www.youtube.com/watch?v=KE6Yxz9WSZw
// Source: https://sudokupad.app/68TFtr3J9N

// Normal sudoku rules apply: standard row/column/box all-different (ISS
// default), plus the printed givens below. No other clues or geometry.

return [
  new Shape('9x9'),
  new Given('R1C4', 2),
  new Given('R1C7', 7),
  new Given('R1C8', 8),
  new Given('R2C2', 8),
  new Given('R2C7', 1),
  new Given('R3C3', 1),
  new Given('R3C4', 9),
  new Given('R4C3', 3),
  new Given('R4C6', 5),
  new Given('R5C6', 7),
  new Given('R5C7', 8),
  new Given('R6C2', 2),
  new Given('R6C9', 9),
  new Given('R7C1', 8),
  new Given('R7C4', 1),
  new Given('R7C7', 5),
  new Given('R7C8', 6),
  new Given('R8C2', 6),
  new Given('R8C4', 3),
  new Given('R8C8', 2),
  new Given('R9C6', 4),
];
