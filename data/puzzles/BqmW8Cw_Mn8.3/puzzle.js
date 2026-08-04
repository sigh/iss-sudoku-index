// Title: big time
// Author: bill murphy
// Video: https://www.youtube.com/watch?v=BqmW8Cw_Mn8
// Source: https://tinyurl.com/ypdm4etm

// Normal Sudoku rules apply: row, column, and 3x3 box all-different. No
// additional clues are drawn or stated. Given digits transcribed from the
// payload grid.
return [
  new Shape('9x9'),
  new Given('R1C1', 3),
  new Given('R1C3', 4),
  new Given('R2C5', 9),
  new Given('R2C8', 7),
  new Given('R3C1', 5),
  new Given('R3C3', 6),
  new Given('R3C4', 7),
  new Given('R4C4', 6),
  new Given('R4C6', 8),
  new Given('R4C7', 4),
  new Given('R5C2', 2),
  new Given('R5C8', 8),
  new Given('R6C3', 3),
  new Given('R6C4', 2),
  new Given('R6C6', 7),
  new Given('R7C6', 1),
  new Given('R7C7', 3),
  new Given('R7C9', 4),
  new Given('R8C2', 1),
  new Given('R8C5', 2),
  new Given('R9C7', 5),
  new Given('R9C9', 6),
];
